const BigInt = require('big-integer');

function createListingId( Chicken ){
	function generateID( length=5 ){
		const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
		return new Array(length).fill(0).map( ()=>{
			return chars[Math.floor(Math.random()*chars.length)];
		}).join('');
	}
	return generateID();
}

/**
 * Creates a market listing, make sure the listing isn't used until the ID is properly assigned
 * by having a callback for onIDAssigned
 * @param {Chicken} Chicken 
 * @param {*} itemData 
 * @param {number} price $ in silver 
 * @param {function} onIDAssigned 
 */
function createMarketListing( Chicken, itemData, price, onIDAssigned ){
	const date = new Date().getTime();
	const deposit = 25/100; // To ensure users don't try to oversell, a deposit must be paid which will be returned once the transaction completes.
	let listing = {
		v:0,
		owner: Chicken.userData.id,
		ownerName: Chicken.userData.name,
		date: date,
		id: undefined,
		itemData: itemData,
		price: price||10,
		deposit: 1,
		priority:false,
		sold:false,
		soldDate:0,
		recipient:null,
		locked:false,
		accessor:itemData.accessor
	};
	listing.deposit = Math.ceil( price * deposit );
	function ensureIDIsUnique( id ){
		Chicken.database.query( {id:{$eq:id}}, ( results )=>{
			if(results.length>0){
				ensureIDIsUnique( createListingId(Chicken) );
			}else{
				listing.id = id;
				onIDAssigned( Chicken, listing );
			}
		})
	}
	ensureIDIsUnique( createListingId( Chicken ) );
	return listing;
}

module.exports = {
	createMarketListing:createMarketListing
}