npm install puppeteer axios tough-cookie axios-cookiejar-support cheerio commander
npm install -D typescript ts-node @types/node @types/cheerio

-----

import puppeteer from 'puppeteer';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

program
  .name('confluence-auto-scraper')
  .description('Logs in with Puppeteer, scrapes Confluence HTML')
  .argument('<url>', 'Confluence page URL to scrape')
  .requiredOption('-l, --login <loginUrl>', 'SSO login URL')
  .option('-o, --output <file>', 'Output file', 'page.html')
  .action(async (pageUrl, options) => {
    try {
      const cookies = await loginAndGetCookies(options.login, pageUrl);
      const html = await fetchWithCookies(pageUrl, cookies);
      fs.writeFileSync(options.output, html);
      console.log(`Saved to ${options.output}`);
    } catch (err) {
      console.error('Error:', (err as Error).message);
    }
  });

program.parse();

async function loginAndGetCookies(loginUrl: string, targetUrl: string) {
  const browser = await puppeteer.launch({ headless: false }); // set to true after setup
  const page = await browser.newPage();

  console.log(`Navigating to ${loginUrl}`);
  await page.goto(loginUrl, { waitUntil: 'networkidle2' });

  // Optional: Auto-fill username/password if you can
  // await page.type('#username', 'your_username');
  // await page.type('#password', 'your_password');
  // await page.click('#login-submit');

  console.log('Please log in manually if needed...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log(`Navigating to ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });

  const cookies = await page.cookies();

  await browser.close();
  return cookies;
}

async function fetchWithCookies(url: string, browserCookies: puppeteer.Protocol.Network.Cookie[]) {
  const jar = new CookieJar();

  // Convert Puppeteer cookies to tough-cookie format
  for (const c of browserCookies) {
    const cookieStr = `${c.name}=${c.value}; Domain=${c.domain}; Path=${c.path};`;
    await jar.setCookie(cookieStr, url);
  }

  const client = wrapper(axios.create({ jar }));

  const res = await client.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Node.js CLI)',
      'Accept': 'text/html',
    }
  });

  const $ = cheerio.load(res.data);
  const main = $('#main-content').html(); // adjust selector
  if (!main) throw new Error('Main content not found');

  return main;
}