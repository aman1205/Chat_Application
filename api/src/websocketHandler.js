const jwt = require("jsonwebtoken");
const UserModel = require("./model/user");
const MessageModel = require("./model/Message");
const Redis = require("ioredis");
const sanitizeHtml = require('sanitize-html');
const { messageSchema } = require('./validation/schemas');
const pubSubManager = require('./services/pubSubManager');

let redis;
let redisAvailable = true;
let inMemoryOnlineUsers = new Map();

try {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  redis.on("error", (error) => {
    console.error("Redis error:", error);
    redisAvailable = false;
  });
  redis.on("connect", () => {
    redisAvailable = true;
    console.log("Connected to Redis");
  });
} catch (e) {
  console.error("Failed to initialize Redis:", e);
  redisAvailable = false;
}

// Simple in-memory rate limiter: { userId: [timestamps] }
const messageRateLimit = {};
const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds
const RATE_LIMIT_MAX = 10; // max 10 messages per window

/**
 * Sets up WebSocket connection handling for the chat application.
 * @param {WebSocketServer} wss - The WebSocket server instance.
 */
async function setupWebSocket(wss) {
  // Subscribe to Redis Pub/Sub channels for cross-worker communication
  pubSubManager.subscribe('chat:message', (messageData) => {
    // Broadcast message to local clients connected to this worker
    [...wss.clients]
      .filter(c => c.userId === messageData.recipient)
      .forEach(c => {
        try {
          c.send(JSON.stringify({
            text: messageData.text,
            sender: messageData.sender,
            recipient: messageData.recipient,
            _id: messageData._id
          }));
        } catch (err) {
          console.error("WebSocket send error (pub/sub):", err);
        }
      });
  });

  // Subscribe to online user updates
  pubSubManager.subscribe('chat:online-users', (data) => {
    // Broadcast online user updates to all local clients
    [...wss.clients].forEach(client => {
      try {
        client.send(JSON.stringify(data));
      } catch (err) {
        console.error("WebSocket send error (online users):", err);
      }
    });
  });

  // Initialize Pub/Sub manager
  pubSubManager.init();

  wss.on("connection", (connection, req) => {
    console.log("New WebSocket connection established");
    handleConnection(connection, req, wss);
  });

  wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
  });
}

function addOnlineUser(userId, userData) {
  if (redisAvailable && redis) {
    // Use HSET to store user in a hash instead of individual keys
    return redis
      .hset('online_users', userId, JSON.stringify(userData))
      .catch((err) => {
        console.error("Redis error setting user:", err);
        redisAvailable = false;
        inMemoryOnlineUsers.set(userId, userData);
      });
  } else {
    inMemoryOnlineUsers.set(userId, userData);
    return Promise.resolve();
  }
}

function removeOnlineUser(userId) {
  if (redisAvailable && redis) {
    // Use HDEL to remove user from hash
    return redis.hdel('online_users', userId).catch((err) => {
      console.error("Redis error deleting user:", err);
      redisAvailable = false;
      inMemoryOnlineUsers.delete(userId);
    });
  } else {
    inMemoryOnlineUsers.delete(userId);
    return Promise.resolve();
  }
}

/**
 * Handles a new WebSocket connection.
 * @param {WebSocket} connection - The WebSocket connection.
 * @param {IncomingMessage} req - The HTTP request.
 * @param {WebSocketServer} wss - The WebSocket server instance.
 */
function handleConnection(connection, req, wss) {
  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople(wss);
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookiesString = cookies
      .split(";")
      .find((str) => str.trim().startsWith("refreshToken="));
    if (tokenCookiesString) {
      const token = tokenCookiesString.split("=")[1];
      if (token) {
        jwt.verify(
          token,
          process.env.REFRESH_TOKEN_SECRET,
          async (err, user) => {
            if (err) {
              console.error("JWT verification error:", err);
              return;
            }
            const userId = user.userId;
            try {
              const foundUser = await UserModel.findById(userId);
              if (foundUser) {
                connection.userId = userId;
                connection.username = foundUser.name;
                connection.profilePhoto = foundUser.profilePhoto;
                await addOnlineUser(userId, {
                  username: foundUser.name,
                  profilePhoto: foundUser.profilePhoto,
                });
                notifyAboutOnlinePeople(wss);
              }
            } catch (error) {
              console.error("Error finding user:", error);
            }
          }
        );
      }
    }
  }

  connection.on("message", async (message) => {
    await handleMessage(connection, message, wss, connection);
  });

  connection.on("close", async () => {
    console.log("WebSocket connection closed");
    clearInterval(connection.timer);
    clearTimeout(connection.deathTimer);
    if (connection.userId) {
      await removeOnlineUser(connection.userId);
      // Clean up rate limiter to prevent memory leak
      delete messageRateLimit[connection.userId];
    }
    notifyAboutOnlinePeople(wss);
  });

  notifyAboutOnlinePeople(wss);
}

