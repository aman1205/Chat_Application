const User = require('../model/user');
const MessageModel = require('../model/Message');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../middleware/tokenmiddleware');

const userRegister = async (req, res) => {
  try {
    const { name, email, password, profilePhoto } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashPassword, profilePhoto });

    const user = await newUser.save();
    const id = user._id;

    const userDetails =  {
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      id: user._id,
    }
    const refreshToken = generateRefreshToken({ userId: id });
    const accessToken = generateAccessToken({ userId: id });
    return res
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' })
      .status(201)
      .json({ accessToken , user: userDetails});
  } catch (error) {
    console.error('Error in userRegister:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passOk = await bcrypt.compare(password, foundUser.password);
    if (!passOk) {
      return res.status(401).json({ message: 'Invalid Username or Password' });
    }

    const refreshToken = generateRefreshToken({ userId: foundUser._id });
    const accessToken = generateAccessToken({ userId: foundUser._id });
    const user = {
      name: foundUser.name,
      email: foundUser.email,
      profilePhoto: foundUser.profilePhoto,
      id: foundUser._id,
    }
    return res
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' })
      .status(200)
      .json({ accessToken  , user: user});
  } catch (error) {
    console.error('Error in userLogin:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const userLogout = (req, res) => {
  try {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in userLogout:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const userProfile = async (req, res) => {
  try {
    const userId= req.user._id;
    const user = await User.findById(userId, { password: 0 });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in userProfile:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const allUser = async (req, res) => {
  try {
    const users = await User.find({}, { _id: 1, name: 1, profilePhoto: 1 });
    if (users.length === 0) {
      return res.status(404).json({ message: 'No User Found' });
    }
    console.log("acces" , req.user)
    return res.status(200).json(users) ;
  } catch (error) {
    console.error('Error in allUser:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    const ourUserId = req.user.userId;

    // Fetch messages from MongoDB
    const messages = await MessageModel.find({
      $or: [
        { sender: userId, recipient: ourUserId },
        { sender: ourUserId, recipient: userId },
      ],
    }).sort({ createdAt: 1 });

    // Return messages in response
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getUserData:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

function  getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
          reject(err);
        }
        resolve(user);
      });
    } else {
      reject(new Error('No Authorization header'));
    }
  });
}

module.exports = {
  userRegister,
  userLogin,
  userLogout,
  userProfile,
  allUser,
  getUserData,
};
