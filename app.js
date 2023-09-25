const express = require('express');
require('dotenv').config()
const app = express();
const path = require('path');
const userRouter = require('./routers/user.js');
const adminRouter = require('./routers/admin.js');
