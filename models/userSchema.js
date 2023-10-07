const mongoose = require('mongoose')
const beautifyUnique = require('mongoose-beautiful-unique-validation');


const schema = mongoose.Schema({
 
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },

  

  });
  schema.plugin(beautifyUnique);
const User= mongoose.model('User',schema)
module.exports=User;