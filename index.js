const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Investing.com currency rates URL
const url = 'https://www.investing.com/currencies/';

app.get('/currency-rates', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Adjust the path as needed
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Use these args if you're running in a restricted environment
    });
    const page = await browser.newPage();

    // Go to the Investing.com currency rates page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the currency rates table to load
    await page.waitForSelector('#cr1', { timeout: 60000 });

    // Scrape the data
    const rates = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#cr1 tbody tr'));
      return rows.map(row => {
        const asset = row.querySelector('td:nth-child(2) a')?.innerText.trim() || 'N/A';
        const last = row.querySelector('td:nth-child(3)')?.innerText.trim() || 'N/A';
        const open = row.querySelector('td:nth-child(4)')?.innerText.trim() || 'N/A';
        const high = row.querySelector('td:nth-child(5)')?.innerText.trim() || 'N/A';
        const low = row.querySelector('td:nth-child(6)')?.innerText.trim() || 'N/A';
        const change = row.querySelector('td:nth-child(7)')?.innerText.trim() || 'N/A';
        const percentChange = row.querySelector('td:nth-child(8)')?.innerText.trim() || 'N/A';
        const time = row.querySelector('td:nth-child(9)')?.innerText.trim() || 'N/A';

        return { asset, last, open, high, low, change, percentChange, time };
      });
    });

    // Send the data as a JSON response
    res.json({
      success: true,
      data: rates,
    });

  } catch (error) {
    console.error('Error fetching data: ', error);

    // Send error response
    res.status(500).json({
      success: false,
      message: 'Failed to scrape currency rates from Investing.com',
    });
  } finally {
    if (browser) {
      await browser.close(); // Ensure the browser is closed in case of an error
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
