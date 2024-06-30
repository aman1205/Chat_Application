import React, { useState  , useContext} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePhoto: '',
  });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = async (e) => {
    if (e.target.name === 'profilePhoto') {
      const file = e.target.files[0];
      const converted = await convertToBase(file);
      setFormData({ ...formData, profilePhoto: converted });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);
      if (response.status===201) {
        alert('User registered successfully!');

      }
      setAuth({
        isAuthenticated: true,
        user: response.data.user,
        accessToken: response.data.accessToken, 
      });
      navigate('/login'); // Navigate to the login page after successful registration
    } catch (error) {
      alert('Error registering user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col bg-white shadow-md px-4 sm:px-6 md:px-8 lg:px-10 py-8 rounded-md w-full max-w-md">
        <div className="font-medium self-center text-xl sm:text-2xl uppercase text-gray-800">
          Register Your Account
        </div>
        <div className="relative mt-10 h-px bg-gray-300">
          <div className="absolute left-0 top-0 flex justify-center w-full -mt-2">
            <span className="bg-white px-4 text-xs text-gray-500 uppercase">
              Fill the form below
            </span>
          </div>
        </div>
        <div className="mt-10">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col mb-6">
              <label
                htmlFor="name"
                className="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >
                Name:
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="text-sm sm:text-base placeholder-gray-500 pl-4 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-6">
              <label
                htmlFor="email"
                className="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >
                Email:
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="text-sm sm:text-base placeholder-gray-500 pl-4 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-6">
              <label
                htmlFor="password"
                className="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >
                Password:
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="text-sm sm:text-base placeholder-gray-500 pl-4 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-6">
              <label
                htmlFor="profilePhoto"
                className="mb-1 text-xs sm:text-sm tracking-wide text-gray-600"
              >
                Profile Photo:
              </label>
              <div className="relative">
                <input
                  id="profilePhoto"
                  type="file"
                  name="profilePhoto"
                  accept="image/*"
                  className="text-sm sm:text-base placeholder-gray-500 pl-4 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-blue-400"
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex w-full mb-6">
              <button
                type="submit"
                className={` bg-green-500 hover:bg-green-700 flex items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-blue-600 hover:bg-blue-700 rounded py-2 w-full transition duration-150 ease-in ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>
            <div className="flex justify-center items-center mt-6">
              <button
                
                onClick={() => navigate('/login')}
                className="inline-flex items-center font-bold text-blue-500 hover:text-blue-700 text-xs text-center "
              >
                <span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </span>
                <span className="ml-2">Already have an account? Sign in.</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;

function convertToBase(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}
