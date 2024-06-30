const express = require('express');
const UserRoutes = require('./router/userRoutes');
const bodyParser = require('body-parser');
const cors = require('cors');
const ws = require('ws');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const MessageModel = require('./model/Message');
const UserModel = require('./model/user');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const DataBaseConnection = require('./config/db');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const app = express();

// Middlewares
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());

// Rate Limiting
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);
const port = process.env.PORT || 5000;

// Connecting to Database
DataBaseConnection();

// Routes
app.use('/api', UserRoutes);
app.get('/', (req, res) => {
  res.status(200).json({ message: "Hey developer" });
});

// JWT Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.sendStatus(403);
  }
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// WebSocket server setup
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers based on number of CPUs
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });

  const gracefulShutdown = () => {
    for (const id in cluster.workers) {
      console.log(`Shutting down worker ${id}`);
      cluster.workers[id].kill();
    }
    process.exit();
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

} else {
  // Worker code - handle WebSocket connections
  const server = app.listen(port, () => {
    console.log(`Worker ${process.pid} is running at PORT ${port}`);
  });

  const wss = new ws.WebSocketServer({ server });

  wss.on('connection', (connection, req) =>   {
    function notifyAboutOnlinePeople() {
      const onlinePeople = [...wss.clients].filter(client => client.isAlive).map(client => ({
        userId: client.userId,
        username: client.username,
        profilePhoto: client.profilePhoto,
      }));

      const onlineUserIds = onlinePeople.map(user => user.userId);

      getAllUsers().then(allUsers => {
        const offlinePeople = allUsers.filter(user => !onlineUserIds.includes(user._id.toString())).map(user => ({
          userId: user._id,
          username: user.name,
          profilePhoto: user.profilePhoto,
        }));

        const payload = {
          online: onlinePeople,
          offline: offlinePeople,
        };

        [...wss.clients].forEach(client => {
          client.send(JSON.stringify(payload));
        });
      });
    }

    connection.isAlive = true;
    connection.timer = setInterval(() => {
      connection.ping();
      connection.deathTimer = setTimeout(() => {
        connection.isAlive = false;
        clearInterval(connection.timer);
        connection.terminate();
        notifyAboutOnlinePeople();
      }, 1000);
    }, 5000);

    connection.on('pong', () => {
      clearTimeout(connection.deathTimer);
    });

    const cookies = req.headers.cookie;
    if (cookies) {
      const tokenCookiesString = cookies.split(';').find(str => str.trim().startsWith('refreshToken='));
      if (tokenCookiesString) {
        const token = tokenCookiesString.split('=')[1];
        if (token) {
          jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
              console.error("JWT verification error:", err);
              return;
            }
            const userId = user.userId;
            const foundUser = await UserModel.findById(userId);
            if (foundUser) {
              connection.userId = userId;
              connection.username = foundUser.name;
              connection.profilePhoto = foundUser.profilePhoto;
              notifyAboutOnlinePeople();
            }
          });
        }
      }
    }

    connection.on('message', async (message) => {
      try {
        const messData = JSON.parse(message.toString());
        const { recipient, text } = messData;
        const messDoc = await MessageModel.create({
          sender: connection.userId,
          recipient,
          text,
        });
        if (recipient && text) {
          [...wss.clients]
            .filter(c => c.userId === recipient)
            .forEach(c => c.send(JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              _id: messDoc._id,
            })));
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    connection.on('close', () => {
      clearInterval(connection.timer);
      clearTimeout(connection.deathTimer);
      notifyAboutOnlinePeople();
    });

    notifyAboutOnlinePeople();
  });

  async function getAllUsers() {
    return await UserModel.find({});
  }
}
