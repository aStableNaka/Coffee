/**
 * Mocha
 * Implementation of data retrieval for coffee
 * " Method of cache hand-down of assets (Mocha) "
 * 
 * The acronym is a stretch, but basically this module 
 * talks to the interface that manages the temporary
 * ownership of Coffee data across Coffee-instances.
 */

const env = require("../env.js");
var modules = {};
module.exports.linkModule = function( m ){
	modules = m;
}
