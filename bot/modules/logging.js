const env = require("../env.js");
var modules = {};
module.exports.linkModule = function( m ){
	modules = m;
}

var log = [];
let loglen = 0;
var maxLogLength = 100000; //
function DBLog(...args) {
	console.log(...args);
	log[loglen % maxLogLength] = {
		d: new Date().getTime(),
		m: args.join(' ')
	};
	loglen++;
}

module.exports = {
    log: log,
    loglen: loglen,
    maxLogLength: maxLogLength,
    DBLog: DBLog
};