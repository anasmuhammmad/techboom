const Cart = require('../models/cartSchema');
async function createCartForUser(userId) {
  const newCart = new Cart({
    UserId: userId, // Set the UserId to match the user's ID
    // Other cart-specific data like Items and TotalAmount
  });

  // Save the new cart document to the database
  try {
    const cart = await newCart.save();
    return cart; // Return the created cart document
  } catch (err) {
    console.error(err);
    throw err; // You can choose to handle the error as needed
  }
}

module.exports = createCartForUser;