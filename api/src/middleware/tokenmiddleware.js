const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function accessTokenMiddlewareVerify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return handleTokenError(err, req, res, next);
    }

    req.user = user;
    next();
  });
}

function handleTokenError(err, req, res, next) {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  } else if (err.name === 'TokenExpiredError') {
    return handleTokenExpired(req, res, next);
  } else {
    return res.status(403).json({ error: 'Forbidden' });
  }
}

function handleTokenExpired(req, res, next) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized: Token expired and no refresh token provided' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({ userId: decoded.userId });
    const newRefreshToken = generateRefreshToken({ userId: decoded.userId });

    // Send the new tokens in response cookies
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' });

    req.user = decoded; // Optionally update the req.user with refreshed user data
    res.status(200).json({ accessToken: newAccessToken });
    // next();
  });
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '25m' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

module.exports = { accessTokenMiddlewareVerify, generateAccessToken, generateRefreshToken };
