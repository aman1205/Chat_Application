import React from "react";

const UserList = ({
  onlinePeopleExclOurUser,
  selectedUserId,
  setSelectedUserId,
  offlinePeople,
  currentUser,
}) => {
  const filteredOnlinePeople = Object.values(onlinePeopleExclOurUser).filter(
    (person) => person.id !== currentUser.id
  );

  const filteredOfflinePeople = Object.values(offlinePeople).filter(
    (person) => person.id !== currentUser.id
  );

  return (
    <div className="w-full max-h-[400px] overflow-y-auto p-2">
      {filteredOnlinePeople.map((person) => (
        <div
          key={person.id}
          className={`${
            selectedUserId === person.id
              ? "bg-[#2680EB] text-white"
              : "hover:bg-gray-200"
          } flex items-center text-center py-1 px-2 rounded-full cursor-pointer mb-2`}
          onClick={() => setSelectedUserId(person.id)}
        >
          <div className="relative">
            <img
              src={person.profilePhoto}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border bg-green-500"></div>
          </div>
          <div className="ml-2">
            <p className="font-semibold">{person.username}</p>
          </div>
        </div>
      ))}
      {filteredOfflinePeople.map((person) => (
        <div
          key={person.id}
          className={`${
            selectedUserId === person.id
              ? "bg-[#2680EB] text-white "
              : "hover:bg-gray-200"
          } flex items-center text-center py-1 px-2 rounded-full cursor-pointer mb-2`}
          onClick={() => setSelectedUserId(person.id)}
        >
          <div className="relative">
            <img
              src={person.profilePhoto}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border bg-gray-500"></div>
          </div>
          <div className="ml-2">
            <p className="font-semibold">{person.username}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
