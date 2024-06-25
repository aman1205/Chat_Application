import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import Avatar from "./Avatar";
import { UserContext } from "../UserContext";
import { uniqBy } from "lodash";
import Navbar from "./Navbar";
import ChatNav from "./ChatNav";
import SearchBar from "./SearchBar";
import UserList from "./UserList";
import Button from "./Button";
import MessageComponent from "./Messages";

const Main = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id, setId, setUserName } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectUser, setSelectedUser] = useState(null);


  const handleMessage = useCallback((e) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, messageData]);
    }
  }, []);

  const connectToWs = useCallback(() => {
    const ws = new WebSocket("ws://localhost:5000");
    setWs(ws);
    
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    });

    return () => {
      ws.removeEventListener("message", handleMessage);
      ws.close();
    };
  }, [handleMessage]);

  useEffect(() => {
    connectToWs();
  }, [connectToWs]);

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, Username, profilePhoto }) => {
      if (userId) {
        people[userId] = { username: Username, profilePhoto, id: userId };
      }
    });
    setOnlinePeople(people);
  };

  

  const sendMessage = async (e) => {
    e.preventDefault();
    if (ws) {
      ws.send(JSON.stringify({ recipient: selectedUserId, text: newMessageText }));
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (selectedUserId) {
          const response = await axios.get(`http://localhost:5000/api/messages/${selectedUserId}`);
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedUserId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/alluser");
        const offlinePeopleArr = response.data
          .filter((p) => p._id !== id)
          .filter((p) => !Object.keys(onlinePeople).includes(p._id));

        const offlinePeopleObj = {};
        offlinePeopleArr.forEach((p) => {
          offlinePeopleObj[p._id] = p;
        });
        setOfflinePeople(offlinePeopleObj);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [onlinePeople, id]);

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout");
      setId(null);
      setUserName(null);
      setWs(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const findSelectedUser = useCallback((userId) => {
    if (onlinePeople[userId]) {
      setSelectedUser(onlinePeople[userId].username);
    } else if (offlinePeople[userId]) {
      setSelectedUser(offlinePeople[userId].name);
    }
  }, [onlinePeople, offlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      findSelectedUser(selectedUserId);
    }
  }, [selectedUserId, findSelectedUser]);

  const messageWithoutDuo = uniqBy(messages, "_id");
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];


  return (
    <div className="flex h-screen">
      <div className="bg-[#F5F6FA] w-1/3 flex flex-col justify-center items-center gap-2">
        <Navbar username={username} />
        <div className="flex-grow w-5/6 bg-white shadow-2xl rounded-2xl text-center flex flex-col items-center mt-4 mb-6">
          <SearchBar />
          <UserList
            onlinePeopleExclOurUser={onlinePeopleExclOurUser}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            offlinePeople={offlinePeople}
          />
        </div>
        <button onClick={logout} className="bg-red-500 text-white p-2 rounded-2xl ">Logout</button>
      </div>

      <div className="flex flex-col bg-[#F5F6FA] w-2/3 p-4">
        {selectedUserId && <ChatNav name={selectUser} />}
        <div className="flex-grow">
          {!selectedUserId ? (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-black">
                Chat With Your Friends
                <br />
                Send and Receive Messages to others with encryption
              </div>
            </div>
          ) : (
            <MessageComponent messages={messages} messageWithoutDuo={messageWithoutDuo} />
          )}
        </div>

        {selectedUserId && (
          <form className="flex gap-2 justify-center items-center" onSubmit={sendMessage}>
            <div className="relative w-5/6">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-black"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="search"
                placeholder="Type a message"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="block w-full p-4 ps-10 text-sm border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 shadow-2xl rounded-2xl"
                required
              />
              <Button />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Main;
