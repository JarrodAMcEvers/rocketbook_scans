const fs = require('fs');
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

loadExistingCredentials = async () => {
    try {
        const content = await fs.readFileSync(TOKEN_PATH);
        const credentials = JSON.parse(content);
        console.log('Found existing credentials, continuing.');
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.log('Could not find/read existing credentials file.', err);
        return null;
    }
}

saveCredentials = async (client) => {
    const content = await fs.readFileSync(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFileSync(TOKEN_PATH, payload);
}

authorize = async () => {
    let client = await loadExistingCredentials();
    return client ? client : null;
}

downloadRocketbookScanFromGmail = async (auth) => {
    const gmail = google.gmail({ version: 'v1', auth });

    console.log('Checking inbox for Rocketbook scans...');
    const rocketbookMessages = await gmail.users.messages.list({
        userId: 'me',
        q: 'label:inbox subject: Rocketbook Scan'
    });

    // exit if there are no messages
    if (rocketbookMessages.data.resultSizeEstimate === 0) {
        console.log('No Rocketbook scans were found in the inbox, exiting.');
        return;
    }

    console.log('Number of messages found:', rocketbookMessages.data.resultSizeEstimate);
    const downloadedFiles = [];
    for (let message of rocketbookMessages.data.messages) {
        const messageId = message.id;
        const res = await gmail.users.messages.get({ userId: 'me', id: messageId });
        // iterate over the parts to find the part with the attachment
        for await (let part of res.data.payload.parts) {
            if (part.body && part.body.attachmentId) {
                console.log('Found email that has an attachment.');
                const filename = part.filename.replace(/\s+/g, '');
                const attachmentId = part.body.attachmentId;
                console.log('Fetching Rocketbook attachment.');
                const res = await gmail.users.messages.attachments.get({ userId: 'me', messageId: messageId, id: attachmentId });
                console.log('Writing raw attachment data to file.');
                await fs.writeFileSync(filename, Buffer.from(res.data.data, 'base64'));
                downloadedFiles.push(filename);
            }
        }

        console.log('Archiving message.');
        // remove the INBOX label from the message to archive it
        await gmail.users.messages.modify({ userId: 'me', id: messageId, requestBody: { removeLabelIds: ['INBOX'] } });
    }
    console.log('Files downloaded', downloadedFiles);

}

authorize()
    .then(auth => downloadRocketbookScanFromGmail(auth))
