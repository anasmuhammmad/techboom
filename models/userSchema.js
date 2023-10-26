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
        Name: {type: String},
        AddressLane: { type: String },
        City: { type: String },
        Pincode: { type: Number },
        State: { type: String },
        Mobile: { type: Number },
      }],
      Cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart', // Reference the Cart schema
      }
    

    });
    schema.plugin(beautifyUnique);
  const User= mongoose.model('User',schema)
module.exports=User;
