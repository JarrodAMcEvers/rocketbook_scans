const axios = require('axios');
const { redirect } = require('express/lib/response');
const puppeteer = require('puppeteer');
const PCLOUD_OAUTH_ENDPOINT = 'https://my.pcloud.com/oauth2/authorize';

exports.authWithPCloud = async () => {
    console.log('Launching browser.');
    const browser = await puppeteer.launch({ headless: false });
    console.log('Launching new page.');
    const page = await browser.newPage();
    console.log('Going to pCloud OAuth2 endpoint.');
    await page.goto(`${PCLOUD_OAUTH_ENDPOINT}?client_id=${process.env.CLIENT_ID}&response_type=token&redirect_uri=http://localhost:8080`);
    console.log('Entering credentials.');
    await page.waitForSelector('input[name=email]');
    await page.focus('input[name=email]');
    await page.keyboard.type('jarrodamcevers@gmail.com');
    await page.click('button[type=submit]');
    await page.waitForSelector('input[name=password]');
    await page.focus('input[name=password]');
    await page.keyboard.type('unxh9FKKye*m*6CN3GoAsNrv4tQH3Jy9dB7iNG');
    console.log('Logging in.');
    await page.click('button[type=submit]');
    await page.waitForNavigation();

    const redirectURL = await page.url();
    const arrayOfParams = redirectURL.split('#')[1].split('&');
    const queryParams = {};
    for (let param of arrayOfParams) {
        let parts = param.split('=');
        queryParams[parts[0]] = parts[1];
    }

    // close the browser last as the redirectURL changes if it happens before creating the dictionary of query params
    console.log('Closing browser.')
    await browser.close();

    return queryParams;
}

exports.authWithPCloud()