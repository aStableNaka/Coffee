const ufmt = require("../../utils/fmt.js");
module.exports = function( lToken ){
	return {
		"embed": {
			"title": `\"Hmm... I can't seem to find what you're looking for, ${ufmt.name(lToken)}!\"`,
			"description":`You asked for [ ***${ lToken.mArgs.itemAlias }*** ]`,
			"color": 0xff6666,
			"author":{
				"name":"Mr. B.P. Banker",
				"icon_url": "https://i.imgur.com/9AKha1V.png"
			}
		}
	}
}
