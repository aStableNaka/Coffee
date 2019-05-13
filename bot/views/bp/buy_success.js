const ufmt = require("../../utils/formatting.js");
const pN = ufmt.numPretty;
const fmtBP = ufmt.formatBP;
const fmtBPi = ufmt.formatBPIllion;

module.exports = function( lToken, bal, nextCost, lastIncome, currentIncome, item, owned ){
	let embed = {
		"embed": {
			"title": `${ ufmt.name( lToken ) }, you've purchased ${ ufmt.block( item.name ) } x${ lToken.mArgs.amount }!`,
			"description": ufmt.join([
				ufmt.denote('Cost', `\n-${pN( nextCost )} BP`),
				ufmt.denote('Bal',`\n${ pN( bal ) } BP`),
				ufmt.denote('Income', `\n${pN( lastIncome )} -> **${pN( currentIncome ) }** BP/s`),
				ufmt.denote('You own', `\n${ufmt.block(item.name)} x${ owned }`)

			]),
			"color": 0x66ff66,
			"author":{
				"name":"Mr. B.P. Banker",
				"icon_url": "https://i.imgur.com/9AKha1V.png"
			}
		}
	}

	// Add a tip if the user didn't max buy
	if(bal.lt(100000)){
		embed.embed.footer = {
			"icon_url": "https://i.imgur.com/OyakNYo.png",
			"text": "Tip: You can buy the maximum amount of this item with \"~buy <itemCode> max\""
		};
	}

	return embed;
}
