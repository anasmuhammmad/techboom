
const bcrypt = require('bcrypt');
const UserModel = require('../models/userSchema');

async function registerUser(username, email, password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = await UserModel.create({ username, email, password: hashedPassword });
  return newUser;
}

module.exports = registerUser;