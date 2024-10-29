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
            const price = $(element).find('td:nth-child(2)').text().trim();
            const change = $(element).find('td:nth-child(3)').text().trim();
            const changePercentage = $(element).find('td:nth-child(4)').text().trim();

            currencies.push({
                symbol,
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
                currency,
                { new: true, upsert: true } // Return the updated document
            );
            updatedCurrencies.push(updatedCurrency); // Push the updated document
        }

        console.log('Currency data updated in the database.');

        // Return the updated currency data with IDs
        res.json(updatedCurrencies);
    } catch (error) {
        console.error('Error fetching or saving data:', error);
        res.status(500).json({ error: 'Failed to fetch and save currency data' });
    }
};
