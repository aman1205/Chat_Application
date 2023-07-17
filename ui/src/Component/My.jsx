import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import Avatar from "./Avatar";
import { UserContext } from "../UserContext";
import { uniqBy } from "lodash";
import Navbar from "./Navbar";
import ChatNav from "./ChatNav";

const Aman = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id, setId, setUserName } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessages = useRef();

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
    peopleArray.forEach(({ userId, Username }) => {
      people[userId] = Username;
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
  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

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
  /// Lodash
  const messageWithoutDuo = uniqBy(messages, "_id");
  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];
  //Send file Function
  const sendFile = (ev) => {
    const file = ev.target.files[0];
    ws.send(JSON.stringify({}));
  };

  return (
    <div className="flex h-screen">
      <div className="bg-side  w-1/3 flex flex-col ">
        <Navbar />  
        <div className="flex-grow w-100 bg-white shadow-2xl mt-3 mr-3 ml-3 rounded-md">
          <h1 className="self-center text-2xl font-semibold whitespace-nowrap dark:text-black">
            Chats
          </h1>
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <div
              key={userId}
              onClick={() => setSelectedUserId(userId)}
              className={
                "border-b border-white-500 py-2 pl-4 flex items-center gap-2 cursor-pointer mt-2 " +
                (userId === selectedUserId ? "bg-side text-white shadow-lg" : "")
              }
            >
              <Avatar
                username={onlinePeople[userId]}
                userId={userId}
                online={true}
              />
              <span>{onlinePeople[userId]}</span>
            </div>
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <div
              key={userId}
              onClick={() => setSelectedUserId(userId)}
              className={
                "border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer " +
                (userId === selectedUserId ? "bg-pink-100" : "")
              }
            >
              <Avatar
                username={offlinePeople[userId]}
                userId={userId}
                online={false}
              />
              <span>{offlinePeople[userId].name}</span>
            </div>
          ))}
        </div>
        <div className="p-2 text-center flex items-center justify-between">
          <span className=" text-sm text-grat-600 flex items-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            <b>{username}</b>
          </span>
          <button
            onClick={logout}
            className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col bg-side w-2/3 p-4 border-l border-white-400">
        <ChatNav  name={username}/>
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="  flex h-full flex-grow items-center justify-center ">
              <div className="text-gray-400">
                &larr;Chat With Your Friends
                <br />
                Send and Recive Meassge to other with encrpytion
              </div>
            </div>
          )}

          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2 hide-scrollbar">
                {messageWithoutDuo.map((item) => (
                  <div
                    key={item._id}
                    className={item.sender === id ? "text-right " : "text-left"}
                  >
                    <div
                      className={
                        "text-left inline-block p-2 my-2   max-w-xs w-auto text-sm " +
                        (item.sender === id
                          ? "bg-gradient-to-br from-yellow-400 to-red-500 text-white rounded-r-xl rounded-t-xl "
                          : "bg-gradient-to-br from-blue to-cyan-500 text-white rounded-l-xl rounded-tr-xl max-w-xs w-auto")
                      }
                    >
                      {item.sender === id ? "Me:" : ""} {item.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>

        {!!selectedUserId && (
          <form className="flex gap-2 " onSubmit={sendMessage}>
            <input
              type="text"
              className="bg-white border rounded-sm p-2 flex-grow"
              placeholder="Type Here"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
            />
            <label className="bg-gray-400 p-2 text-gray-00 rounded-md border border-yellow cursor-pointer">
              <input className="hidden" type="file" onChange={sendFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <button type="submit" className="bg-blue p-2 text-white rounded-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Aman;
