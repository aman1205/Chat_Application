import React from "react";
import "./index.css";
import "./style/main.scss";
import { UserContextProvider } from "./UserContext";
import Rou from "./Routes";
import axios from "axios";
const App = () => {
  axios.defaults.withCredentials = true;
  return (
    <>
      <UserContextProvider>
        <Rou />
      </UserContextProvider>
    </>
  );
};

export default App;
