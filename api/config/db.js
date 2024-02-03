const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI
const DataBaseConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB is Connected');
    } catch (error) {
        console.log("Failed to Connected Database", error.message)
        throw error;
    }
}
    module.exports = DataBaseConnection 