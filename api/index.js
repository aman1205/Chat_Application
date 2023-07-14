const express = require('express')
const mongoose = require('mongoose')
const User = require('./router/user')
const bodyParser = require('body-parser');
const cors = require('cors')
const ws = require('ws')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const MessageModel = require('./model/Message')

const app = express()
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))
app.use(bodyParser.json());
app.use(cookieParser());

const jwtSecret = '035dc459d0232d13107f717bd0c64f22f6e7731180a27407fe892b7863e037338184af393a5902735f8c7a4487786f44bfa1d86876686d5200d05ac906007f62';

port = process.env.PORT || 5000
mongoose.connect('mongodb://127.0.0.1:27017/chat', {
    // useNewUrlParse:true,
    useUnifiedTopology: true,
    // useCreateIndex:true
}).then(console.log("MongoDB is Connected")).catch((err) => { console.log(err) })

app.use('/api', User)



// const server = app.listen(port,()=>{
//     console.log(`Node is connected ${port}`)
// })

const server = app.listen(port);

//WebSocket server 
const wss = new ws.WebSocketServer({ server });
wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookiesString = cookies.split(';').find(str => str.startsWith('token'));
        if (tokenCookiesString) {
            const token = tokenCookiesString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userdata) => {
                    if (err) throw err;
                    const { userId, userName } = userdata;
                    connection.userId = userId;
                    connection.Username = userName;
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

    [...wss.clients].forEach(clients => {
        clients.send(JSON.stringify({
            online: [...wss.clients].map(c => (
                { userId: c.userId, Username: c.Username }))
        }));
    });

});