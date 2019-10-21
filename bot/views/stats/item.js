const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function(Chicken, userDatas){
	let message = {
		embed:{
			title:`Item Statistics for ${Chicken.mArgs.itemAccessor}`,
			description:userDatas.slice(0, 40).map( (userData)=>{
				return [
					`${ufmt.block(userData.name)}`,
					`**${userData.items[Chicken.mArgs.itemAccessor].amount}** owned`,
					`*${userData.items[Chicken.mArgs.itemAccessor].used||0}* used`
				].join(" - ");
			}).join("\n")
		}
	};

	return message;
}