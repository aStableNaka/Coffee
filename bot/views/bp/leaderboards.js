const ufmt = require("../../utils/formatting.js");
const pN = ufmt.numPretty;
const fBP = ufmt.formatBP;
const fBPi = ufmt.formatBPi;
const fBPs = ufmt.formatBPsi;
const illionaire = ufmt.illionaire;
const fmtName = ufmt.name;

function fmtDefault( embed, sorted, globals, position, amount, lToken ){
	sorted.filter((x)=>{
		if(lToken.mArgs.local && lToken.msg.guild){
			
			if(!x.guilds){return false;}
			return x.guilds.indexOf( lToken.msg.guild.id ) > -1;
		}
		return x;
	}).slice( 0, amount ).map( ( lbData, i )=>{
		embed.embed.fields.push( {
			name:`[ ${i+1} ] ${ fmtName( lbData ) } [ ${( lbData.bal / globals.pot * 100).toFixed(2)}% ]`,
			value:`${fBPi( lbData.bal )} < ${fBPs( lbData.income, '***', 10 )} >`
		});
	})
}

var fmtter = fmtDefault;

module.exports = function( lToken, globals, amount = 5 ){
	let embed = {
		"embed": {
			"title": (lToken.mArgs.local?lToken.msg.guild+'\'s Local':'Global')+" Leaderboards",
			"description": `Here are the top ${ amount } players.\nGlobal Pot: ${ fBPi( globals.pot ) }\n`,
			"color": 0xfec31b,
			"author":{
				"name":"BP Holders",
				"icon_url": "https://i.imgur.com/toGekXr.png"
			},
			"fields": []
		}
	};

	let sorted = globals.leaderboardsSorted;
	let position = -1;
	sorted.map( (x, i)=>{ if(x.id == lToken.author.id ){ position = i; } } )
	if(position!=-1){
		embed.embed.footer = {"icon_url": "https://i.imgur.com/G1k7gZM.png",text:`${ufmt.name( lToken, {styleString:''} )}, you are rank ${position+1} of ${sorted.length}`};
	}
	fmtter( embed, sorted, globals, position, amount, lToken );
	return embed; 
}
