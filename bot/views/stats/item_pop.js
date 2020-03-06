const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function(Chicken, itemSummations){
	const page = Chicken.mArgs.page;
	let message = {
		embed:{
			title:`Item Circulation Statistics (${page+1}/${Chicken.mArgs.maxPages})`,
			description:itemSummations.slice(20*page,20*page+20).map( (itemSum)=>{
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