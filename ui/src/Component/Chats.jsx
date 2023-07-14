import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { UserContext } from '../UserContext';


const Chats = () => {
  const [data, setData] = useState([]);
  // const [chatid ,setChatID]=UserContext(UserContext)
  
  useEffect(() => {
    axios.get('http://localhost:5000/api/alluser')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
      });
  }, []);
  const handleChatClick = (item) => {
    // setChatID(userId);
    // console.log(item)
    
  };
  return (
    <div className='chats'>
      {data.map((item) => (
        <div className="userchat" key={item._id} onClick={() => handleChatClick(item._id)}>
          <img src="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png?f=webp" alt="" />
          <div className="userchatInfo">
            <span>{item.name}</span>
            <p>Hello</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Chats;
