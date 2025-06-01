import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("direct");
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
  const handleMessage = useCallback(
    (e) => {
      const messageData = JSON.parse(e.data);
      if ("online" in messageData && "offline" in messageData) {
        showOnlinePeople(messageData.online);
        showOfflinePeople(messageData.offline);
      } else if ("text" in messageData) {
        setMessages((prev) => [...prev, messageData]);
      }
    },
    [showOfflinePeople, showOnlinePeople]
  );

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
          const response = await api.get(`/api/messages/${selectedUserId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
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

  useEffect(() => {
    if (!selectedUserId && window.innerWidth < 768) {
      setIsMobileMenuOpen(true);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedUserId && window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  }, [selectedUserId]);

  return (
    <div className="flex h-screen w-screen bg-[#f7f8fa] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed z-30 inset-y-0 left-0 w-72 bg-white flex flex-col border-r border-gray-100 shadow-lg transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:w-[350px] md:z-10 md:flex md:relative`}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 z-40 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Profile/Header */}
        <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-gray-100">
          <img
            src={user?.profilePhoto}
            alt="avatar"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-purple-200"
          />
          <div className="flex-1">
            <div className="font-semibold text-base sm:text-lg text-gray-900">
              {user?.name}
            </div>
            <div className="text-xs text-gray-400 mt-1 hidden sm:block">
              Simplicity is the soul of efficiency.
            </div>
          </div>
          <button className="relative">
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
        {/* Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-2 pb-1 sm:pt-4 sm:pb-2">
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("direct")}
              className={`text-xs sm:text-sm font-semibold pb-2 border-b-2 transition-all duration-200 ${
                activeTab === "direct"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-400"
              }`}
            >
              DIRECT
            </button>
            <button
              onClick={() => setActiveTab("groups")}
              className={`text-xs sm:text-sm font-semibold pb-2 border-b-2 transition-all duration-200 ${
                activeTab === "groups"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-400"
              }`}
            >
              GROUPS
            </button>
            <button
              onClick={() => setActiveTab("public")}
              className={`text-xs sm:text-sm font-semibold pb-2 border-b-2 transition-all duration-200 ${
                activeTab === "public"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-400"
              }`}
            >
              PUBLIC
            </button>
          </div>
          <button className="bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full p-2 shadow transition-all duration-200">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        {/* Search */}
        <div className="px-4 sm:px-6 pb-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full py-2 pl-10 pr-4 rounded-xl bg-[#f3f4f6] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </span>
          </div>
        </div>
        {/* User List */}
        <div className="flex-1 overflow-y-auto px-1 sm:px-3 pb-4">
          <UserList
            onlinePeopleExclOurUser={onlinePeopleExclOurUser}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            offlinePeople={offlinePeople}
            currentUser={user}
            activeTab={activeTab}
          />
        </div>
        {/* Logout */}
        <div className="p-2 sm:p-4 border-t border-gray-100">
          <button
            onClick={Logout}
            className="w-full bg-[#f3f4f6] hover:bg-purple-100 text-purple-600 py-2 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-base"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-full bg-white shadow hover:shadow-lg"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Chat Header */}
        {selectedUserId && (
          <div className="flex items-center justify-between px-2 sm:px-8 py-2 sm:py-4 border-b border-gray-100 bg-white shadow-sm">
            <ChatNav name={selectUser} setSelectedUserId={setSelectedUserId} />
          </div>
        )}
        {/* Chat Messages */}
        {
          selectedUserId && (
            <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-2 sm:py-6 bg-[#f7f8fa] min-w-0">
            <MessageComponent
              messages={messages}
              messageWithoutDuo={messageWithoutDuo}
              user={user}
            />
          </div>
        )}
       
        {/* Message Input */}
        {selectedUserId && (
          <form
            className="relative flex items-center px-2 sm:px-8 py-2 sm:py-4 bg-white border-t border-gray-100"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              placeholder="Type a message here..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              className="flex-1 py-2 sm:py-3 px-3 sm:px-5 rounded-full bg-[#f3f4f6] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 text-xs sm:text-sm shadow-sm"
              required
            />
            <button
              type="submit"
              className="ml-2 sm:ml-3 bg-gradient-to-br from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        )}
        {
          !selectedUserId && (
            <div className="flex items-center justify-center h-full overflow-hidden">
              <h1 className="text-2xl text-black ">Select a user to chat</h1>
            </div>
          )
        }
      </main>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Main;
