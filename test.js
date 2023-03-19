const pCloud = require('./src/pcloud');
pCloud.authWithPCloud()
    .then(async (data) => {
        const pcloud = new pCloud(data.hostname, data.access_token, data.userid);
        console.log(pcloud.userID);
        console.log(pcloud.accessToken);
        console.log(pcloud.apiHost);
        await pcloud.fetchFolderId('/Documents/RocketbookScans');
        console.log(pcloud.folderID);
        const result = await pcloud.uploadFileToFolder('/Users/jarrodmcevers/http.yaml');
        console.log(result);
    });