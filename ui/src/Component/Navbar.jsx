import React, { useEffect, useState } from "react";
import axios from "axios";
const Navbar = () => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/profile", {
          withCredentials: true, // Ensure that cookies are sent with the request
        });

        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);
  return (
    <nav className="bg-white  w-full  flex  items-center justify-between  nav-div p-2">
      <div className="max-w-screen-xl first-div">
        <div className="profile-div flex flex-row">
          <div href="/" className="flex items-center rounded-full ml-4">
            <img
              src={userData.profilePhoto}
              className="h-20 mr-3 w-20 object-cover  rounded-full  ring-2 ring-gray-300 dark:ring-gray-500"
              alt="Flowbite Logo"
            />
          </div>
          <div className="name-div flex items-center flex-col justify-center">
            <h3 className="text-center font-bold text-xl	">{userData.name}</h3>
            <span className="">@Lorem ipsum dolor</span>
          </div>
        </div>
      </div>
      <div className="second-div relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          className="w-8 h-8"
          viewBox="0 0 256 256"
          xmlSpace="preserve"
        >
          <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
            <path
              d="M 77.435 77.343 H 12.565 c -3.467 0 -6.288 -2.82 -6.288 -6.287 c 0 -3.905 1.703 -7.601 4.673 -10.138 c 1.634 -1.395 2.57 -3.427 2.57 -5.574 V 31.479 C 13.521 14.122 27.643 0 45 0 s 31.479 14.122 31.479 31.479 v 23.865 c 0 2.147 0.937 4.179 2.57 5.574 c 2.97 2.537 4.673 6.231 4.673 10.138 C 83.722 74.522 80.901 77.343 77.435 77.343 z M 45 6 C 30.951 6 19.521 17.43 19.521 31.479 v 23.865 c 0 3.905 -1.703 7.601 -4.673 10.137 c -1.633 1.396 -2.57 3.427 -2.57 5.575 c 0 0.158 0.129 0.287 0.288 0.287 h 64.869 c 0.158 0 0.287 -0.129 0.287 -0.287 c 0 -2.148 -0.937 -4.181 -2.569 -5.575 c -2.971 -2.537 -4.674 -6.232 -4.674 -10.137 V 31.479 C 70.479 17.43 59.049 6 45 6 z"
              style={{
                stroke: "none",
                strokeWidth: 1,
                strokeDasharray: "none",
                strokeLinecap: "butt",
                strokeLinejoin: "miter",
                strokeMiterlimit: 10,
                fill: "rgb(0,0,0)",
                fillRule: "nonzero",
                opacity: 1,
              }}
              transform="matrix(1 0 0 1 0 0)"
              strokeLinecap="round"
            />
            <path
              d="M 45 90 c -8.589 0 -15.576 -6.987 -15.576 -15.576 c 0 -0.055 0.002 -0.133 0.006 -0.199 c 0.062 -1.602 1.38 -2.882 2.998 -2.882 c 1.657 0 3 1.343 3 3 c 0 0.041 -0.001 0.095 -0.004 0.146 C 35.459 79.74 39.742 84 45 84 c 5.259 0 9.541 -4.261 9.576 -9.512 c -0.002 -0.052 -0.004 -0.105 -0.004 -0.146 c 0 -1.657 1.343 -3 3 -3 c 1.618 0 2.938 1.282 2.998 2.886 c 0.003 0.065 0.006 0.143 0.006 0.195 C 60.576 83.013 53.589 90 45 90 z"
              style={{
                stroke: "none",
                strokeWidth: 1,
                strokeDasharray: "none",
                strokeLinecap: "butt",
                strokeLinejoin: "miter",
                strokeMiterlimit: 10,
                fill: "rgb(0,0,0)",
                fillRule: "nonzero",
                opacity: 1,
              }}
              transform="matrix(1 0 0 1 0 0)"
              strokeLinecap="round"
            />
          </g>
        </svg>
        <span className="absolute w-3 h-3 bg-red-800 top-0 left-o rounded-full border border-white"></span>
      </div>
    </nav>
  );
};

export default Navbar;
