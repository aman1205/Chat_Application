import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth
      ? JSON.parse(savedAuth)
      : {
          isAuthenticated: false,
          user: null,
          accessToken: null,
        };
  });

  useEffect(() => {
    const checkAuth = async () => {
      const savedAccessToken = localStorage.getItem("accessToken");
      if (savedAccessToken) {
        try {
          const { data } = await axios.get("http://localhost:5000/api/profile", {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${savedAccessToken}`,
            },
          });
          setAuth({
            isAuthenticated: true,
            user: data,
            accessToken: savedAccessToken,
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
          setAuth({
            isAuthenticated: false,
            user: null,
            accessToken: null,
          });
          localStorage.removeItem("auth");
          localStorage.removeItem("accessToken");
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
    if (auth.accessToken) {
      localStorage.setItem("accessToken", auth.accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [auth]);

  return (
    <UserContext.Provider value={{ auth, setAuth }}>
      {children}
    </UserContext.Provider>
  );
}
