const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function(Chicken, results){
	let desc = ufmt.join(results.map((x)=>{
		let itemObject = itemUtils.getItemObject( x.itemData );
		return `${ufmt.block(x.id.toUpperCase(), '** `')} ${ufmt.item(x.itemData)} - ${ufmt.currency(x.price, Chicken.guild.me.missingPermissions(["USE_EXTERNAL_EMOJIS"]))}`
	}));
	if(results.length == 0){
		desc = "None";
	}
	let message = {
		embed:{
			title:`Market Catalogue - ${Chicken.mArgs.itemAccessor || 'All'}`,
			description:desc,
			footer:{
				text:`Use "~mbuy [ID]" to buy an item!`
			}
		}
	}
	return message;
}