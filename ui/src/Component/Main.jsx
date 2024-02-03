import React, { useContext, useEffect, useState } from "react";
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
  const { username, id, setId, setUserName } =
    useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectUser, setSelectedUser] = useState(null);

  //Connect with WebSocket
  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);

  ///Connect to wss again
  function connectToWs() {
    const ws = new WebSocket("ws://localhost:5000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    });
  }

  // filter unique User
  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, Username, profilePhoto }) => {
      if (userId) {
        people[userId] = {
          username: Username,
          profilePhoto: profilePhoto,
          id: userId,
        };
      }
    });
    setOnlinePeople(people);
  }
  //Online User
  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  // Handle new Message
  const sendMessage = (e) => {
    e.preventDefault();
    console.log("Sending");
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
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
  };
  //Fetch all the message of selected user in the chat
  useEffect(() => {
    if (selectedUserId) {
      axios
        .get("http://localhost:5000/api/messages/" + selectedUserId)
        .then((e) => {
          setMessages(e.data);
        });
    }
  }, [selectedUserId]);

  /// All user or Online User
  useEffect(() => {
    axios.get("http://localhost:5000/api/alluser").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));

      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  //Logot User
  function logout() {
    axios.post("http://localhost:5000/api/logout").then(() => {
      setId(null);
      setUserName(null);
      setWs(null);
    });
  }

  const findSelectedUser = (id) => {
    if (onlinePeople[id]) {
      const name = onlinePeople[id].username;
      setSelectedUser(name);
    }
    if (offlinePeople[id]) {
      const name = offlinePeople[id].name;
      setSelectedUser(name);
    }
  };
  useEffect(() => {
    if (selectedUserId) {
      findSelectedUser(selectedUserId);
    }
  }, [selectedUserId]);

  const messageWithoutDuo = uniqBy(messages, "_id");
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  return (
    <div className="flex h-screen">
      <div className="bg-[#F5F6FA]  w-1/3 flex flex-col justify-center items-center gap-2">
        <Navbar username={username} />
        <div className="flex-grow w-5/6  bg-white shadow-2xl rounded-2xl text-center flex flex-col items-center mt-4 mb-6">
          <SearchBar />
          <UserList
            onlinePeopleExclOurUser={onlinePeopleExclOurUser}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            offlinePeople={offlinePeople}
          />
        </div>
      </div>

      <div className="flex flex-col bg-[#F5F6FA] w-2/3 p-4">
        {selectedUserId && <ChatNav name={selectUser} />}
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="  flex h-full flex-grow items-center justify-center ">
              <div className="text-black">
                Chat With Your Friends
                <br />
                Send and Recive Meassge to other with encrpytion
              </div>
            </div>
          )}
          <MessageComponent
            messages={messages}
            messageWithoutDuo={messageWithoutDuo}
          />
        </div>

        {!!selectedUserId && (
          <form
            className="flex gap-2 justify-center items-center"
            onSubmit={sendMessage}
          >
            <div className="relative w-5/6 ">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-black dark:black"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    fs
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
                className="block w-full p-4 ps-10 text-sm  border border-gray-300 bg-black focus:ring-blue-500 focus:border-blue-500 dark:bg-white dark:border-white dark:placeholder-black dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500 shadow-2xl rounded-2xl"
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
