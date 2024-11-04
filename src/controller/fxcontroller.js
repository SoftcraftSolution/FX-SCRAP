// controllers/currencyController.js

const axios = require('axios');
const cheerio = require('cheerio');
const Currency = require('../model/fx.model'); // Import the Currency model

const url = 'https://finance.yahoo.com/markets/currencies/';

// Combined function to fetch, save, and return currency data
exports.fetchAndReturnCurrencyData = async (req, res) => {
    try {
        // Fetch the HTML content from the URL
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const currencies = [];
        $('table tbody tr').each((index, element) => {
            const symbol = $(element).find('td:nth-child(1)').text().trim();
            const name = $(element).find('td:nth-child(2)').text().trim();
            const priceWithChange = $(element).find('td:nth-child(4)').text().trim(); // Assuming price and change are in the same column

            // Split the fetched change data to get price, change, and changePercentage
            const parts = priceWithChange.split(' '); // Assuming format "price change (changePercentage)"
            const price = parts[0]; // Extract price
            const change = parts[1]; // Extract change
            const changePercentage = parts[2].replace(/\(|\)/g, ''); // Remove parentheses

            currencies.push({
                symbol,
                name,
                price,
                change,
                changePercentage,
            });
        });

        // Save or update currency data in the database
        const updatedCurrencies = []; // Array to hold updated currency data with IDs
        for (const currency of currencies) {
            const updatedCurrency = await Currency.findOneAndUpdate(
                { symbol: currency.symbol },
                {
                    name: currency.name, // Ensure name is included
                    price: currency.price,
                    change: currency.change,
                    changePercentage: currency.changePercentage,
                    updatedAt: new Date(), // Update the timestamp
                },
                { new: true, upsert: true } // Return the updated document
            );

            // Structure the response to match your required format
            updatedCurrencies.push({
                _id: updatedCurrency._id,
                symbol: updatedCurrency.symbol,
                __v: updatedCurrency.__v,
                change: updatedCurrency.change,
                changePercentage: updatedCurrency.changePercentage,
                createdAt: updatedCurrency.createdAt,
                price: updatedCurrency.price,
                updatedAt: updatedCurrency.updatedAt,
                name: updatedCurrency.name,
            });
        }

        console.log('Currency data updated in the database.');

        // Return the updated currency data with IDs
        res.json(updatedCurrencies);
    } catch (error) {
        console.error('Error fetching or saving data:', error);
        res.status(500).json({ error: 'Failed to fetch and save currency data' });
    }
};
