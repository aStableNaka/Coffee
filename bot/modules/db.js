/**
 * Holy shit this entire module needs to be crucified
 */
//var mongoose = require("mongoose");
const env = require("../env.js");
const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const stringSimilarity = require("string-similarity");
const process = require("process");
const bpUtils = require('../utils/bp');
let nameUpdateStack = [];
let lisaLoaded = false;
const leaderboardsTimeout = 20;
const leaderboardStatus = {
	loaded: false,
	zhuliOnline: false,
	loadID: 0
}

const cache = {};
const global = {
	leaderboards: {},
	pot: 0,
	gem: {
		loaded: false
	}
};
const temp = {
	commandsUsed: 0,
	commandsTotal: 0,
	rateLimits: 0,
	blessings: 0,
	inactive: 0
};
const stats = {};
const PERSISTENCE_INTERVAL = 1000 * 60 * 30;
const DATABASE_SAVE_INTERVAL = 1000 * 60 * 10;
var modules = null;
let {
	log,
	DBLog
} = require("./logging");

function et(e) {
	if (e) {
		throw e;
	}
}
let mongodb = require("./mongodb");
let {
	getProfile,
	insert,
	updateProfile,
	removeProfile
} = mongodb;

var DATABASE_NEEDS_SAVE = true;
const season = 0;

/**
 * Wrappers
 */

const createNewDBEntry_v0 = require("./dbdefault");

async function getByID(userID, callback = () => { }) {
	return new Promise((resolve, reject) => {
		var query = {
			userID: {
				$eq: String(userID)
			}
		};
		getProfile(query).then((results) => {
			// results[0]
			callback(results[0]);
			resolve(results[0]);
		}).catch((err) => {
			DBLog(`[ERROR] ${err}`);
			reject(err);
		});
	});
}

async function create(userID, callback = () => { }, ) {
	let query = createNewDBEntry_v0(userID);
	insert(query).then(callback).catch(et);
}

async function get(userID, callback = () => { }) {
	DATABASE_NEEDS_SAVE = true;
	if (typeof (cache[userID]) == "undefined") {
		DBLog("[Mongo] get", userID)
		getByID(userID, (data) => {
			if (!data) {
				create(userID, () => {
					DBLog("[Mongo] Create", userID)
					getByID(userID, (data) => {
						cache[userID] = data;
						callback(data);
					});
				})
			} else {
				DBLog("[Mongo] Found", userID)
				ensure(userID, data);
				callback(data);
				cache[userID] = data;
			}
		})
		return;
	}
	//DBLog("[Mongo] RCache", userID)
	let ud = cache[userID];
	ud.lastaccess = new Date().getTime();

	// Ensure old data has new data fields
	// Shallow match
	ensure(userID, ud);
	callback(cache[userID]);
}

/**
 * Ensure all documents stay up-to-date
 * @param {*} userID 
 * @param {*} ud 
 */
function ensure(userID, ud) {
	let fields = createNewDBEntry_v0(userID);
	Object.keys(fields).map((key) => {
		if (typeof (ud[key]) == "undefined") {
			ud[key] = fields[key];
		}
	})

	if (ud.pickaxe_exp > ud.cmdcount) {
		ud.cmdcount += ud.pickaxe_exp * 4;
	}

	// Make sure the currently equipped pickaxe's
	// item data is labled as equipped
	if (ud.items[ud.pickaxe_accessor]) {
		ud.items[ud.pickaxe_accessor].equipped = true;
	}

	delete ud.pickaxe_enhancement
	delete ud.pickaxe_efficency
	delete ud.bibpbal;
	delete ud.bibps;
	delete ud.bibptotal

	if (!ud.orbs) {
		ud.orbs = 0;
	}
	if (!ud.listings) {
		ud.listings = [];
	}
	if (!ud.seasons) {
		ud.season = season;
		ud.seasons = {};
	}
}

async function remove(userID, callback = () => { }) {
	// callback(data)
	//  data.deletedCount === 1
	var query = {
		userID: {
			$eq: String(userID)
		}
	};
	removeProfile(query).then(callback).catch(et);
}

async function update(userID, newData, callback = () => { }) {
	var query = {
		userID: {
			$eq: String(userID)
		}
	};
	/*
		var newData = {$addToSet: {tags: "test"}};
		used for objects (array, json) to be added to a object.
	*/
	/*
		var newData = {$set: newData}
		used to set specific fields (int, string, boolean ect) 
	*/
	var ud = {
		$set: newData
	}
	updateProfile(query, ud).then(callback).catch(et)
}


async function getAllUsers(callback = (udCollection) => { }) {
	let query = {
		version: {
			$eq: 0
		}
	};
	getProfile(query).then(callback).catch((e) => {
		console.log(`[Leaders] Error fetching leaderboards ${e}`)
	});
}


