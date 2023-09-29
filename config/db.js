const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sample')

mongoose.connection.on('connected', ()=>{
    console.log('connected to database');
})
mongoose.connection.on('disconnected', ()=>{
    console.log('not connected to database');
})