const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function( Chicken, marketEntry, silverItemData ){
	return ufmt.join( [
		`${ufmt.block(Chicken.userData.name)}`,
		`> - ${ufmt.item(silverItemData, marketEntry.price)}`,
		`> + ${ufmt.item(marketEntry.itemData)}`,
		`${ufmt.block(marketEntry.ownerName)}`,
		`> + ${ufmt.item(silverItemData)}`
	] )
}