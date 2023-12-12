const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

function cropBannerImage(files) {
   
      sharp(`./public/uploads/${files}`)
      .resize({
        width: 600, // Adjust width and height according to banner requirements
        height: 500,
        fit: "cover", // or any other fit mode suitable for banners
        withoutEnlargement: true,
      })
      .toFile(`public/uploads/cropped_banners/${files}`, (err) => {
        if (!err) {
          console.log(`Cropping banner image ${files}`);
        } else {
          throw err;
        }
      });
   
  }

module.exports = cropBannerImage;