const router = require('express').Router()
const User = require('../model/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const MessageModel = require('../model/Message')
const multer = require('multer');
require('dotenv').config()




const jwtSecret =process.env.JWT_SECRET_KEY;

//Function
//Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  const upload = multer({ storage: storage });


async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
      const token = req.cookies.token;
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          resolve(userData);
        });
      } else {
        reject('No credentials ');
      }
    });
  
  }

//Register Routes

router.post('/register', async (req, res) => {
    try {
        const pass = String(req.body.password)
        const hashPassword = await bcrypt.hash(pass, 10);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashPassword,
            profilePhoto: req.body.profilePhoto,
        });

        const user = await newUser.save();
        const id = user._id
        jwt.sign({ userId: user._id, username: user.name }, jwtSecret, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            else {
                res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({ id: user._id });
            }
        })


    } catch (error) {
        if (error) throw error;
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Profile Routes 
router.get('/profile', async (req, res) => {
    try {
        const token = await req.cookies.token;
        if (token) {
           const check = jwt.verify(token, jwtSecret);

           const findUser = await User.findById(check.userId).lean();
           const { password, ...user } = findUser;
           res.status(200).json(user);
        } else {
            res.status(401).json('Please Login /Register');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('Server error');
    }
});


router.get('/alluser', async (req, res) => {
    try {
        const data = await User.find({}, { _id:1,name:1, profilePhoto:1});
        if (data){
            res.status(200).json(data)
        }
        else{
            res.status(404).json("No User Found")
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('Server error');
    }
});





router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });

    if (foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);

        if (passOk) {
            jwt.sign({ userId: foundUser._id, userName: foundUser.name }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie("token", token, { sameSite: 'none', secure: true, httpOnly: true }).json({
                    id: foundUser._id,
                });
            });
        } else {
            // Password does not match
            res.status(401).json({ message: "Invalid Username or Password" });
        }
    } else {
        // User not found
        res.status(404).json({ message: "User not found" });
    }
});



router.post('/logout', (req,res)=>{
    res.cookie('token', '', {sameSite:'none', secure:true}).status(201).json('Logout Done');
})




router.get('/messages/:userId', async (req, res) => {
    try {
        const {userId} = req.params;
        const userData = await getUserDataFromRequest(req);
        const ourUserId = userData.userId;
        const messages = await MessageModel.find({
          sender:{$in:[userId,ourUserId]},
          recipient:{$in:[userId,ourUserId]},
        }).sort({createdAt: 1});
        res.json(messages);
      
    } catch (error) {
        console.error(error);
        res.status(500).json('Server error');
    }

})


module.exports = router