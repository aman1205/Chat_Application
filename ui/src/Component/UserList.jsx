import React from "react";
import Avatar from './Avatar'

const UserList = ({ onlinePeopleExclOurUser, selectedUserId, setSelectedUserId ,offlinePeople}) => {
  return (
    <>
      {Object.values(onlinePeopleExclOurUser).map((user) => (
        <div
          key={user.id}
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
            userId={user.id}
            photo={user.profilePhoto}
            online={true}
          />
          <span>{user.username}</span>
        </div>
      ))}
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
    </>
  );
};

export default UserList;
