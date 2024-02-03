import React from "react";

const SearchBar = () => {
  return (
    <div className="w-4/5 bg-[#F5F6FA]  shadow-2xl  flex justify-center items-center mt-2  rounded-2xl">
      <div className="relative w-full">
        <div className="absolute inset-y-0  flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="text"
          id="search-navbar"
          className="block w-full p-3 pl-10 text-sm text-gray-900 border  rounded-xl bg-[#F5F6FA] focus:ring-blue-500 focus:border-black dark:bg-[#F5F6FA] dark:placeholder-gray-400 dark:text-black"
          placeholder="Search..."
        />
      </div>
    </div>
  );
};

export default SearchBar;
