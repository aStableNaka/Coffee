const ufmt = require("../../utils/formatting.js");
const bp = require("../../utils/bp.js");
const pN = ufmt.numPretty;
const fBP = ufmt.formatBP;
var bpUtils = require("../../utils/bp");
module.exports = function( lToken, outcome, perkMessages, boost ){
	let embed = {
		"embed": {
			"title": "\"Dig! Dig! Dig!\"",
			"description": `*You dig with all your might!*\n\"For a fair day's work, I reward you this sum\"\n+ ${fBP( outcome )}`,
			"color": 0x666666,
			"author":{
				"name":"Mr. M. Iner",
				"icon_url": "https://i.imgur.com/Uuo8HMu.png"
			},
			"fields": [],
			"footer":{
				"text":`[ ${lToken.userData.pickaxe_name} ] LvL ${ bp.pickaxeLevelExp( lToken.userData.pickaxe_exp ) }`
			}
		}
	}

	if(boost){
		embed.embed.description+=`\n*Your [ **${ lToken.userData.mineboostsource }** ] has increased base profits by [ **${ lToken.userData.mineboost }%** ]*\n+ ${ fBP(boost) }`,
		embed.embed.footer = {
			text: `Your [ ${ lToken.userData.mineboostsource } ] has [ ${ lToken.userData.mineboostcharge } ] ${ufmt.plural( lToken.userData.mineboostcharge, 'charge', 'charges' )} left!`
		};
	}

	embed.embed.fields = perkMessages;


	/**
	 * 327513269541535744 matt
	 * 117182716780216325 alex
	 */
	/*
	if(lToken.author.id == "327513269541535744" && !lToken.userData.mattbomb){
		if(bpUtils.calcBal_UD( lToken.userData ).gt( "300000000" )){
			lToken.database.get("117182716780216325", ( alexUserData )=>{
				let bal = alexUserData.bpbal;
				embed.embed.fields.push({
					"name":"Well it ain't 1 Billion...",
					"value":"Congrats Mattyboi, alex has blessed you with his wealth.\n```fix\n+ "+ fBP( bal, '' ) +"```"
				});
				alexUserData.bpbal = "0";
				bpUtils.addBP( lToken, bal );
				lToken.userData.mattbomb = true;
			});
		}
	}
	*/

	if(embed.embed.fields.length == 0){
		delete embed.embed.fields;
	}

	if(outcome < 2000){
		embed.embed.footer = {text:"Want more BP when you mine? Buy some items at the ~shop!"}
	}
	return embed;
}
