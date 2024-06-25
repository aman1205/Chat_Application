import React from "react";
import "./index.css";
import "./style/main.scss";
import { UserContextProvider } from "./UserContext";
import Routes from "./Routes";
import axios from "axios";
const App = () => {
  axios.defaults.withCredentials = true;
  return (
    <>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </>
  );
};

export default App;
