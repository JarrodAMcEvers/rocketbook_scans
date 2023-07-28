const google = require('./google');
const pCloud = require('./pcloud')();

google.authorize()
    .then(auth => google.downloadRocketbookScanFromGmail(auth))
    .then(async (files) => {
        if (files.length == 0) {
            console.log('No files were found, exiting.');
            process.exit(0);
        }

        await pCloud.authenticate();
        await pCloud.fetchAndSetFolderId('/Documents/RocketbookScans');
        for (let file of files) {
            console.log(`Uploading ${file}`);
            await pCloud.uploadFileToFolder(file);
        }
    });