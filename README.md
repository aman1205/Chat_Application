# Real-Time Chat Application

A production-ready real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and WebSocket for bidirectional communication. Features modern gradient UI design, horizontal scalability with Redis Pub/Sub, and comprehensive security measures.

## Screenshots

<img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/bfa087f3-7106-42aa-8108-17f845c6bb94" />
<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/b31edf12-a25a-42d3-bfb6-5d95650eb24a" />

## Features

### Core Functionality
- **Real-time messaging** with WebSocket connections
- **User authentication** with JWT (Access + Refresh tokens)
- **Online/Offline status** tracking
- **Message persistence** with MongoDB
- **Optimistic UI updates** for instant message feedback
- **Cross-worker messaging** with Redis Pub/Sub
- **Automatic token refresh** with seamless UX

### UI/UX
- **Modern gradient design** with glass-morphism effects
- **Responsive layout** for mobile and desktop
- **Dynamic user status** (online/offline indicators)
- **Message timestamps** and delivery indicators
- **Smooth animations** and transitions
- **Empty state** with engaging visuals

### Backend
- **Horizontal scalability** with Node.js cluster mode
- **Redis Pub/Sub** for cross-worker communication
- **Input validation** with Joi schemas
- **Rate limiting** for API endpoints
- **Centralized error handling**
- **Database connection resilience** with retry logic
- **Health check endpoints** (liveness/readiness)
- **Request logging** with structured format

### Security
- **JWT-based authentication** with HttpOnly cookies
- **Password hashing** with bcrypt
- **Input sanitization** to prevent XSS attacks
- **CORS configuration** for allowed origins
- **Rate limiting** to prevent brute-force attacks
- **Helmet.js** for security headers
- **Environment variable validation**

## Architecture

### Frontend Structure
```
ui/src/
├── Component/
│   ├── Main.jsx              # Main container (orchestration)
│   ├── ChatSidebar.jsx       # Sidebar with user list
│   ├── ChatArea.jsx          # Chat messages and input
│   ├── Messages.jsx          # Message display component
│   ├── UserList.jsx          # Online/offline user list
│   └── ChatNav.jsx           # Chat header with status
├── hooks/
│   ├── useChat.js            # Chat state management hook
│   └── useWebSocket.js       # WebSocket connection hook
├── redux/                    # Redux store for auth
├── axios.js                  # Axios instance with interceptors
└── constant.js               # API URLs and constants
```

### Backend Structure
```
api/src/
├── controller/
│   └── userController.js     # User and message controllers
├── middleware/
│   ├── tokenmiddleware.js    # JWT verification & refresh
│   ├── validationMiddleware.js # Input validation
│   ├── rateLimitMiddleware.js  # Rate limiting
│   └── errorMiddleware.js    # Error handling
├── model/
│   ├── user.js               # User schema
│   └── Message.js            # Message schema
├── routes/
│   ├── userRoutes.js         # API routes
│   └── healthRoutes.js       # Health check routes
├── services/
│   └── pubSubManager.js      # Redis Pub/Sub manager
├── config/
│   ├── db.js                 # MongoDB connection
│   └── validateEnv.js        # Environment validation
├── validation/
│   └── schemas.js            # Joi validation schemas
└── websocketHandler.js       # WebSocket logic
```

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5.0 or higher)
- **Redis** (v6.0 or higher)
- **npm** or **yarn**

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd chat-app
```

### 2. Install backend dependencies
```bash
cd api
npm install
```

### 3. Install frontend dependencies
```bash
cd ../ui
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `api` directory:

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/chatdb

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate strong random strings)
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# CORS (comma-separated list)
ALLOWED_ORIGIN=http://localhost:3000,http://192.168.1.100:3000

# Optional
LOG_LEVEL=info
```

### Frontend Configuration

Update `ui/src/constant.js` if needed:

```javascript
export const WS_URL = 'http://localhost:5000'; // Backend URL
```

### Database Setup

1. **Start MongoDB**:
   ```bash
   # Windows (if installed as service)
   net start MongoDB

   # macOS/Linux
   mongod --dbpath /path/to/data
   ```

2. **Start Redis**:
   ```bash
   # Windows (with WSL or Redis for Windows)
   redis-server

   # macOS
   brew services start redis

   # Linux
   sudo systemctl start redis
   ```

## Usage

### Development Mode

1. **Start the backend** (from `api` directory):
   ```bash
   npm start
   ```
   This will start the server in cluster mode with multiple workers on port 5000.

2. **Start the frontend** (from `ui` directory):
   ```bash
   npm start
   ```
   This will start the React development server on port 3000.

3. **Open your browser**:
   ```
   http://localhost:3000
   ```

### Production Deployment

1. **Build the frontend**:
   ```bash
   cd ui
   npm run build
   ```

2. **Set production environment variables** in `api/.env`:
   ```env
   NODE_ENV=production
   ```

3. **Start the backend with PM2** (recommended):
   ```bash
   cd api
   npm install -g pm2
   pm2 start src/index.js --name chat-api
   pm2 save
   pm2 startup
   ```

4. **Serve the frontend** with Nginx or serve the build folder directly.

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user

### Users
- `GET /api/profile` - Get current user profile
- `GET /api/alluser` - Get all users (online/offline)

### Messages
- `GET /api/messages/:userId` - Get messages with specific user
  - Query params: `limit` (default: 50), `before` (cursor for pagination)

### Health
- `GET /health/liveness` - Check if server is running
- `GET /health/readiness` - Check if server can serve traffic (DB + Redis)

## WebSocket Events

### Client → Server
```javascript
// Send message
{
  recipient: "userId",
  text: "message text"
}

