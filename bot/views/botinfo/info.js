let process = require("process");
const ufmt = require("../../utils/formatting.js");
const pBar = ufmt.progressBar;
const dateCreated = 1546300800000;
let msToDay = 1000*60*60*24;
module.exports = function( lToken ){
	let obj = {
		"embed": {
			"title": "A simple and fun idle game bot.\n[ This bot is still in early beta. ]",
			"description": "",
			"thumbnail":{
				"url":"https://i.imgur.com/86XfHBp.gif"
			},
			"color": 0xfec31b,
			"author":{
				"name":"Coffee",
				"icon_url": "https://i.imgur.com/cFTSxmq.png"
			},
			"fields": [
				{
					"name":"Invite Link",
					"value": "[Click here to invite Coffee to your server](https://discordapp.com/api/oauth2/authorize?client_id=350823530377773057&permissions=0&scope=bot)"
				}
			],
			"footer":{
				"text":`Created on 1/1/2019. Currently ${Math.floor((new Date().getTime() - dateCreated) / msToDay) } days old.`
			}
		}
	}

	return obj; 
}
