const app = require('express')();

const port = 8080;
app.get('/', (req, res) => {
	console.log('Got a request');
	res.status(200).json({ status: "ok" });
});

console.log(`Running on port ${port}`);
app.listen(port);
