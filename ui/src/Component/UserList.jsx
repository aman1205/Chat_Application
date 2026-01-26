import React from "react";

const UserList = ({
  onlinePeopleExclOurUser,
  selectedUserId,
  setSelectedUserId,
  offlinePeople,
  currentUser,
}) => {
  const filteredOnlinePeople = Object.values(onlinePeopleExclOurUser).filter(
    (person) => person.id !== currentUser?.id
  );

  const filteredOfflinePeople = Object.values(offlinePeople).filter(
    (person) => person.id !== currentUser?.id
  );

  return (
    <div className="w-full max-h-[400px] overflow-y-auto p-2">
      {/* Online Users */}
      {filteredOnlinePeople.map((person) => (
        <div
          key={person.id}
          className={`group relative flex items-center py-3 px-4 rounded-2xl cursor-pointer mb-2 transition-all duration-300 ${
            selectedUserId === person.id
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-[1.02]"
              : "bg-white/60 hover:bg-white/90 hover:shadow-md backdrop-blur-sm"
          }`}
          onClick={() => setSelectedUserId(person.id)}
        >
          {/* Profile Image with Status */}
          <div className="relative flex-shrink-0">
            <img
              src={person.profilePhoto}
              alt="profile"
              className={`w-12 h-12 rounded-full object-cover border-2 transition-all duration-300 ${
                selectedUserId === person.id
                  ? "border-white shadow-lg"
                  : "border-indigo-200 group-hover:border-indigo-300"
              }`}
            />
            {/* Online Status Indicator */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500 shadow-md animate-pulse"></div>
          </div>

          {/* User Info */}
          <div className="ml-3 flex-1 min-w-0">
            <p
              className={`font-semibold text-sm truncate ${
                selectedUserId === person.id
                  ? "text-white"
                  : "text-gray-800 group-hover:text-indigo-600"
              }`}
            >
              {person.username}
            </p>
            <p
              className={`text-xs truncate ${
                selectedUserId === person.id
                  ? "text-white/80"
                  : "text-gray-500"
              }`}
            >
              Online
            </p>
          </div>

          {/* Unread Badge (optional - can be added later) */}
          {selectedUserId !== person.id && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                className="w-5 h-5 text-indigo-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      ))}

      {/* Offline Users */}
      {filteredOfflinePeople.map((person) => (
        <div
          key={person.id}
          className={`group relative flex items-center py-3 px-4 rounded-2xl cursor-pointer mb-2 transition-all duration-300 ${
            selectedUserId === person.id
              ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg transform scale-[1.02]"
              : "bg-white/40 hover:bg-white/70 hover:shadow-md backdrop-blur-sm"
          }`}
          onClick={() => setSelectedUserId(person.id)}
        >
          {/* Profile Image with Status */}
          <div className="relative flex-shrink-0">
            <img
              src={person.profilePhoto}
              alt="profile"
              className={`w-12 h-12 rounded-full object-cover border-2 transition-all duration-300 ${
                selectedUserId === person.id
                  ? "border-white shadow-lg grayscale-[30%]"
                  : "border-gray-200 group-hover:border-gray-300 grayscale-[50%]"
              }`}
            />
            {/* Offline Status Indicator */}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-400 shadow-md"></div>
          </div>

          {/* User Info */}
          <div className="ml-3 flex-1 min-w-0">
            <p
              className={`font-semibold text-sm truncate ${
                selectedUserId === person.id
                  ? "text-white"
                  : "text-gray-600 group-hover:text-gray-800"
              }`}
            >
              {person.username}
            </p>
            <p
              className={`text-xs truncate ${
                selectedUserId === person.id
                  ? "text-white/80"
                  : "text-gray-400"
              }`}
            >
              Offline
            </p>
          </div>

          {/* Arrow Icon */}
          {selectedUserId !== person.id && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;
