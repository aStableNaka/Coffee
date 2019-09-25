const ufmt = require("../../utils/fmt.js");
const bp = require("../../utils/bp.js");
const pN = ufmt.numPretty;
const fBP = ufmt.formatBP;
var bpUtils = require("../../utils/bp");
module.exports = function( Chicken, outcome, perkMessages, boost ){
	let message = {
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
				"text":`${ufmt.block(Chicken.userData.pickaxe_name, '')} LvL ${ bp.pickaxeLevelUD( Chicken.userData ) }`
			}
		}
	}

	if(boost.active){
		if(boost.isDefault){
			let amount = boost.amount;
			message.embed.description+=`\n*Your [ **${ Chicken.userData.mineboostsource }** ] has increased base profits by [ **${ Chicken.userData.mineboost }%** ]*\n+ ${ fBP(boost.amount) }`,
			message.embed.footer = {
				text: `Your [ ${ Chicken.userData.mineboostsource } ] has [ ${ Chicken.userData.mineboostcharge } ] ${ufmt.plural( Chicken.userData.mineboostcharge, 'charge', 'charges' )} left!`
			};
		}else{
			message.embed.description+= '\n'+boost.description;
			message.embed.footer = {
				text: `Your ${ ufmt.block(Chicken.userData.mineboostsource, '') } has [ ${ Chicken.userData.mineboostcharge } ] ${ufmt.plural( Chicken.userData.mineboostcharge, 'charge', 'charges' )} left!`
			};
		}
	}
	

	message.embed.fields = perkMessages;


	/**
	 * 327513269541535744 matt
	 * 117182716780216325 alex
	 */
	/*
	if(Chicken.author.id == "327513269541535744" && !Chicken.userData.mattbomb){
		if(bpUtils.calcBal_UD( Chicken.userData ).gt( "300000000" )){
			Chicken.database.get("117182716780216325", ( alexUserData )=>{
				let bal = alexUserData.bpbal;
				message.embed.fields.push({
					"name":"Well it ain't 1 Billion...",
					"value":"Congrats Mattyboi, alex has blessed you with his wealth.\n```fix\n+ "+ fBP( bal, '' ) +"```"
				});
				alexUserData.bpbal = "0";
				bpUtils.addBP( Chicken, bal );
				Chicken.userData.mattbomb = true;
			});
		}
	}
	*/

	if(message.embed.fields.length == 0){
		delete message.embed.fields;
	}

	if(outcome < 2000){
		message.embed.footer = {text:"Want more BP when you mine? Buy some items at the ~shop!"}
	}
	return message;
}
