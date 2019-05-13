const Hash = require("crypto").Hash;

module.exports = function( data ){
	let hash = new Hash("md5");
	hash.update( data );
	return hash.digest("hex").toString();
}