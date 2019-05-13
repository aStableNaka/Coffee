const env = require("../env.js");
var modules = {};
module.exports.linkModule = function( m ){
	modules = m;
}

const { openCollection, mongoose } = require("./mongowrappers");

// You can only create and unlist market entries

/**
 * Creates a market entry in the database, returns the market code.
 * @param {lToken} lToken 
 * @param {itemData} itemData 
 * @param {Function} callback 
 * @returns marketCode:String
 */
function createMarketEntry( lToken, itemData, value, callback ){
    
}