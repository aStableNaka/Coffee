let ufmt = require("../../utils/formatting");
let bp = require("../../utils/bp");
let itemUtils = require("../../utils/item");
const BigInt = require("big-integer");
const locale = require("../../data/EN_US.json");


module.exports = function( lToken, userData ){
    userData = userData || lToken.userData;
    let out = {
		"embed": {
            "description":ufmt.join(
                [
                    ufmt.name( userData ),
                    "```fix\n~ ~ ~ Rewards ~ ~ ~```",
                    "Boost rewards:",
                    `+ ${ ufmt.numPretty( bp.calcPrestigeBonusReward( userData ) ) }% Income boost from all generators\n`,
                    `Item rewards:`,
                    `+ [ Gold ] x${ bp.calcPrestigeGoldReward( userData ) }`,
                    `+ [ Lunchbox ] x17`,
                    `+ [ Mine Alert ] x1`,
                    "\n\n```diff\n- WARNING!!! PRESTIGE WILL RESET YOUR BP PROGRESS -```",
                    "This includes all generators you own and your current BP bal.",
                    "But in return, you get the rewards shown above.",
                    "When you're ready to prestige, use the `~prestige confirm` command"
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