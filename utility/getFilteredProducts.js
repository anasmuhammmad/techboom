// const Product = require('../models/productSchema');
// const filter = async (req, res) => {
//     try {
//       const { , priceRanges } = req.query;
//       let filters = {};
  
//       if (brand && brand !== 'ALL') {
//         filters.BrandName = brand;
//       }
  
//       console.log("............",filters,priceRanges);
//       if (priceRanges) {
//         const priceRangesArray = priceRanges.split(','); 
//         // console.log("----------",priceRanges,'.........',priceRangesArray);
//         const priceFilter = priceRangesArray.map((range) => {
//           const [min, max] = range.split('-');
//           let modifiedMax = max;
  
//           if (max == 0) {
//             modifiedMax = Number.MAX_VALUE;
//           }
        
//           // console.log("***************",min,max);
          
//           return {
//             DiscountAmount: { ...(min ? { $gte: parseFloat(min) } : {}), ...(max ? { $lt: parseFloat(modifiedMax) } : {}) },
//           };
//         });
  
  
//         // console.log("/\/\/\/\/\/\/\/\\/\/\/\/\/\/\/\/\/\/\/",priceFilter);
//         filters = { ...filters, $or: priceFilter };
//       }
//       // console.log("/\/\/\/\/\/\/\/\\/\/\/\/\/\/\/\/\/\/\/",filters);
//       const data = await productData.find(filters).exec();
//       // console.log("/\/\/\/\/\/\/\/\\/\/\/\/\/\/\/\/\/\/\/",data);
//       res.json(data);
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     }
//   };
  
  