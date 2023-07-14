import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import "../style/Login.css";

const LoginForm = ({ onRegisterClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUserName, setId } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      setUserName(data.username);
      setId(data.id);
      setError("");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred during login");
      }
    }
  };

  return (
    <div className="wrapper login">
      <div className="container">
        <div className="col-left">
          <div className="login-text">
            <h2>Welcome!</h2>
            <p>Create your account. <br/>For Free!</p>
            <button onClick={onRegisterClick}  className="btn">
              Sign Up
            </button>
          </div>
        </div>
        <div className="col-right">
          <div className="login-form">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              {error && <div className="error text-red-500 text-center"><h4>{error}</h4></div>}
              <p>
                <label>
                  Username/Email address<span>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Username or Email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </p>
              <p>
                <label>
                  Password<span>*</span>
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </p>
              <p>
                <input type="submit" value="Sign In" />
              </p>
              <p>
                <a href="">Forgot password?</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
