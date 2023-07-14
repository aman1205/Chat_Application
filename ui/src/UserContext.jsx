import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUserName] = useState(null);
  const [id, setId] = useState(null);
  // const [chatid ,setChatID]=useState(null);
  
  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const response = await axios.get("http://localhost:5000/api/profile", {
  //         withCredentials: true,
  //       });
  //       setUserName(response.data.userName)
  //       setId(response.data.userId)
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }

  //   fetchData();
  // }, []);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profile', { withCredentials: true });
        setId(response.data.userId);
        setUserName(response.data.userName);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{username, setUserName, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
