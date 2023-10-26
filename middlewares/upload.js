const multer = require('multer');
const path = require('path');

// handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });

module.exports = upload
// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Specify the directory where uploaded files will be stored
//         cb(null, "./public/admin/uploads"); // Create the 'uploads' directory in your project
//     },
//     filename: (req, file, cb) => {
//         // Define the file name for the uploaded file
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });

// const uploads = multer({ storage: storage });

// module.exports = uploads;
// multer