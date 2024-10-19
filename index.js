const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda'); // Using chrome-aws-lambda

const app = express();
const port = process.env.PORT || 3000;

app.get('/currency-rates', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
    });

    const page = await browser.newPage();
    await page.goto('https://www.investing.com/currencies/', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('#cr1', { timeout: 60000 });

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

    await browser.close();

    res.json({
      success: true,
      data: rates,
    });

  } catch (error) {
    console.error('Error fetching data: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scrape currency rates from Investing.com',
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
