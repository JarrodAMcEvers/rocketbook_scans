# Move Rocketbook scans from your Gmail inbox into pCloud

## Google Cloud set up
1. Create OAuth 2.0 Client credentials.
1. Make sure to keep the app in Testing mode. This is important for the scopes needed to modify Gmail messages.
1. Add the email addresses of people you want for the test users. They have to be added while the app is in test mode or you will get errors when you try to give Google consent for an account.

This [guide](https://developers.google.com/gmail/api/quickstart/nodejs) has more information on the set up.

## Flow
1. Set up express server.
```bash
node http_server.js &
```

1. Run the app.
```bash
```

## Running on M1 Macs
```bash
export PUPPETEER_EXPERIMENTAL_CHROMIUM_MAC_ARM=true
CLIENT_ID=12345 node test.js
```
