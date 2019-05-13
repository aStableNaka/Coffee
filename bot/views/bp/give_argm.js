const ufmt = require("../../utils/formatting.js");
const pN = ufmt.numPretty;

module.exports = function( lToken ){
	return {
		"embed": {
			"title": `"Huh? :D ?"`,
			"description": `${ufmt.name(lToken)}, are you trying to give away bp?`,
			"color": 0xff6666,
			"author":{
				"name":"Mr. B.P. Banker",
				"icon_url": "https://i.imgur.com/9AKha1V.png"
			},
			footer: {
				"icon_url": "https://i.imgur.com/OyakNYo.png",
				"text": "Tip: \"~bp give < @person > < amount >\" to give somebody BP!"
			}
		}
	}
}
