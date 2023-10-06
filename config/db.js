const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
    // db.on("error",console.error.bind(console, "connection error:"));
    // db
};
// const userSchema = new mongoose.Schema({
//     name:String,
//     age:Number
// })
// const userModel = new mongoose.model("User",userSchema)

module.exports = {connectToDatabase};