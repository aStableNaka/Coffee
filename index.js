const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile('index.html', {root:'.'});
});


const bot = require("./bot/main.js");

app.listen(3000, () => console.log("[Express] Online"));