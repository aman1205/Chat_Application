import React from 'react';
import ChatNav from './ChatNav';
import MessageComponent from './Messages';

const ChatArea = ({
  selectedUserId,
  selectedUserName,
  isUserOnline,
  messages,
  user,
  newMessageText,
  setNewMessageText,
  onSendMessage,
  onBack,
}) => {
  if (!selectedUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-full overflow-hidden gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 p-8 rounded-full shadow-2xl">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Start a Conversation
          </h1>
          <p className="text-gray-500 text-lg">
            Select a user from the sidebar to begin chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-2 sm:px-8 py-3 sm:py-5 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-lg">
        <ChatNav
          name={selectedUserName}
          setSelectedUserId={onBack}
          isOnline={isUserOnline}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-1 sm:px-4 py-2 sm:py-6 bg-gradient-to-br from-white/40 via-white/20 to-transparent min-w-0">
        <MessageComponent messages={messages} messageWithoutDuo={messages} user={user} />
      </div>

      {/* Message Input */}
      <form
        className="relative flex items-center gap-3 px-2 sm:px-8 py-3 sm:py-5 bg-white/90 backdrop-blur-xl border-t border-white/20 shadow-lg"
        onSubmit={onSendMessage}
      >
        <div className="flex-1 relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors duration-200">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            className="w-full py-3 sm:py-4 pl-12 pr-4 rounded-2xl bg-white border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 text-xs sm:text-sm shadow-sm transition-all duration-200 placeholder-gray-400"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white p-3 sm:p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 hover:-translate-y-0.5"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </>
  );
};

export default ChatArea;
