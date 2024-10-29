const mongoose = require('mongoose');

// Define the currency schema
const currencySchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,  // Assuming each symbol is unique
    },
    price: {
        type: String,
        required: true,
    },
    change: {
        type: String,
        required: true,
    },
    changePercentage: {
        type: String,
        required: true,
    },
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create a model based on the schema
const Currency = mongoose.model('FX', currencySchema);

module.exports = Currency;
