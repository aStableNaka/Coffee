const ufmt = require("../../utils/formatting.js");
const pN = ufmt.numPretty;
const pNi = ufmt.numPrettyIllion;
const fmtBP = ufmt.formatBP;
const fmtBPs = ufmt.formatBPs;
const illionaire = ufmt.illionaire;
const progressBar = ufmt.progressBar;
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const bp = require("../../utils/bp.js");
const locale = require("../../data/EN_US.json");
module.exports = function( lToken, bal, income, count = 0, maxCount = 0 ){
	let descContent = `**${ufmt.name(lToken, {styleString:''})}**, ${ illionaire(bal) }`;
	let embed = {
		"embed": {
			"title": ``,
			"description": ``,
			"color": 0xfec31b,
			"author":{
				"name":"Mr. B.P. Banker",
				"icon_url": "https://i.imgur.com/9AKha1V.png"
			},
			"footer": {
				"icon_url": "https://i.imgur.com/yMVIb0V.png",
				"text": `${ pNi( Math.floor( lToken.userData.bptotal ) )} BP life-time earnings.`
			}
		}
	}
	//if( count!=0 ){
	//	embed.embed.footer.text += ` Watching for ${ count } more seconds.`;
	//}

	embed.embed.fields = [
		{
			"name": "Income", 
			"value": `${fmtBPs(income, "***", true)}`
		},
		{
			"name":"Balance",
			"value":`${fmtBP(bal, "***", true)}`
		}
	];

	let ldb = lToken.database.getLeaderboardsData( lToken.userData );
	if(ldb){
		descContent+=(`, Rank [ ***${ ldb.rank == 15 ? "00f" : ldb.rank }*** ]`);
	}

	if(count!=0){
		//embed.embed.footer.text+=` ${ufmt.progressBar( count, maxCount, 'Refreshes', 10, {label:false, percent:false, styleString:' '} )}`;
	}
	let wabajack = lToken.userData.pickaxe_exp%locale.messages.length;
	let marquee = ufmt.marquee( ` - - ${[locale.messages.slice( wabajack ), ...locale.messages.slice( 0, wabajack )].join(" - - ")}`, count, 60 );
	marquee = '';
	embed.embed.title+=`${!lToken.mobile?marquee:''}\n***Overview***`;
	embed.embed.description += `${descContent}`;

	 // BINTCONV
	if(bal<=1000){ embed.embed.footer.text = `Need some extra BP? Try the "~mine" command!`; }
	/*
	// Damage control
	embed.embed.footer.icon_url = "https://i.imgur.com/OwMOZsq.png";
	embed.embed.footer.text = `Missing your bp? DM @naka a screenshot of your past ~bal and he'll restore it. (A screenshot of your store would help too)`;
	*/
	return embed;
}