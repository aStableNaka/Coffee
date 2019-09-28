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
 * @param {number} requestAmount $ in silver 
 * @param {function} onIDAssigned 
 */
function createMarketListing( Chicken, itemData, requestAmount, onIDAssigned ){
	const date = new Date().getTime();
	let listing = {
		v:0,
		owner: Chicken.id,
		date: date,
		id: undefined,
		itemData: itemData,
		requestAmount: requestAmount||10,
		lifetime: calculateLifetime( inventory )
	};

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
	
}