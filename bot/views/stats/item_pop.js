const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function(Chicken, itemSummations){
	let message = {
		embed:{
			title:`Item Circulation Statistics`,
			description:itemSummations.map( (itemSum)=>{
				return [
					`\`${ufmt.block(itemSum.accessor, '')}\``,
					`**${ufmt.numPretty(itemSum.amount)}** owned`,
					`*${ufmt.numPretty(itemSum.used)}* used`,
					`*${ufmt.numPretty(itemSum.total)}* total`,
				].join(" - ");
			}).join("\n")
		}
	};

	return message;
}