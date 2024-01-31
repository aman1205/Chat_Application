import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import Avatar from "./Avatar";
import { UserContext } from "../UserContext";
import { uniqBy } from "lodash";
import Navbar from "./Navbar";
import ChatNav from "./ChatNav";
const Main = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([" "]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id, setId, setUserName } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessages = useRef();
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
    const people = [];
    peopleArray.forEach(({ userId, Username, profilePhoto }) => {
      if (userId) {
        people[userId] = {
          username: Username,
          photo: profilePhoto,
          id: userId,
        };
      }
    });
    // console.log(people)
    // const updateOnlinePeople = people.filter(
    //   (userObject) => Object.keys(userObject)[0] !== id
    // );
    setOnlinePeople(updateOnlinePeople);
  }
  //Online User
  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
      // console.log(" messageDataonline" , messageWithoutDuo)
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

  //Controll Scroll nature
  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

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
  /// Lodash
  const messageWithoutDuo = uniqBy(messages, "_id");
  const onlinePeopleExclOurUser = [...onlinePeople];

  // useEffect(() => {
  // ... (other useEffect code)

  // // Log out user and update onlinePeople state
  // const indexOfCurrentUser = onlinePeople.findIndex(user => Object.keys(user)[0] === id);
  // if (indexOfCurrentUser !== -1) {
  //   const updatedOnlinePeople = [...onlinePeople];
  //   updatedOnlinePeople.splice(indexOfCurrentUser, 1);
  //   setOnlinePeople(updatedOnlinePeople);  // Update state with the modified array
  // } else {
  //   console.warn("Current user not found in onlinePeople array.");
  // }
  const updateOnlinePeople = onlinePeople.filter(
    (userObject) => Object.keys(userObject)[0] !== id
  );

  // setOnlinePeople(prevOnlinePeople => {
  //   const updatedOnlinePeople = prevOnlinePeople.filter(user => Object.keys(user)[0] !== id);
  //   return updatedOnlinePeople;
  // });

  // ... (other useEffect code)
  // }, [id]);

  // const onlinePeopleExclOurUser = onlinePeople.filter((_, index) => index !== id);

  //Send file Function
  const sendFile = (ev) => {
    const file = ev.target.files[0];
    ws.send(JSON.stringify({}));
  };

  const findSelectedUser = (id) => {
    if (onlinePeople[id]) {
      setSelectedUser(onlinePeople[id]);
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

  return (
    <div className="flex h-screen">
      <div className="bg-[#F5F6FA]  w-1/3 flex flex-col justify-center items-center gap-2">
        <Navbar />
        <div className="flex-grow w-5/6  bg-white shadow-2xl rounded-2xl text-center flex flex-col items-center mt-4 mb-6">
          <div className="w-4/5 bg-[#F5F6FA]  shadow-2xl  flex justify-center items-center mt-2  rounded-2xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0  flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                {/* <span className="sr-only">Search icon</span> */}
              </div>
              <input
                type="text"
                id="search-navbar"
                className="block w-full p-3 pl-10 text-sm text-gray-900 border  rounded-xl bg-[#F5F6FA] focus:ring-blue-500 focus:border-black dark:bg-[#F5F6FA] dark:placeholder-gray-400 dark:text-black"
                placeholder="Search..."
              />
            </div>
          </div>
          {/* {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <div
              key={userId}
              onClick={() => setSelectedUserId(userId)}
              className={
                "w-4/5 py-2 pl-4 flex items-center gap-2 cursor-pointer m-1 rounded-2xl "+
                (userId === selectedUserId ? "scale-x-40 shadow-2xl bg-yellow-50" : "")
              }
            >
              <Avatar
                username={onlinePeople[userId].username}
                userId={userId}
                photo={onlinePeople[userId].photo}
                online={true}
              />
              <span>{onlinePeople[userId]}</span>
            </div>
          ))} */}
          {updateOnlinePeople.map((data) => {
            const key = Object.keys(data)[0];
            const user = data[key];
            console.table(data);
            return (
              <div
                key={key}
                onClick={() => setSelectedUserId(user.id)}
                className={
                  "w-4/5 py-2 pl-4 flex items-center gap-2 cursor-pointer m-1 rounded-2xl " +
                  (user.id === selectedUserId
                    ? "scale-x-40 shadow-2xl bg-yellow-50"
                    : "")
                }
              >
                <Avatar
                  username={user.username}
                  userId={key}
                  photo={user.photo}
                  online={true}
                />
                <span>{user.username}</span>
              </div>
            );
          })}
          {Object.keys(offlinePeople).map((userId) => (
            <div
              key={userId}
              onClick={() => setSelectedUserId(userId)}
              className={
                "w-4/5 py-2 pl-4 flex items-center gap-2 m-1 cursor-pointer mt-2 rounded-2xl" +
                (userId === selectedUserId
                  ? "scale-x-40 shadow-2xl bg-yellow-50"
                  : "")
              }
            >
              <Avatar
                username={offlinePeople[userId].name}
                userId={userId}
                photo={offlinePeople[userId].profilePhoto}
                online={false}
              />
              <span>{offlinePeople[userId].name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col bg-[#F5F6FA] w-2/3 p-4 border-l border-red-300">
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
                        "text-left inline-block p-4 my-2  max-w-xs w-auto text-sm shadow-xl	" +
                        (item.sender === id
                          ? "bg-[#2680EB] text-white  rounded-xl mr-16 shadow-xl	"
                          : "bg-white text-black rounded-xl  max-w-xs w-auto ml-16")
                      }
                    >
                      {item.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>

        {!!selectedUserId && (
          <form
            className="flex gap-2 justify-center items-center"
            onSubmit={sendMessage}
          >
            <div class="relative w-5/6 ">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
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
              <button
                type="submit"
                className="p-2 text-white rounded-sm absolute inset-y-0 end-0 flex items-center ps-3 "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  className="w-8 h-8"
                  viewBox="0 0 256 256"
                  xmlSpace="preserve"
                >
                  <g
                    style={{
                      stroke: "none",
                      strokeWidth: 0,
                      strokeDasharray: "none",
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                      strokeMiterlimit: 10,
                      fill: "rgb(38,128,235)",
                      fillRule: "nonzero",
                      opacity: 1,
                    }}
                    transform="translate(0 -2.842170943040401e-14) scale(2.81 2.81)"
                  >
                    <circle
                      cx="45"
                      cy="45"
                      r="45"
                      style={{
                        stroke: "none",
                        strokeWidth: 1,
                        strokeDasharray: "none",
                        strokeLinecap: "butt",
                        strokeLinejoin: "miter",
                        strokeMiterlimit: 10,
                        fill: "rgb(38,128,235)",
                        fillRule: "nonzero",
                        opacity: 1,
                      }}
                      transform="matrix(1 0 0 1 0 0)"
                    />
                  </g>
                  <g
                    style={{
                      stroke: "none",
                      strokeWidth: 0,
                      strokeDasharray: "none",
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                      strokeMiterlimit: 10,
                      fill: "none",
                      fillRule: "nonzero",
                      opacity: 1,
                    }}
                    transform="translate(56.08543569106949 46.17984832069335) scale(1.82 1.82) matrix(1 0 0 -1 0 90)"
                  >
                    <polygon
                      points="0,14.69 0,39.65 51,45 0,50.35 0,75.31 90,45"
                      style={{
                        stroke: "none",
                        strokeWidth: 1,
                        strokeDasharray: "none",
                        strokeLinecap: "butt",
                        strokeLinejoin: "miter",
                        strokeMiterlimit: 10,
                        fill: "rgb(255,255,255)",
                        fillRule: "nonzero",
                        opacity: 1,
                      }}
                      transform="matrix(1 0 0 1 0 0)"
                    />
                  </g>
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Main;
