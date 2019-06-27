const ufmt = require("../../utils/fmt.js");
const pN = ufmt.numPretty;
const fmtBP = ufmt.formatBP;

function fmtDefault(Chicken, to, amount){

}

let fmts = [ fmtDefault, null, null ];

module.exports = function( Chicken, amount ){
	let fieldFmter = fmts[ Chicken.userData.fmt_pref ] || fmts[ 0 ];
	let embed = {
		"embed": {
			"title": `"How kind!"`,
			"description": `${ufmt.name(Chicken)} gave some bp to ${ Chicken.mentions.map( (x)=>{ return `<@${ x.id }>` } ).join(' and ') }.`,
			"color": 0x66ff66,
			"author":{
				"name":"Mr. B.P. Banker",
				"icon_url": "https://i.imgur.com/9AKha1V.png"
			}
		}
	}
	return embed;
}
