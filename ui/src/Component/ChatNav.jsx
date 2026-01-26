import React from "react";

const ChatNav = ({ name, setSelectedUserId, isOnline = false }) => {
  return (
    <header className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={() => setSelectedUserId(null)}
          className="group inline-flex items-center justify-center rounded-full p-2 transition-all duration-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors duration-200"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
        </button>

        {/* User Name and Status */}
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {name}
          </h2>
          <div className="flex items-center gap-1.5">
            {/* Status Indicator Dot */}
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline
                  ? "bg-green-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            ></span>
            {/* Status Text */}
            <p
              className={`text-xs font-medium ${
                isOnline ? "text-green-500" : "text-gray-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Call Button */}
        <button className="group inline-flex items-center justify-center rounded-full p-2.5 transition-all duration-200 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 group-hover:text-green-600 transition-colors duration-200"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </button>

        {/* Video Call Button */}
        <button className="group inline-flex items-center justify-center rounded-full p-2.5 transition-all duration-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 group-hover:text-indigo-600 transition-colors duration-200"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </button>

        {/* More Options Button */}
        <button className="group inline-flex items-center justify-center rounded-full p-2.5 transition-all duration-200 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 group-hover:text-purple-600 transition-colors duration-200"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ChatNav;
