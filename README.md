# Chat Website using MERN Stack and WebSocket

## Overview
This project is a real-time chat website built using the MERN (MongoDB, Express.js, React, Node.js) stack and WebSocket for bidirectional communication.

##Screenshot 
   ![image](https://github.com/aman1205/Chat_Application/assets/113249368/bfc30d5d-7bc4-4598-893f-c519431bbe86)

## Features
- Real-time chat with WebSocket
- User authentication
- MongoDB for data storage
- Responsive UI built with React

## Prerequisites
- Node.js and npm installed
- MongoDB installed and running
- WebSocket knowledge

## Installation
1. Clone this repository
2. Install server dependencies: `cd api && npm install`
3. Install client dependencies: `cd ui && npm install`

## Configuration
1. Set up MongoDB:
   - Create a MongoDB Atlas account or install MongoDB locally.
   - Configure your MongoDB connection string in `server/config/default.json`.

2. Set up environment variables:
   - Create a `.env` file in the `server` directory with the following variables:
     ```
     PORT=your_server_port
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```

## Usage
1. Start the server: `cd server && npm start`
2. Start the client: `cd client && npm start`
3. Open your browser and navigate to `http://localhost:3000`
   






