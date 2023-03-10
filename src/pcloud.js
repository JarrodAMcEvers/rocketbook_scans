const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const PCLOUD_OAUTH_ENDPOINT = 'https://my.pcloud.com/oauth2/authorize';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:8080'

class pCloud {
    constructor(apiHost, accessToken, userID) {
        this.apiHost = `https://${apiHost}`;
        this.accessToken = accessToken;
        this.userID = userID;
    }

    fetchFolderId = async (pCloudPath) => {
        const response = await axios.get(`${this.apiHost}/listfolder?access_token=${this.accessToken}&path=${pCloudPath}`);
        this.folderID = response.data.metadata.folderid;
    }

    uploadFileToFolder = async (filePath) => {
        const fileName = filePath.split('/').slice(-1)[0];
        console.log(`Uploading ${fileName}.`);
        const response = await axios.put(
            `${this.apiHost}/uploadfile?access_token=${this.accessToken}&folderid=${this.folderID}&filename=${fileName}`,
            fs.readFileSync(filePath)
        );
        console.log('Upload complete.');
        return response;
    }
}

exports.authWithPCloud = async () => {
    console.log('Launching browser.');
    const browser = await puppeteer.launch({ headless: false });

    console.log('Launching new page.');
    const page = await browser.newPage();

    console.log('Going to pCloud OAuth2 endpoint.');
    await page.goto(`${PCLOUD_OAUTH_ENDPOINT}?client_id=${process.env.CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}`);

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

exports.authWithPCloud();