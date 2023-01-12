const axios = require('axios');
const puppeteer = require('puppeteer');
const PCLOUD_OAUTH_ENDPOINT = 'https://my.pcloud.com/oauth2/authorize';

exports.getAccessToken = async () => {
    console.log('Launching browser.');
    const browser = await puppeteer.launch({ headless: false });
    console.log('Launching new page.');
    const page = await browser.newPage();
    console.log('Going to pCloud OAuth2 endpoint.');
    await page.goto(`${PCLOUD_OAUTH_ENDPOINT}?client_id=TeNN5Kq4es4&response_type=token&redirect_uri=http://localhost:8080`);
    await page.focus('input[name=email]');
    await page.keyboard.type('');
    await page.click('button[type=submit]');
    await page.waitForSelector('input[name=password]');
    await page.focus('input[name=password]');
    await page.keyboard.type('');
    await page.click('button[type=submit]');
    await page.waitForNavigation();

    console.log(await page.url())
    console.log('Closing browser.')
    await browser.close();
}

exports.getAccessToken()