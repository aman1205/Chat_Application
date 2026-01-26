import React from "react";
import api from "./axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import PrivateRoute from "./PrivateRoute";
import Main from "./Component/Main";
import Login from "./Page/Login";
import Register from "./Page/Register";
import AuthRoute from "./AuthRoute";
api.defaults.withCredentials = true;


function App() {
  return (
    <Router>
      {/* Toast notification container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            padding: '16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

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