/**
 * Notifies all connected clients about the current online and offline users.
 * @param {WebSocketServer} wss - The WebSocket server instance.
 */
async function notifyAboutOnlinePeople(wss) {
  let onlinePeople;
  if (redisAvailable && redis) {
    try {
      // Use HGETALL instead of KEYS for better performance (O(N) but non-blocking)
      const usersHash = await redis.hgetall('online_users');

      if (usersHash && Object.keys(usersHash).length > 0) {
        onlinePeople = Object.entries(usersHash).map(([userId, userDataString]) => {
          try {
            const data = JSON.parse(userDataString);
            return {
              userId,
              username: data.username,
              profilePhoto: data.profilePhoto,
            };
          } catch {
            return { userId };
          }
        });
      } else {
        onlinePeople = [];
      }
    } catch (err) {
      console.error("Redis error fetching online users:", err);
      redisAvailable = false;
      onlinePeople = Array.from(inMemoryOnlineUsers.entries()).map(
        ([userId, data]) => ({ userId, ...data })
      );
    }
  } else {
    onlinePeople = Array.from(inMemoryOnlineUsers.entries()).map(
      ([userId, data]) => ({ userId, ...data })
    );
  }

  const onlineUserIds = onlinePeople.map((user) => user.userId);

  try {
    const allUsers = await UserModel.find({});
    const offlinePeople = allUsers
      .filter((user) => !onlineUserIds.includes(user._id.toString()))
      .map((user) => ({
        userId: user._id,
        username: user.name,
        profilePhoto: user.profilePhoto,
      }));

    const payload = {
      online: onlinePeople,
      offline: offlinePeople,
    };

    [...wss.clients].forEach((client) => {
      try {
        client.send(JSON.stringify(payload));
      } catch (err) {
        console.error("WebSocket send error:", err);
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

/**
 * Handles incoming WebSocket messages.
 * @param {WebSocket} connection - The WebSocket connection.
 * @param {string} message - The message data.
 * @param {WebSocketServer} wss - The WebSocket server instance.
 */
async function handleMessage(connection, message, wss, connection) {
  // Rate limiting
  if (connection.userId) {
    const now = Date.now();
    if (!messageRateLimit[connection.userId])
      messageRateLimit[connection.userId] = [];
    messageRateLimit[connection.userId] = messageRateLimit[
      connection.userId
    ].filter((ts) => now - ts < RATE_LIMIT_WINDOW);
    if (messageRateLimit[connection.userId].length >= RATE_LIMIT_MAX) {
      try {
        connection.send(
          JSON.stringify({ error: "Rate limit exceeded. Please slow down." })
        );
      } catch (err) {
        console.error("WebSocket send error (rate limit):", err);
      }
      return;
    }
    messageRateLimit[connection.userId].push(now);
  }

  // Message validation and parsing
  let messData;
  try {
    messData = JSON.parse(message.toString());
  } catch (err) {
    try {
      connection.send(JSON.stringify({ error: "Invalid message format." }));
    } catch (sendErr) {
      console.error("WebSocket send error (invalid format):", sendErr);
    }
    return;
  }

  // Validate message against schema
  const { error, value } = messageSchema.validate(messData, {
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const errorMessage = error.details.map(d => d.message).join(', ');
    try {
      connection.send(JSON.stringify({ error: `Validation failed: ${errorMessage}` }));
    } catch (sendErr) {
      console.error("WebSocket send error (validation):", sendErr);
    }
    return;
  }

  const { recipient, text } = value;

  // Sanitize text content to prevent XSS attacks
  const sanitizedText = sanitizeHtml(text, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  }).trim();

  // Check if sanitized text is empty
  if (!sanitizedText) {
    try {
      connection.send(JSON.stringify({ error: "Message content is empty after sanitization" }));
    } catch (sendErr) {
      console.error("WebSocket send error (empty content):", sendErr);
    }
    return;
  }

  try {
    const messDoc = await MessageModel.create({
      sender: connection.userId,
      recipient,
      text: sanitizedText,
    });

    // Publish message to Redis for cross-worker delivery
    const messageData = {
      text: sanitizedText,
      sender: connection.userId,
      recipient,
      _id: messDoc._id
    };

    // Publish to Redis Pub/Sub (will be received by all workers)
    await pubSubManager.publish('chat:message', messageData);

    // Also send to local clients as fallback (in case Redis is down)
    // This ensures messages work even if Pub/Sub fails
    [...wss.clients]
      .filter((c) => c.userId === recipient)
      .forEach((c) => {
        try {
          c.send(JSON.stringify(messageData));
        } catch (err) {
          console.error("WebSocket send error (local fallback):", err);
        }
      });
  } catch (error) {
    console.error("Error processing message:", error);
    try {
      connection.send(JSON.stringify({ error: "Failed to process message." }));
    } catch (sendErr) {
      console.error("WebSocket send error (process fail):", sendErr);
    }
  }
}

module.exports = setupWebSocket;
