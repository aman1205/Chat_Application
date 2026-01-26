import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const MessageComponent = ({ messages, messageWithoutDuo }) => {
  const user = useSelector((state) => state.authReducer.user);
  const divUnderMessages = useRef(null);

  useEffect(() => {
    if (divUnderMessages.current) {
      divUnderMessages.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {messageWithoutDuo.map((item, index) => {
          const isOwnMessage = item.sender === user.id;
          const showAvatar = index === 0 || messageWithoutDuo[index - 1].sender !== item.sender;

          return (
            <div
              key={item._id}
              className={`flex items-end gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"} animate-fadeIn`}
            >
              {/* Avatar (only show for first message in group) */}
              {!isOwnMessage && (
                <div className="flex-shrink-0 w-8 h-8">
                  {showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {item.sender?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[75%] sm:max-w-md ${
                  isOwnMessage ? "ml-auto" : "mr-auto"
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    isOwnMessage
                      ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-br-md"
                      : "bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-md border border-white/20"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{item.text}</p>

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] mt-1 ${
                      isOwnMessage ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Message tail (triangle) */}
                <div
                  className={`absolute bottom-0 ${
                    isOwnMessage ? "right-0 -mr-2" : "left-0 -ml-2"
                  }`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className={isOwnMessage ? "text-pink-500" : "text-white/90"}
                  >
                    <path
                      d={
                        isOwnMessage
                          ? "M0 0 L12 0 L12 12 Z"
                          : "M0 0 L0 12 L12 12 Z"
                      }
                      fill="currentColor"
                    />
                  </svg>
                </div>

                {/* Delivery Status for own messages */}
                {isOwnMessage && (
                  <div className="absolute -bottom-5 right-0 flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Spacer for own messages */}
              {isOwnMessage && <div className="flex-shrink-0 w-8"></div>}
            </div>
          );
        })}
        <div ref={divUnderMessages}></div>
      </div>

      {/* Custom CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .hide-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
};

export default MessageComponent;
