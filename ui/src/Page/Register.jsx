import React, { useContext } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
const RegistrationForm = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePhoto: '',
  });
  const {setUserName,setId} =useContext(UserContext);


  const handleChange = async(e) => {
    if (e.target.name === 'profilePhoto') {
      const files =e.target.files[0]
      const conveted = await  convertToBase(files)
      setFormData({ ...formData, profilePhoto: conveted });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
  formDataToSend.append('name', formData.name);
  formDataToSend.append('email', formData.email);
  formDataToSend.append('password', formData.password);
  formDataToSend.append('profilePhoto', formData.profilePhoto);

  console.log("Form Data", formDataToSend);

  try {
    const response = await axios.post('http://localhost:5000/api/register', formData);
      alert('User registered successfully!');
      setUserName(formData.name);
      setId(response.id);
    } catch (error) {
      alert('Error registering user. Please try again.');
    }       
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
              name='name' 
              value={formData.name}
              onChange={handleChange}
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
              name='email'
              value={formData.email}
              onChange={handleChange}
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
              name='password'
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profilePhoto">
          Profile Photo:
          <input type="file" name="profilePhoto" id='profilePhoto'  onChange={handleChange} accept="image/*" />
        </label>
          </div>
          <div className="flex items-center justify-between bg-black w-10">
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


function convertToBase(file){
  return new Promise((resolve , reject)=>{
    const fileRead = new FileReader();
    fileRead.readAsDataURL(file);
    fileRead.onload=()=>{
      resolve(fileRead.result)
    };
    fileRead.onerror=(err)=>{
      reject(err)
    }
  })
}