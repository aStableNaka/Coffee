const ufmt = require("../../utils/formatting.js");
const pN = ufmt.numPretty;
const fBP = ufmt.formatBP;
const fBPs = ufmt.formatBPs;
let { calcCost, calcMax } = require("../../utils/bp");
const bp = require("../../utils/bp");

var shop = require("../../data/shop.json");
delete require.cache[ require.resolve("../../data/shop.json") ];
let u = ''; //(cost<=bal) ? '' : "~~";
function fmtDefault( entries, userData ){
	
	let field = [];
	entries.map( ( {item, userItemAmount, cost, max} )=>{
		field.push({
			name: `[ **${item.alias}** ] "${item.name}"${u}\n${fBP( cost, '`' )}\n +${ fBPs( item.baseIncome, '`' ) }`,
			value: `${pN( userItemAmount )} owned, ${ pN( max ) } available`,
		})
	} )
	return field;
}

function fmtColorful( entries, userData ){
	let field = {name:"Shop",value:"```md\n"};
	entries.map( ( {item, userItemAmount, cost, max} )=>{
		//console.log( item, userItemAmount, cost, max);
		let fmt = [
			`\n[ ${item.alias} ][ "${item.name}" ] <Lvl. ${bp.getGenLevel_UD( userData, item.alias )}>`,
			`<${fBP( cost, '' )}>`,
			`< + ${fBPs( bp.calcGenProduction_x1( userData, item.alias ), '' )} >`,
			`> "${item.desc}"`,
			`< ${pN( userItemAmount )} > owned, <${pN( max )}> available\n`
		]
		field.value += fmt.join("\n");
	});
	field.value+="\n```";
	return [field];
}

let fmts = [ fmtColorful, fmtDefault, fmtColorful, null ];

const ENTRIES_PER_PAGE = 4;
module.exports = function( lToken, bal, page = 0 ){
	var fields = [];
	let extra = 1;
	let fieldFmter = fmts[ lToken.userData.fmt_pref ] || fmts[ 0 ];

	// Mobile
	if( lToken.mobile ){
		fieldFmter = fmtDefault;
	}

	var embed = {
		"embed": {
			"title": `"${ufmt.name( lToken )}, Here's what I have to offer."`,
			"description": `${ufmt.name(lToken)}, You have ${fBP(bal)}!`,
			"color": 0xfec31b,
			"author":{
				"name":"Mr. B.P. Banker",
				"icon_url": "https://i.imgur.com/9AKha1V.png"
			},
			"fields": fields
		}
	}

	/*if(bal<1000){
		embed.embed.footer = {
			"icon_url": "https://i.imgur.com/OyakNYo.png",
			"text": "Tip: \"~buy MSPS\" to buy Myspace Stocks."
		};
	}*/

	if(page){
		page = Math.min( Math.max(1, page), Math.ceil(shop.catalogue.length/ENTRIES_PER_PAGE) );
		lToken.mArgs.page = page;
		// Regular view
		fields.push({
			"name":"\u200B",
			"value":`Page ${ page }/${Math.ceil(shop.catalogue.length/ENTRIES_PER_PAGE)}\u200B`
		});

		let entries = shop.catalogue.slice( (page-1) * ENTRIES_PER_PAGE, (page-1) * ENTRIES_PER_PAGE + ENTRIES_PER_PAGE ).map( (item, i )=>{
			let userItemAmount = lToken.userData.bpitems[item.alias] || 0;
			let cost = calcCost( item.alias, 1, userItemAmount );
			let max = calcMax( item.alias, bal, userItemAmount );
			return { item:item, userItemAmount:userItemAmount, cost:cost, max:max };	
		});
		fieldFmter( entries, lToken.userData ).map( (x)=>{
			fields.push(x);
		});
	}else{
		// Best 4 options
		/*fields.push({
			"name":"Here are the best BP generators available to you.",
			"value":`Sorted By income`
		});*/

		//New: ${ufmt.block( 'Levels' )}\nEvery 80 purchases will increase the generator's level.\nLevels *increase base income*!

		embed.embed.footer = {
			"icon_url": "https://i.imgur.com/OyakNYo.png",
			"text": "Tip: use \"~store < page >\" to view all available purchasing options!"
		};

		let entries = [...shop.catalogue].sort( (a,b)=>{
			// Sort from highest cost to lowest cost
			let userItemAmountA = lToken.userData.bpitems[a.alias] || 0;
			let userItemAmountB = lToken.userData.bpitems[b.alias] || 0;
			// Changed to sort by income basec on level
			let costA = bp.calcGenProduction_x1( lToken.userData, a.alias );
			let costB = bp.calcGenProduction_x1( lToken.userData, b.alias );
			return costB - costA;  // BINTCONV
		}).filter( ( item )=>{
			// Filter out the ones that can't be bought
			let userItemAmount = lToken.userData.bpitems[item.alias] || 0;
			let max = calcMax( item.alias, bal, userItemAmount );
			return max > 0;
		}).slice(0, 4).map( (item, i )=>{
			// Append the 4 best choices
			let userItemAmount = lToken.userData.bpitems[item.alias] || 0;
			let cost = calcCost( item.alias, 1, userItemAmount );
			let max = calcMax( item.alias, bal, userItemAmount );
			return { item:item, userItemAmount:userItemAmount, cost:cost, max:max }
		});
		fieldFmter( entries, lToken.userData ).map( (x)=>{
			fields.push(x);
		});

		if( bal < 1000000 ){  // BINTCONV
			embed.embed.footer = {
				"icon_url": "https://i.imgur.com/OyakNYo.png",
				"text": "Tip: use \"~buy MSPS\" to buy myspace stocks!"
			};
		}

		if( bal < 1800 ){  // BINTCONV
			embed.embed.footer = {
				"icon_url": "https://i.imgur.com/OyakNYo.png",
				"text": "Tip: use \"~mine\" to get some extra BP!"
			};
		}

		// If there aren't enough entries
		if( fields.length == 0 ){
			embed.embed.footer = {
				"icon_url": "https://i.imgur.com/OyakNYo.png",
				"text": "Tip: use \"~mine\" to get some BP if you need some!"
			};
		}
	}
	
	return embed;
}
