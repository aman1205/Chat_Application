import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const MessageComponent = ({ messages, messageWithoutDuo }) => {
  const user = useSelector((state) => state.authReducer.user);
  const divUnderMessages = useRef(null);

  useEffect(() => {
    if (divUnderMessages.current) {
      divUnderMessages.current.scrollIntoView({ behavior: "smooth"  , block: "end"});
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-3/4">
      <div className="flex-grow overflow-y-scroll p-4 hide-scrollbar">
        {messageWithoutDuo.map((item) => (
          <div
            key={item._id}
            className={item.sender === user.id ? "text-right" : "text-left"}
          >
            <div
              className={
                "inline-block p-4 my-2 max-w-[80%] sm:max-w-xs text-sm shadow-xl " +
                (item.sender === user.id
                  ? "bg-[#2680EB] text-white rounded-xl mr-4 sm:mr-16"
                  : "bg-white text-black rounded-xl ml-4 sm:ml-16")
              }
            >
              {item.text}
            </div>
          </div>
        ))}
        <div ref={divUnderMessages}></div>
      </div>
    </div>
  );
};

export default MessageComponent;
