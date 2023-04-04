const pCloud = require('./src/pcloud');

const pcloud = new pCloud();
pcloud.authenticate()
    .then(async () => {
        console.log(pcloud.userID);
        console.log(pcloud.accessToken);
        console.log(pcloud.apiHost);
        await pcloud.fetchAndSetFolderId('/Documents/RocketbookScans');
        console.log(pcloud.folderID);
        const result = await pcloud.uploadFileToFolder('./README.md');
        console.log(result);
    });