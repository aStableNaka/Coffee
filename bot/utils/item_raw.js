
// Raw item utilities
function getItemObject( itemData ){
	return items[ itemData.accessor ];
}
module.exports.getItemObject = getItemObject;

function getItemObjectByAccessor( itemAccessor ){
	return items[ itemAccessor ];
}
module.exports.getItemObjectByAccessor = getItemObjectByAccessor;

/**
 * Adds an existing item to a user's inventory
 * @param {UserData} userData 
 * @param {ItemData} itemData 
 * @param {Number} amount 
 * @param {String} itemName 
 */
function addItemToInventory( userData, itemData, amount = 1, itemName = null ){
	let accessor = itemName || itemData.accessor; // Special inventory accessor or default
	if( userData.items[ accessor ] ){
		userData.items[ accessor ].amount+=amount;
	}else{
		userData.items[ accessor ] = itemData;
	}
	return itemData;
}
module.exports.addItemToInventory = addItemToInventory;

/**
 * Creates new itemData from passed itemObject which
 * gets added to a user's inventory
 * @param {UserData} userData 
 * @param {Item} itemObject 
 * @param {Number} amount 
 * @param {String} itemName 
 * @param {Any} itemMeta 
 */
function addItemObjectToInventory( userData, itemObject, amount = 1, itemName = null, itemMeta = null ){
	let itemData = itemObject.createItemData( amount, itemMeta );
	return addItemToInventory( userData, itemData, amount, itemName );
}
module.exports.addItemObjectToInventory = addItemObjectToInventory;