import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import api from "../axios";
import { uniqBy } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./Navbar";
import ChatNav from "./ChatNav";
import SearchBar from "./SearchBar";
import UserList from "./UserList";
import Button from "./Button";
import MessageComponent from "./Messages";
import { logout } from "../redux/actions/authActions";
import { WS_URL } from "../constant";

api.defaults.withCredentials = true;

const Main = () => {
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectUser, setSelectedUser] = useState(null);
  const user = useSelector((state) => state.authReducer.user);
  const ws = useRef(null);
  const dispatch = useDispatch();


  const showOnlinePeople = useCallback((peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username, profilePhoto }) => {
      if (userId) {
        people[userId] = { username, profilePhoto, id: userId };
      }
    });
    setOnlinePeople((prevOnlinePeople) => {
      if (JSON.stringify(prevOnlinePeople) !== JSON.stringify(people)) {
        return people;
      }
      return prevOnlinePeople;
    });
  }, []);

  const showOfflinePeople = useCallback((peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username, profilePhoto }) => {
      if (userId) {
        people[userId] = { username, profilePhoto, id: userId };
      }
    });
    setOfflinePeople((prevOfflinePeople) => {
      if (JSON.stringify(prevOfflinePeople) !== JSON.stringify(people)) {
        return people;
      }
      return prevOfflinePeople;
    });
  }, []);
  const handleMessage = useCallback((e) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData && "offline" in messageData) {
      showOnlinePeople(messageData.online);
      showOfflinePeople(messageData.offline);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, messageData]);
    }
  },[showOfflinePeople , showOnlinePeople]);

  const connectToWs = useCallback(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = handleMessage;

    ws.current.onclose = () => {
      console.log("WebSocket disconnected, attempting to reconnect...");
      setTimeout(connectToWs, 1000);
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.current.close();
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [handleMessage]);

  useEffect(() => {
    const cleanUp = connectToWs();
    return () => {
      cleanUp();
    };
  }, [connectToWs]);

  

  const sendMessage = (e) => {
    e.preventDefault();
    if (ws.current) {
      ws.current.send(
        JSON.stringify({ recipient: selectedUserId, text: newMessageText })
      );
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: user.id,
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
          const response = await api.get(
            `/api/messages/${selectedUserId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedUserId]);

  const Logout = async () => {
    try {
      await api.post("/api/logout", null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      localStorage.removeItem("accessToken");
      dispatch(logout());
      if (ws.current) {
        ws.current.close();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const findSelectedUser = useCallback(
    (userId) => {
      if (onlinePeople[userId]) {
        setSelectedUser(onlinePeople[userId].username);
      } else if (offlinePeople[userId]) {
        setSelectedUser(offlinePeople[userId].username);
      }
    },
    [onlinePeople, offlinePeople]
  );

  useEffect(() => {
    if (selectedUserId) {
      findSelectedUser(selectedUserId);
    }
  }, [selectedUserId, findSelectedUser]);

  const messageWithoutDuo = useMemo(() => uniqBy(messages, "_id"), [messages]);
  const onlinePeopleExclOurUser = useMemo(() => {
    const people = { ...onlinePeople };
    delete people[user.id];
    return people;
  }, [onlinePeople, user.id]);
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      {/* Left Side Panel */}
      <div className="bg-[#F5F6FA] w-full md:w-1/3 flex flex-col justify-between items-center">
        <Navbar username={user.name} />
        <div className="flex-grow w-[95%] bg-white shadow-2xl rounded-2xl text-center flex flex-col items-center mt-4 mb-6 overflow-hidden">
          <SearchBar />
          <UserList
            onlinePeopleExclOurUser={onlinePeopleExclOurUser}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            offlinePeople={offlinePeople}
            currentUser={user}
          />
        </div>
        <button
          onClick={Logout}
          className="bg-[#2680EB] text-white py-2 px-4 rounded-2xl m-4"
        >
          Logout
        </button>
      </div>

      {/* Right Side Panel */}
      <div className="flex flex-col bg-[#F5F6FA] w-full h-full md:w-2/3 p-4 relative">
        {selectedUserId && <ChatNav name={selectUser} setSelectedUserId={setSelectedUserId} />}
        <div className="flex flex-col flex-grow h-full">
          {!selectedUserId ? (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-black text-center">
                Chat With Your Friends
                <br />
                Send and Receive Messages with Encryption
              </div>
            </div>
          ) : (
            <div
            >
              <MessageComponent
              messages={messages}
              messageWithoutDuo={messageWithoutDuo}
            />
            </div>
          )}
        </div>
        {/* Message Input Section */}
        {selectedUserId && (
          <form className="flex  justify-center items-center absolute bottom-0 w-full mb-2" onSubmit={sendMessage}>
            <div className="relative w-5/6">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                className="block w-full p-4 pl-10 text-sm border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 shadow-2xl rounded-2xl h-12"
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
