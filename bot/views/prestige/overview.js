let ufmt = require("../../utils/fmt");
let bp = require("../../utils/bp");
let itemUtils = require("../../utils/item");
const BigInt = require("big-integer");
const locale = require("../../data/EN_US.json");


module.exports = function( lToken, userData ){
	userData = userData || lToken.userData;
	let inventoryObject = {
		'gold':itemUtils.items.gold.createItemData(bp.calcPrestigeGoldReward( userData )),
		'box_box':itemUtils.items.lootbox.createItemData(bp.calcPrestigeBoxReward( userData ), 'box_box'),
		'mine_alert':itemUtils.items.mine_alert.createItemData()
	}
	let out = {
		"embed": {
			"description":ufmt.join(
				[
					ufmt.name( userData ),
					ufmt.surround(`Boost reward:`,'**'),
					`+ ${ ufmt.numPretty( bp.calcPrestigeBonusReward( userData ) ) }% Income boost from all generators\n`,
					ufmt.surround(`Item rewards:`,'**'),
					ufmt.inventory(inventoryObject),
					...locale.prestige.warningSection,
				],"\n"
			),
			"color": 0xfec31b,
			"author":{
				"name":"Coffee",
				"icon_url": "https://i.imgur.com/Rx4eoje.png"
			}
		}
	}
	
	return out;
}