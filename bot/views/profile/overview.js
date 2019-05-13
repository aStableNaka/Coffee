
let {getCurrentBPBal, addBP, calcIncome, pickaxeLevelUD, calcIncome_UD} = require("../../utils/bp");
let ufmt = require("../../utils/formatting");
let bp = require("../../utils/bp");
let itemUtils = require("../../utils/item");
const BigInt = require("big-integer");
const locale = require("../../data/EN_US.json");

module.exports = function( lToken, user, userData ){
	if(!userData){ userData = lToken.userData; }

	let firstUseDay = Math.floor((new Date().getTime() - userData.firstuse)/1000/60/60/24);
	let badges = ([userData.tester?'Beta Tester':'', ...userData.tags]).map((tag)=>{ return ufmt.badge( tag ); }).join(" ");

	let pickaxeIncome = ufmt.bp(BigInt.max( 1, calcIncome_UD(userData) ).multiply(60).multiply( 20 + 10 * pickaxeLevelUD( userData )) );
	let perkDescriptions = userData.pickaxe_perks.map((x)=>{
		let perk = itemUtils.minePerks[ x ];
		return `\n- ${ufmt.itemName(perk.name, 0, "***")}: *${perk.desc || "No description"}*`;
	});

	return {
		"embed": {
			"color": 0xfec31b,
			"author":locale.views.authors.coffee,
			"title":`${ufmt.name(userData)}'s profile`,
			"fields": [
				
				{
					"name": ufmt.block( "General" ),
					"value": [
						ufmt.denote('Rank', ufmt.block(lToken.database.global.leaderboards[String(userData.id)].rank+1)),
						ufmt.denote('First Use', `${ ufmt.block(firstUseDay) } days ago`),
						ufmt.denote('Badges', badges),
						ufmt.denote('Commands Used', ufmt.block(userData.cmdcount)),
						ufmt.denote('Last Use', ufmt.timeLeft(userData.lastuse, new Date().getTime()) + ' ago'),
						ufmt.denote('Discord ID', ufmt.block( userData.id) ),
						(userData.blacklisted?ufmt.denote('Banned', ufmt.block("Yes")):null)
					].filter(x=>!!x).join("\n"),
					inline:true
				},
				{
					name:ufmt.block( `Blob Points` ),
					value:[
						ufmt.denote('Gold', ufmt.block( userData.items.gold ? userData.items.gold.amount : 0 ) + ' Coins'),
						ufmt.denote('Income', ufmt.block( ufmt.numPrettyIllion( bp.calcIncome_UD( userData) ) )+' BP/s'),
						ufmt.denote('Balance', ufmt.block( ufmt.numPrettyIllion( userData.bpbal ) )+' BP'),
						ufmt.denote('Life-Time Earnings', ufmt.block( ufmt.numPrettyIllion( userData.bptotal ) )+' BP')
					].join("\n"),
					inline:true
				},
				{
					"name":ufmt.block( `Pickaxe` ),
					"value":[
						ufmt.denote('Name', ufmt.block(userData.pickaxe_name)),
						ufmt.denote('Exp', ufmt.progressBar( userData.pickaxe_exp%16, 16, `LvL ${pickaxeLevelUD( userData )}`, 16 ) ),
						ufmt.denote('Cooldown', ufmt.block(userData.pickaxe_time*60) ),
						ufmt.denote('Income', `+${pickaxeIncome} / mine`),
						ufmt.denote('Perks', `${perkDescriptions.length > 0 ? `${perkDescriptions}` : "Your pickaxe has no perks."}`)
					].join("\n")
				}
			]
		}
	};
};