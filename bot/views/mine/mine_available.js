const ufmt = require("../../utils/fmt.js");
const pN = ufmt.numPretty;

module.exports = function( Chicken ){
	return {
		"embed": {
			"title": "\"Looks like you've gotten enough rest.\"",
			"description": "*You can now mine!*",
			"color": 0x66FF66,
			"author":{
				"name":"Mr. M. Iner",
				"icon_url": "https://i.imgur.com/Uuo8HMu.png"
			}
		}
	}
}
