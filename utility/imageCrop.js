const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function cropImage(files) {
  const promises = files.map(async (ob) => {
    try {
      await sharp(`./public/uploads/${ob}`)
        .resize({
          width: 300,
          height: 300,
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(`public/uploads/cropped_images/${ob}`);
      console.log(`Cropping image ${ob}`);
    } catch (err) {
      throw err;
    }
  });

  await Promise.all(promises);
}

module.exports = 
  cropImage

