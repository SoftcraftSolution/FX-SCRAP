const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// Moneycontrol Currency Rates URL
const url = 'https://www.moneycontrol.com/markets/currencies/';

app.get('/forward-rates', async (req, res) => {
  try {
    // Fetch the HTML of the Moneycontrol currencies page
    const { data } = await axios.get(url);
    
    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Scrape the forward rates data
    const forwardRates = [];
    
    // Find the table containing the forward rates
    const rows = $('.Rbirefrencerate_web_rbi_ref_frwd_rates_sec__iKUxS table tbody tr');
    rows.each((index, row) => {
      const currencyPair = $(row).find('td:nth-child(1)').text().trim() || 'N/A';
      const rate = $(row).find('td:nth-child(2)').text().trim() || 'N/A';
      forwardRates.push({ currencyPair, rate });
    });

    // Send the forward rates data as a JSON response
    res.json({
      success: true,
      data: forwardRates,
    });

  } catch (error) {
    console.error('Error fetching data: ', error);

    // Send error response
    res.status(500).json({
      success: false,
      message: 'Failed to scrape forward rates from Moneycontrol',
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
