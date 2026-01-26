const express = require("express");
const UserRoutes = require("./router/userRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");
const ws = require("ws");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();
const validateEnv = require("./config/validateEnv");

// Validate environment variables before starting the application
validateEnv();

const DataBaseConnection = require("./config/db");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

// Middlewares
app.use(
  cors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGIN
      ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
      : ["http://localhost:3000", "http://192.168.201.162:3000"],
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
const healthRoutes = require("./routes/healthRoutes");

app.use("/api", UserRoutes);
app.use("/health", healthRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hey developer" });
});

// 404 handler for undefined routes (must be after all routes)
app.use(notFound);

// Global error handler (must be last middleware)
app.use(errorHandler);

// WebSocket server setup
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

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
}
