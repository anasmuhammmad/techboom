const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ['credit', 'debit', 'transfer'], required: true },
  amount: { type: Number, required: true },
  description: String,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;