// Heartbeat (ping)
"ping"
```

### Server → Client
```javascript
// Online/offline users update
{
  online: [{ userId, username, profilePhoto }],
  offline: [{ userId, username, profilePhoto }]
}

// New message
{
  _id: "messageId",
  text: "message text",
  sender: "senderId",
  recipient: "recipientId",
  createdAt: "timestamp"
}

// Heartbeat response
"pong"
```

## Project Highlights

### Recent Improvements

1. **Frontend Refactoring**:
   - Reduced Main.jsx from 486 lines to 153 lines (68% reduction)
   - Extracted logic into custom hooks (`useChat`, `useWebSocket`)
   - Created reusable presentational components
   - Improved code maintainability and testability

2. **Backend Production Readiness**:
   - Fixed token refresh middleware bug (now calls `next()`)
   - Implemented Redis Pub/Sub for cross-worker messaging
   - Added comprehensive input validation
   - Implemented rate limiting on all endpoints
   - Added centralized error handling
   - Database connection resilience with retry logic

3. **Modern UI Design**:
   - Gradient color scheme (indigo → purple → pink)
   - Glass-morphism effects with backdrop blur
   - Smooth animations and transitions
   - Responsive mobile-first design

### Key Technical Decisions

- **Token Refresh**: Uses custom header (`X-New-Access-Token`) to avoid double responses
- **Redis Pub/Sub**: Preferred over Socket.IO for minimal code changes and better control
- **Optimistic Updates**: Messages appear instantly, improving perceived performance
- **Cluster Mode**: Utilizes all CPU cores for better performance
- **Memoization**: Uses React hooks (`useMemo`, `useCallback`) to prevent unnecessary re-renders

## Troubleshooting

### Common Issues

1. **Chat area not showing when selecting user**:
   - Ensure backend server has been restarted after code changes
   - Check browser console for errors
   - Verify API is returning `{ messages: [...] }` format

2. **WebSocket connection errors**:
   - Verify Redis is running: `redis-cli ping` (should return "PONG")
   - Check CORS configuration in backend `.env`
   - Ensure WebSocket URL uses correct protocol (`ws://` or `wss://`)

3. **Token expired errors**:
   - Clear browser localStorage and re-login
   - Verify `REFRESH_TOKEN_SECRET` is set in `.env`
   - Check cookie settings allow HttpOnly cookies

4. **Messages not appearing across workers**:
   - Verify Redis Pub/Sub channels are subscribed: `redis-cli PUBSUB CHANNELS`
   - Check backend logs for Pub/Sub initialization messages
   - Ensure all workers are connected to the same Redis instance

### Debugging Tips

- Check backend logs for detailed error messages
- Monitor Redis with: `redis-cli MONITOR`
- Check MongoDB connection: `mongosh` and verify database exists
- Use browser DevTools Network tab to inspect API requests/responses
- Enable verbose logging by setting `LOG_LEVEL=debug` in `.env`

## Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Real-time message sending/receiving
- [ ] Online/offline status updates
- [ ] Message persistence (refresh page)
- [ ] Token refresh (wait 25+ minutes)
- [ ] Cross-worker messaging (if using cluster mode)
- [ ] Mobile responsiveness
- [ ] Logout functionality

### Load Testing

Use Artillery for load testing:

```bash
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:5000/api/alluser
```

## Performance Optimization

- **Frontend**: React.memo for components, useMemo/useCallback for expensive computations
- **Backend**: Database indexes on frequently queried fields, Redis caching for online users
- **WebSocket**: Heartbeat mechanism to detect stale connections, connection throttling
- **Database**: Pagination for message fetching, lean queries for better performance

## Security Best Practices

- Never commit `.env` files to version control
- Use strong random strings for JWT secrets (32+ characters)
- Regularly update dependencies: `npm audit fix`
- Enable HTTPS in production
- Set secure cookies in production (`secure: true`)
- Implement additional validation for file uploads if adding that feature
- Monitor logs for suspicious activity
- Use environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with the MERN stack
- WebSocket implementation using native `ws` library
- UI design inspired by modern gradient aesthetics
- Redis Pub/Sub for scalable real-time architecture

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Happy Chatting!** 🚀💬
