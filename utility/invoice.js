const easyinvoice = require('easyinvoice');
const fs = require("fs");
const path = require("path");
const util = require("util");
const writeFileAsync = util.promisify(fs.writeFile);

module.exports = {
  order: async (order) => {
   
    


    // console.log(order, "utitlity");
  const data = {
            // Customize enables you to provide your own templates
            // Please review the documentation for instructions and examples
            "customize": {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
            },

            "images": {
                // "background": "https://public.easyinvoice.cloud/pdf/sample-background.pdf"
                "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'img', 'logo-si.png'), 'base64'),
                // "background": fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'background', 'your_background.png'), 'base64')
                // "background": "https://public.easyinvoice.cloud/pdf/sample-background.pdf"

            },
          
            "sender": {

                "company": "TECHBOOM",
                "address": "Gurgaon",
                "zip": "673001",
                "city": "Haryana",
                "country": "India"

     
            },
            "client": {
                "company": order.Address.Name,
                "address": order.Address.Address,
                "zip":order.Address.Pincode ,
                "zip": order.Address.Pincode,
                "city": order.Address.City,
                "state":order.Address.State,
                "Mob No":order.Address.Mobile,
              
            },
            "information": {
                "number": order._id,
                "date": order.OrderedDate,
                "due-date": order.OrderedDate
            },
            // "products": order.Items.map((product) => ({
            //     "quantity": product.Quantity,
            //     "description": product.ProductId.name, // You might want to use product description here
            //     "tax-rate": 0,
            //     "price": product.ProductId.discountPrice,
            // })),

            "products": Array.isArray(order.Items)
  ? order.Items.map((product) => ({
      "quantity": product.Quantity || 0,
      "description": (product.ProductId && product.ProductId.name) || "N/A",
      "tax-rate": 0,
      "price": (product.ProductId && product.ProductId.discountPrice) || 0,
    }))
  : [],
            "bottom-notice": "Thank You For Your Purchase",
            "settings": {
                "currency": "USD",
                "tax-notation": "vat",
                "currency": "INR",
                "tax-notation": "GST",
                "margin-top": 50,
                "margin-right": 50,
                "margin-left": 50,
                "margin-bottom": 25
            },

        // Translate your invoice to your preferred language
        // "translate": {
        //     "invoice":"invoice",  // Default to 'INVOICE'
        //     "number": "Nummer", // Defaults to 'Number'
        //     "date": "Datum", // Default to 'Date'
        //     "due-date": "Verloopdatum", // Defaults to 'Due Date'
        //     "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        //     "products": "Producten", // Defaults to 'Products'
        //     "quantity": "Aantal", // Default to 'Quantity'
        //     "price": "Prijs", // Defaults to 'Price'
        //     "product-total": "Totaal", // Defaults to 'Total'
        //     "total": "Totaal", // Defaults to 'Total'
        //     "vat": "btw" // Defaults to 'vat'
        // }
    }

    //Create your invoice! Easy!
    console.log("adsfasdsadfaf",order.Items); 
      // Create a Promise to handle the asynchronous file writing
      return new Promise(async (resolve, reject) => {
        try {
            console.log("Creating invoice...");
            console.log('Order Items:', order.items);
            // console.log("Data object:", data);
            const result = await easyinvoice.createInvoice(data);

            console.log("Invoice Result:", result);

            const filePath = path.join(__dirname, '..', 'public', 'pdf', `${order._id}.pdf`);
           
            await writeFileAsync(filePath, result.pdf, 'base64');
            
            resolve(filePath);
 } catch (error) {
            console.log(error)
            reject(error);
        }
    });
    }
};