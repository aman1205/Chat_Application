const express = require('express')
const mongoose = require('mongoose')
const User = require('./router/user')
const bodyParser = require('body-parser');
const cors = require('cors')
const ws = require('ws')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const MessageModel = require('./model/Message')
const UserModel = require('./model/user')
require('dotenv').config()
const DataBaseConnection = require('./config/db')

const app = express()
// Middlewares 
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
const jwtSecret = process.env.JWT_SECRET_KEY;
port = process.env.PORT || 5000;

// Connecting to Database
DataBaseConnection()

//Routes
app.use('/api', User)
app.get('/', (req, res) => {
    res.status(200).json({ Welcome: "Hey developer" })
})
//Main  express Server 
const server = app.listen(port, () => {
    console.log(`Server is running at PORT ${port}`)
});

//WebSocket server 
const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {


    function notifyAboutOnlinePeople() {
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wss.clients].map(client => (
                    { userId: client.userId, Username: client.Username, profilePhoto: client.profilePhoto })),
            }));
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
            // console.log('dead');
        }, 1000);
    }, 5000);

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
    });

    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookiesString = cookies.split(';').find(str => str.startsWith('token'));
        if (tokenCookiesString) {
            const token = tokenCookiesString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, async (err, userdata) => {
                    if (err) throw err;
                    const { userId, userName } = userdata;
                    const user = await UserModel.findById(userId);
                    connection.userId = userId;
                    connection.Username = userName;
                    connection.profilePhoto = user.profilePhoto

                })
            }
        }

    }

    connection.on('message', async (message) => {
        const messData = JSON.parse(message.toString());
        const { recipient, text } = messData;
        const messDoc = await MessageModel.create({
            sender: connection.userId,
            recipient,
            text,

        });
        if (recipient && text) {
            [...wss.clients].filter(c => c.userId === recipient).forEach(c => c.send(JSON.stringify({
                text,
                sender: connection.userId,
                recipient,
                _id: messDoc._id
            })));
        }
    });
    notifyAboutOnlinePeople();
});