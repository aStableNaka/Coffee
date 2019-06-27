const ufmt = require("../../utils/fmt.js");
const pN = ufmt.numPretty;

module.exports = function( Chicken, bal, cost, item ){
	return {
		"embed": {
			"title": `"You don't have enough BP to buy '${ item.name }' ***x${ Chicken.mArgs.amount }***!"`,
			"description": `${ufmt.name(Chicken)}`,
			"color": 0xff6666,
			"author":{
				"name":"Mr. B.P. Banker",
				"icon_url": "https://i.imgur.com/9AKha1V.png"
			},
			"fields": [
				{
					"name":"Balance",
					"value":`***${ pN( bal ) }*** BP`,
					"inline":true
				},
				{
					"name": "Required",
					"value": `***${ pN( cost ) }*** BP`,
					"inline":true
				}
			]
		}
	}
}
