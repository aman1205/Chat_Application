import React from 'react';
import UserList from './UserList';

const ChatSidebar = ({
  user,
  isOpen,
  onClose,
  onlinePeople,
  offlinePeople,
  selectedUserId,
  setSelectedUserId,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  return (
    <aside
      className={`fixed z-30 inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl flex flex-col border-r border-white/20 shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:w-[350px] md:z-10 md:flex md:relative`}
    >
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 z-40 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
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
      <div className="flex items-center gap-4 p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
        <div className="relative">
          <img
            src={user?.profilePhoto}
            alt="avatar"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-3 border-white shadow-lg ring-2 ring-indigo-200"
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        </div>
        <div className="flex-1">
          <div className="font-bold text-base sm:text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {user?.name}
          </div>
          <div className="text-xs text-gray-500 mt-1 hidden sm:block font-medium">
            Simplicity is the soul of efficiency.
          </div>
        </div>
        <button className="relative group">
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <div className="p-2 rounded-full bg-white/50 group-hover:bg-white transition-all duration-200">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-2 pb-1 sm:pt-4 sm:pb-2 bg-white/30">
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('direct')}
            className={`text-xs sm:text-sm font-bold pb-2 border-b-3 transition-all duration-300 ${
              activeTab === 'direct'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            DIRECT
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`text-xs sm:text-sm font-bold pb-2 border-b-3 transition-all duration-300 ${
              activeTab === 'groups'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            GROUPS
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`text-xs sm:text-sm font-bold pb-2 border-b-3 transition-all duration-300 ${
              activeTab === 'public'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            PUBLIC
          </button>
        </div>
        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 sm:px-6 pb-2 pt-2">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full py-3 pl-11 pr-4 rounded-2xl bg-white/70 border-2 border-transparent text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-200 transition-all duration-200 placeholder-gray-400"
          />
          <span className="absolute left-3 top-3 text-indigo-400 group-focus-within:text-indigo-600 transition-colors duration-200">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
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
          onlinePeopleExclOurUser={onlinePeople}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          offlinePeople={offlinePeople}
          currentUser={user}
          activeTab={activeTab}
        />
      </div>

      {/* Logout */}
      <div className="p-2 sm:p-4 border-t border-white/10 bg-gradient-to-r from-white/50 to-white/30">
        <button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-2xl font-bold transition-all duration-300 text-xs sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ChatSidebar;
