const mongoose = require('mongoose')
const beautifyUnique = require('mongoose-beautiful-unique-validation');


const schema = mongoose.Schema({
 
    username: {
      type: String,
      required: true,
      
    },
    email: {
      type: String,
      required: true,
      
    },
    password: {
      type: String,
      required: true
    },
    Status: { type: String ,default:"Active"},
  
    Orders: [{
       ObjectId: { type: String},
    }],
    Address: [{
       AddressLane: { type: String },
       Country: { type: String },
       Pincode: { type: String },
       State: { type: String },
    }],
    Cart: [{
    }],

  

  });
  schema.plugin(beautifyUnique);
const User= mongoose.model('User',schema)
module.exports=User;