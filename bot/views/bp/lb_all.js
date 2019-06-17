const ufmt = require("../../utils/fmt.js");
const pN = ufmt.numPretty;
const fBP = ufmt.formatBP;
const fBPi = ufmt.formatBPi;
const fBPs = ufmt.formatBPs;
const illionaire = ufmt.illionaire;
const fmtName = ufmt.name;
const ENTRIES_PER_PAGE = 40;
const ENTRIES_PER_PANEL = 20;
function fmtDefault( embed, sorted, globals, position, page = 1, lToken ){
	let fields = [];
	for( let h = 0; h < ENTRIES_PER_PAGE/ENTRIES_PER_PANEL; h++ ){
		let value = "";
		sorted.filter((x)=>{
			if(lToken.mArgs.local && lToken.msg.guild){
				
				if(!x.guilds){return false;}
				return x.guilds.indexOf( lToken.msg.guild.id ) > -1;
			}
			return x;
		}).slice( (page - 1 + h) * ENTRIES_PER_PANEL, ( page - 1 + h ) * ENTRIES_PER_PANEL + ENTRIES_PER_PANEL ).map( ( lbData, i )=>{
			value+=`[ ${i+1+(page-1 + h)*ENTRIES_PER_PANEL} ] ${ fmtName( lbData, {styleString:'`',length:16} ) } ${fBPi( lbData.bal, '***', 10 )}\n`;
		});
		fields.push({
			name: `${(page + h - 1) * ENTRIES_PER_PANEL + 1} - ${ (page + h) * ENTRIES_PER_PANEL }`,
			value:value || "None",
			inline:true
		});
	}
	embed.embed.fields = fields;
}

var fmtter = fmtDefault;

module.exports = function( lToken, globals, page = 1 ){
	let sorted = globals.leaderboardsSorted;
	page = Math.max( Math.min( page, Math.ceil( sorted.length / ENTRIES_PER_PANEL ) ), 1 ) 
	lToken.numbers[0] = page;
	let embed = {
		"embed": {
			"title": (lToken.mArgs.local?lToken.msg.guild+'\'s Local':'Global')+" Leaderboards",
			"description": ``,
			"color": 0xfec31b,
			"author":{
				"name":"BP Holders",
				"icon_url": "https://i.imgur.com/toGekXr.png"
			}
		}
	};

	
	let position = -1;
	sorted.map( (x, i)=>{ if(x.id == lToken.author.id ){ position = i; } } )
	if(position!=-1){
		embed.embed.footer = {"icon_url": "https://i.imgur.com/G1k7gZM.png",text:`${ufmt.name( lToken, {styleString:''} )}, you are rank ${position+1} of ${sorted.length}`};
	}
	fmtter( embed, sorted, globals, position, page, lToken );
	embed.embed.title += ` page ${page}/${Math.ceil( sorted.length / ENTRIES_PER_PANEL )}`
	return embed; 
}
