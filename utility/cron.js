const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Offer = require("../models/offerSchema");
const cron = require("node-cron");
const checkCategoryOffers = async () => {
  console.log("running cron");
  try {
    const currentDate = new Date();
    const InvalidCategoryOffers = await Offer.find({
    
      expiryDate: { $lte: currentDate },
    });

    if (InvalidCategoryOffers && InvalidCategoryOffers.length > 0) {
      for (let offer of InvalidCategoryOffers) {
        console.log(offer);
        const category = await Category.find({ Name: offer.categoryName });

        const result = await Product.updateMany(
          { category: category[0]._id },
          [
            {
              $set: {
                discountPrice: '$price',
              },
            },
          ]
        );

        console.log("Update result:", result);

        console.log(`Updated prices for products with expired offers`);
        console.log(`Updated prices for products with invalid offers`);
      }
    }
  } catch (error) {
    console.error("Error in the cron job:", error);
    throw error;
  }
};

// cron.schedule("*/5 * * * * *", checkCategoryOffers);
