import React, { useEffect, useState } from "react";
import Cam from "../Image/cam.png";
import Add from "../Image/add.png";
import More from "../Image/more.png";
import Messages from "./Messages";
import Input from "./Input";
const Chat = ({chatid}) => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [newtext, setNewText] = useState("");
  const [selectedUserId,setSelectedUserId] = useState(null);
  

//UserId from the 
  // console.log(`New id ${chatid}`)
  useEffect(() => {
    const WS = new WebSocket("ws://localhost:5000");
    setWs(WS);
    WS.addEventListener("message", handleMessage);
  }, []);

  //Show online People
  function showOnlineName(peopleArr) {
    const people = {};
    peopleArr.array.forEach(({ userId, Username }) => {
      people[userId] = Username;
    });
    setOnlinePeople(people);
  }

  //handleInputText Function
  const handleInputText = (e) => {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        message: {
          recipient: selectedUserId,
          text: newtext,
        },
      })
    );
  };

  //Handle Message
  function handleMessage(ev) {
    const onlineUser = JSON.parse(ev.data);
    if ("online" in Messages) {
      showOnlineName(onlineUser.online);
    }
  }

  // console.log(onlinePeople)

 

  return (
    <div className="chat">
      <div className="chatInfo">
        <span>AMAN</span>
        <div className="chatIcon">
          <img src={Cam} alt="" />
          <img src={Add} alt="" />
          <img src={More} alt="" />
        </div>
      </div>
      
      <Messages />

      {/* <Input setNewText={setNewText}/> */}
      <form className="input " onSubmit={handleInputText}>
        <input
          type="text"
          placeholder="Type Something..."
          onChange={(e) => setNewText(e.target.value)}
        />
        <div className="send">
          <input type="file" style={{ display: "none" }} id="file" />
          <label htmlFor="file">
            <i className="ri-attachment-line"></i>
          </label>
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
