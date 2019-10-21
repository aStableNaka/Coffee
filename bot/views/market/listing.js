const itemUtils = require("../../utils/item.js");
const ufmt = require("../../utils/fmt.js");
module.exports = function(Chicken, listing, selling){
	let itemData = Chicken.mArgs.item;
	let itemObject = itemUtils.getItemObject(listing.itemData);
	let message = {
		embed:{
			title:"Listing Info",
			description:ufmt.join([
				ufmt.denote('Listing ID', ufmt.block(listing.id.toUpperCase(), '** `')),
				ufmt.denote('Item', ufmt.item(listing.itemData)),
				ufmt.denote('Seller', ufmt.block(listing.ownerName, '`')),
				ufmt.denote('Price', `${ufmt.currency(listing.price)}`),
				ufmt.denote('Deposit', `${ufmt.currency(listing.deposit)}`)
			]),
			author:{
				name:"Sale Listing",
				icon_url: itemObject.icon
			},
			thumbnail:{
				url: itemObject.icon
			},
			fields:[
				{
					name:ufmt.item(itemData),
					value: itemObject.desc(Chicken, itemData)
				}
			],
			color:ufmt.colors.skin
		}
	}
	if(selling){
		message.embed.fields.push({
			name:ufmt.block("Listing Cost"),
			value:`You have paid ${ufmt.block(ufmt.currency(listing.deposit))} as a deposit for this listing. You will recieve this back once your listing has been sold or if you cancel this listing.`
		});
	}
	return message;
}