/**
 * Leaderboards
 */


function loadLeaderboards(id = 0) {
	DBLog(`[Mongo] Loading Leaderboards, routine #${id}`)
	getAllUsers((udCollection) => {
		if (leaderboardStatus.loadID != id) {
			DBLog(`[Leaderboards] Loading took too long for routine #${id}`);
		}
		let ids = udCollection.map((userData) => {
			//console.log(userData);
			ensure(userData.id, userData); // Temporary ensure
			updateLeaderboards(userData);
			temp.commandsTotal += userData.cmdcount;
			return userData.id;
		})
		DBLog("[Mongo] Leaderboards loaded", ids.length);
		leaderboardStatus.loaded = true;
	})
	doTheThingZhuLi();
	setTimeout(() => {
		if (!leaderboardStatus.loaded) {
			loadLeaderboards(id + 1);
		}
	}, leaderboardsTimeout * 1000);
}

async function setLeaderboardAuthorFromID() {

}

// Zhu Li the lazy loader
// Loads names if the cache hasn't stored the user's name
function doTheThingZhuLi() {
	if (leaderboardStatus.zhuliOnline) {
		DBLog.log(`[Zhu Li] already online`);
		return;
	}
	DBLog("[Zhu Li] doing the thing!")
	setInterval(() => {
		//DBLog(`[Zhu Li] needs to do ${ nameUpdateStack.length } things ( est ${Math.floor( nameUpdateStack.length * 580 / 1000 )} sec. )`)
		if (nameUpdateStack.length > 0) {
			let n = nameUpdateStack.pop();
			modules.client.fetchUser(n.id).then((user) => {
				if (nameUpdateStack.length > 1) {
					//DBLog("[Zhu Li]", n.id, user.username);
					temp.inactive++;
				} else {
					// Once
					if (!lisaLoaded) {
						setStatus();
						lisaLoaded = true;
						modules.client.user.setActivity("@ me for help!");
						console.log("[Zhu Li] Has done the thing.")
					}
				}
				// Set the name if the userProfile is cached
				if (cache[String(n.id)]) {
					cache[String(n.id)].name = user.username;
					cache[String(n.id)].discriminator = user.discriminator;
				}
				global.leaderboards[String(n.id)].name = user.username;
				global.leaderboards[String(n.id)].discriminator = user.discriminator;

			}).catch((reason) => {
				DBLog(`[Client] [FetchUser] [error] ${reason}`);
			});;
		}
	}, 580)
}

function setStatus() {
	setInterval(() => {
		modules.client.user.setActivity("@coffee for help!");
	}, 1000 * 60 * 5);
}


function updateLeaderboards(userData) {
	if (!userData.id) {
		return;
	}
	let dbid = userData.id;
	let ldata = global.leaderboards[dbid];
	if (ldata) {
		global.pot = BigInt(global.pot).subtract(ldata.bal);
	}

	// Redefine ldata
	global.leaderboards[dbid] = {
		id: userData.id,
		bal: bpUtils.calcBal_UD(userData),
		income: bpUtils.calcIncome_UD(userData),
		name: userData.name || null,
		nickname: userData.nickname,
		guilds: userData.guilds
	};
	ldata = global.leaderboards[dbid];
	global.pot = BigInt(global.pot).add(ldata.bal)
	if (!ldata.name || lisaLoaded) {
		if (!ldata.name) {
			ldata.name = "Loading...";
		}
		nameUpdateStack.push({
			ldata: ldata,
			id: userData.id
		});
	}

	ldata.holds = BigNum(ldata.bal.toString()).div(global.pot).toNumber();
	let sorted = Object.values(global.leaderboards).sort((a, b) => {
		return b.bal.subtract(a.bal).toJSNumber();
	});
	let rank = -1;
	sorted.map((x, i) => {
		x.rank = i;
		if (x.id == userData.id) {
			rank = i;
		}
	})
	ldata.rank = rank + 1;
	//global.leaderboards[dbid].potHolds = global.leaderboards[dbid].bal / global.pot;
	global.leaderboardsSorted = sorted;
}

function getLeaderboardsData(userData) {
	if (!userData.id) {
		return;
	}
	return global.leaderboards[userData.id];
}

// Find a name based on the inclusion of an input
function queryLdbByName(nameQuery) {
	// Exact match search
	let results = Object.values(global.leaderboards).filter((ldata) => {
		return ldata.name.toLowerCase().includes(nameQuery.toLowerCase());
	});
	return results;
}

