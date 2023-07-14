import React, { useEffect, useState } from "react";
import "./index.css";
import LoginForm from "./Page/Login";
import RegistrationForm from "./Page/Register";
import Home from "./Page/Home";
import "./style/main.scss";
import { UserContextProvider } from "./UserContext";
import Rou from "./Routes";
import axios from "axios";
import { Navigate } from "react-router-dom";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { wait } from "@testing-library/user-event/dist/utils";

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
