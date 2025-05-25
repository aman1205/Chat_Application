const express = require("express");
const UserRoutes = require("./router/userRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");
const ws = require("ws");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const MessageModel = require("./model/Message");
const UserModel = require("./model/user");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();
const DataBaseConnection = require("./config/db");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

const app = express();

// Middlewares
app.use(
  cors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  })
);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());

const port = process.env.PORT || 5000;

// Connecting to Database
DataBaseConnection();

// Routes
app.use("/api", UserRoutes);
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hey developer" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
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

  cluster.on("exit", (worker, code, signal) => {
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

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
} else {
  // Worker code - handle WebSocket connections
  const server = app.listen(port, () => {
    console.log(`Worker ${process.pid} is running at PORT ${port}`);
  });

  const wss = new ws.WebSocketServer({ server });

  // Removed inline WebSocket logic and replaced with a separate module
  require("./websocketHandler")(wss);

  async function getAllUsers() {
    return await UserModel.find({});
  }
}
