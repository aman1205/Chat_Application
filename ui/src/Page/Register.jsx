import React, { useContext } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
const RegistrationForm = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {setUserName,setId} =useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {data}= await axios.post('http://localhost:5000/api/register', { name,email, password })
       // handle the response, e.g. set user state or redirect
        setUserName(name);
        setId(data.id);
  };
  return (
    <div id='register' className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-96 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Enter your name" 
              required  
              value={name}
              onChange={e=>setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your email" 
              required
              value={email}
              onChange={e=>setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"  
              required
              placeholder="Enter your password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline "
              type="submit"
            >
              Sign Up
            </button>
            <a
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href=''
            >
              Already have an account? Sign in.
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