// Find a name based on a similarity of the input
function queryLdbByNameSimilarity(nameQuery, minimumSimilarityThreshold = 0.6) {
	let results = Object.values(global.leaderboards).filter((ldata) => {
		let bias = ldata.name.toLowerCase().includes(nameQuery.toLowerCase()) ? 1 : 0;
		let similarity = stringSimilarity.compareTwoStrings(ldata.name.toLowerCase(), nameQuery);
		let product = similarity + bias * 0.5;
		return product >= minimumSimilarityThreshold;
	});
	return results;
}



module.exports = {
	log: log,
	updateProfile: updateProfile,
	getProfile: getProfile,
	query: getProfile,
	mongoInsert: insert,
	temp: temp,
	DBLog: DBLog,
	getByID: getByID,
	get: get,
	save: update,
	create: create,
	log: log,
	remove: remove,
	cache: cache,
	global: global
};

module.exports.queryLdbByName = queryLdbByName;
module.exports.queryLdbByNameSimilarity = queryLdbByNameSimilarity;

// DB interface
// module.exports.save = saveUserData;
// module.exports.get = getUserData;

// Force cache garbage collection for stale entries
// DO NOT USE WITHOUT SAVING DATABASE FIRST
module.exports.forceGCStale = function () {
	gc_entries_cleared = 0;
	Object.keys(cache).map((id) => {
		// Garbage collection
		if (new Date().getTime() - cache[id].lastaccess >= PERSISTENCE_INTERVAL) {
			delete cache[id];
			gc_entries_cleared++;
		}
	});
	DBLog(`[Database GC] forceGCStale: ${gc_entries_cleared} entries offloaded`);
	return;
}

// Force cache garbage collection
// DO NOT USE WITHOUT SAVING DATABASE FIRST
module.exports.forceGCUnsafe = function () {
	gc_entries_cleared = 0;
	Object.keys(cache).map((id) => {
		delete cache[id];
		gc_entries_cleared++;
	});
	DBLog(`[Database GC] forceGCUnsafe ${gc_entries_cleared} entries offloaded`);
	return;
}


module.exports.nameUpdateStack = nameUpdateStack;

function saveDatabase(callback) {
	if (!DATABASE_NEEDS_SAVE) {
		gc_entries_cleared = 0;
		Object.keys(cache).map((id) => {
			// Garbage collection
			if (new Date().getTime() - cache[id].lastaccess >= PERSISTENCE_INTERVAL) {
				delete cache[id];
				gc_entries_cleared++;
			}
		});
		DBLog(`[Mongo] [GC] ${gc_entries_cleared} entries offloaded`);
		return;
	}
	DATABASE_NEEDS_SAVE = false;
	DBLog("[Mongo] Saving Database");

	// Save the user files
	Object.keys(cache).map((key) => {
		// bint to string
		let data = {};
		Object.keys(cache[key]).map((www) => {
			if (cache[key][www] instanceof BigInt) {
				data[www] = cache[key][www].toString();
			} else {
				data[www] = cache[key][www];
			}
		})
		update(key, data, (data) => {
			DBLog(`[Mongo] Saved ${key}`);
		}).then(() => {
			// Garbage collection
			if (new Date().getTime() - cache[key].lastaccess >= PERSISTENCE_INTERVAL) {
				delete cache[key];
			}
			//DBLog( `s ${userID}` );
		}).catch((reason) => {
			DBLog(`[Mongo] [update] [error] ${reason}`);
		});
	});

	// Save globals
	updateProfile({
		id: {
			$eq: "gem"
		}
	}, {
		$set: global.gem
	}, 'global').then(() => {
		console.log(`[Database] [Saved] Gem data`);
	}).catch((e) => {
		console.log(`[Database] [SaveError] Gem data, ${e.message}`);
	});
}

module.exports.getGuildPreferences = function (guild) {
	return env.defaults.guild;
};

setInterval(saveDatabase, DATABASE_SAVE_INTERVAL);

module.exports.linkModule = function (m) {
	modules = m;
};

module.exports.log = log;
module.exports.DBLog = DBLog;

module.exports.loadLeaderboards = loadLeaderboards;
module.exports.updateLeaderboards = updateLeaderboards;
module.exports.getLeaderboardsData = getLeaderboardsData;
module.exports.saveDatabase = saveDatabase;
module.exports.stats = stats;
module.exports.api = mongodb;
module.exports.playerIsCached = function (id) {
	return !!cache[id];
}
getProfile({
	id: {
		$eq: "gem"
	}
}, (data) => {
	global.gem = data[0];
}, 'global');

function cleanup() {
	modules.client.destroy();
	let timeout = 5;
	console.log(`[Cleanup] running, terminating in ${timeout} seconds...`);
	saveDatabase();

	setTimeout(process.exit, timeout * 1000);

}

module.exports.cleanup = cleanup;

// Listeners for program termination
process.on("exit", cleanup);
process.on("SIGINT", cleanup);