const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
const PCLOUD_OAUTH_ENDPOINT = 'https://my.pcloud.com/oauth2/authorize';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:8080'

class pCloud {
    apiHost;
    accessToken;
    userID;

    constructor() { }

    authWithPCloud = async () => {
        console.log('Launching browser.');
        const browser = await puppeteer.launch({ headless: false });

        console.log('Launching new page.');
        const page = await browser.newPage();

        console.log('Going to pCloud OAuth2 endpoint to authenticate.');
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
        const responseQueryParams = redirectURL.split('#')[1].split('&');
        this.parseAndLoadResponseQueryParameters(responseQueryParams);

        // close the browser last as the redirectURL changes if it happens before creating the dictionary of query params
        console.log('Closing browser.')
        await browser.close();
    }

    parseAndLoadResponseQueryParameters(responseQueryParams) {
        console.log('All of the response query parameters: ', responseQueryParams);
        for (let param of responseQueryParams) {
            let parts = param.split('=');
            switch (parts[0]) {
                case 'hostname':
                    this.apiHost = 'https://' + parts[1]
                    break;
                case 'access_token':
                    this.accessToken = parts[1]
                    break;
                case 'userid':
                    this.userID = parts[1];
                    break;
                default:
                    break;
            }
        }
    }

    fetchAndSetFolderId = async (pCloudPath) => {
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

module.exports = pCloud