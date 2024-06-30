import React from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Main from "./Component/Main";
import Login from "./Page/Login";
import Register from "./Page/Register";
import AuthRoute from "./AuthRoute";
axios.defaults.withCredentials = true;


function App() {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<AuthRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/register" element={<AuthRoute />}>
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Main />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
