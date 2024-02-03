import React, {useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../UserContext";

const MessageComponent = ({ messages, messageWithoutDuo }) => {
  const divUnderMessages = useRef();
  const { id } = useContext(UserContext);
  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);
  return (
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
  );
};

export default MessageComponent;
