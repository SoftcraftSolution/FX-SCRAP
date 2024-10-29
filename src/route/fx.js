// routes/currencyRoutes.js

const express = require('express');
const fxcontroller = require('../controller/fxcontroller'); // Import the new function

const router = express.Router();

// Define the route to fetch and save currency data
router.get('/currencies',fxcontroller.fetchAndReturnCurrencyData); // Use the combined function for the /currencies endpoint

module.exports = router;
