const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const cropImage = require("../utility/bannerCrop")
const Brand = require("../models/brandSchema");
const Order = require("../models/orderSchema");
const flash = require("express-flash");
const Admin = require("../models/adminSchema");
const Banner = require("../models/bannerSchema")
const moment = require("moment");
const mongoose = require("mongoose");
const sharp = require('sharp');
const bcrypt = require("bcrypt");



    module.exports = {
        getBanners: async (req,res)=>{
            const currentBanner = await Banner.findOne({ Status: "Enabled" })
            const banners = await Banner.find()
            res.render('admin/Banner', { currentBanner: currentBanner, banners: banners, message: req.flash() })
        },
    
        getAddBanners: async(req,res)=>{
            res.render('admin/addBanner')
        },
    
        postAddBanner: async (req,res)=>{
            try {
                console.log(req.files);
        if(req.files['Image']){
        //    cropImage(req.files['Image'][0].path);
        const imagePath = req.files['Image'][0].path;
        const files = '';
        const croppedImagePath = `public/uploads/cropped_banners/${files}${req.files['Image'][0].filename}`;

        await sharp(imagePath)
        .resize(1200, 460) // Set your desired width and height
        .toFile(croppedImagePath);

                const newBanner = new Banner({
                    BannerName: req.body.bannerName,
                    Image: req.files['Image'][0].filename,
                    // CroppedImage: croppedImagePath,

                    Date: new Date(),
                })
                await newBanner.save();
                res.redirect('/admin/banners')
            }
            else{

                const newBanner = new Banner({
                    BannerName: req.body.bannerName,
                    Image: req.files['Image'] ? req.files['Image'][0].filename : null,
                    // Carosel: carosal.filter(Boolean), 
                    Date: new Date(),
                })
                await newBanner.save();
                res.redirect('/admin/banners')
            }
            } catch (err) {
                console.log(err, 'in the submit banner catch');
                throw err
            }
        },
    
        activateBanner: async (req, res) => {
            try {
                const existingBanner = await Banner.findOne({ Status: "Enabled" });
                const bannerId = new mongoose.Types.ObjectId(req.params.id)
                if (existingBanner) {
                    
                    existingBanner.Status = "Disabled";
                    await existingBanner.save();
                }
                if (existingBanner?._id == bannerId) {
                    req.flash("existing", "Its the current Status")
                    res.redirect('/admin/banners')
                }
                console.log("came here")
    
                
                const banner = await Banner.findOneAndUpdate(
                    { _id: req.params.id },
                    { Status: "Enabled" },
                    { new: true } 
                );
    
                req.flash("BannerUpdated", "Banner Updated Successfully")
                res.redirect('/admin/banners')
            } catch (error) {
                
                res.status(500).json({ error: "Internal Server Error " });
            }
        },
    
        deleteBanner: async (req, res) => {
            const banner = req.params.id
            const result = await Banner.findOneAndDelete({ _id: banner })
            if (result) {
                console.log(`Banner ${banner} deleted successfully`);
                req.flash("BannerDeleted", "Banner Deleted Successfully");
                res.redirect('/admin/banners');
            }
        }
    }
