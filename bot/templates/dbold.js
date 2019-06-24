const env = require("../env.js");
var modules = {};
const https = require("https");
var database = {};
var global = {
	leaderboards:{},
	pot:0
};
var temp = {};
var log = [];
let loglen = 0;
var maxLogLength = 2000;
function DBLog( ...args ){
	console.log( ...args );
	log[ loglen % maxLogLength ] = {d:new Date().getTime(), m:args.join(' ')};
	loglen++;
}

const PERSISTENCE_INTERVAL = 1000 * 60 * 30;
const DATABASE_SAVE_INTERVAL = 1000 * 60 * 10;
const headers = {
	"Content-Type": "text/html; charset=utf-8"
}
const bpUtils = require('../utils/bp');
var gc_entries_cleared = 0;

var DATABASE_NEEDS_SAVE = false;

let env_db = env.db;

function createPostOptions( authorID, endpoint ){
	return {
		hostname: env.db.apiURL,
		path: `${endpoint}/${modules.ezhash( authorID )}`,
		method: "post",
		headers: headers
	}
}

function createGetOptions( authorID, endpoint ){
	return {
		hostname: env.db.apiURL,
		path: `${endpoint}/${modules.ezhash( authorID )}`,
		method: "get"
	}
}

function createGetOptionsDBID( dbid, endpoint ){
	return {
		hostname: env.db.apiURL,
		path: `${endpoint}/${ dbid }`,
		method: "get"
	}
}

function createGetOptions2( endpoint ){
	return {
		hostname: env.db.apiURL,
		path: `${endpoint}`,
		method: "get"
	}
}

function createPostOptions2( dbid, endpoint ){
	return {
		hostname: env.db.apiURL,
		path: `${endpoint}/${dbid}`,
		method: "post",
		headers: headers
	}
}

const createNewDBEntry_v0 = require("./dbdefault.js");

function loadLeaderboards(){
	getRegisteredList( ( listString )=>{
		let users = JSON.parse( listString ).filter( (x)=>{
			return String(x).length == "24bc8a6655a0623a7f4e402c12df4b9c".length;
		});
		users.map( ( dbid )=>{
			loadFromDatabase( dbid, ( data )=>{
				if(database[dbid]){
					updateLeaderboards( database[dbid] );
				}else{
					let userData = JSON.parse( data );
					updateLeaderboards( userData );
				}
			})
		})
	})
}

async function setLeaderboardAuthorFromID(  ){

}

function updateLeaderboards( userData ){
	if(!userData.id){ return; }
	let dbid = modules.ezhash( userData.id );
	if(global.leaderboards[dbid]){
		global.pot -= global.leaderboards[dbid].bal;
	}
	global.leaderboards[dbid] = {
		id: userData.id,
		bal: bpUtils.calcBal_UD( userData ),
		income: bpUtils.calcIncome_UD( userData )
	};
	global.pot += global.leaderboards[dbid].bal;
	global.leaderboards[dbid].holds = global.leaderboards[dbid].bal / global.pot;
	let sorted = Object.values( global.leaderboards ).sort( (a,b)=>{ return b.bal - a.bal; } );
	let rank = -1;
	sorted.map( (x, i)=>{ if(x.id == userData.id ){ rank = i; } } )
	global.leaderboards[dbid].rank = rank + 1;
	//global.leaderboards[dbid].potHolds = global.leaderboards[dbid].bal / global.pot;
	global.leaderboardsSorted = sorted;
}

function getLeaderboardsData( userData ){
	if(!userData.id){ return; }
	let dbid = modules.ezhash( userData.id );
	return global.leaderboards[dbid]; 
}



async function getRegisteredList( callback ){
	var req = https.get( createGetOptions2( env.db.endpoints.list ), (res)=>{
		let data = '';

		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on("end",()=>{
			callback( data );
		})
	});
}

async function loadFromDatabase( dbid, callback ){
	var req = https.get( createGetOptionsDBID( dbid, env.db.endpoints.read ), (res)=>{
		let data = '';

		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on("end",()=>{
			callback( data );
		})
	});
	return req;
}



async function getUserData( userID, callback ){
	DATABASE_NEEDS_SAVE = true;
	var dbid = modules.ezhash(userID);
	getUserDataDBID( dbid, callback );
}

function getUserDataDBID( dbid, callback ){
	if(!database[ dbid ]){
		loadFromDatabase( dbid, (data)=>{
			if(data!='null'){
				DBLog("lbde", dbid);
				database[ dbid ] = JSON.parse( data );

				// Keeps every user's data up to date
				var ensure = createNewDBEntry_v0();
				Object.keys( ensure ).map( ( key )=>{
					if(!database[dbid][key]){
						database[dbid][key] = ensure[key];
					}
				});
				// Uncomment for reset
				//if(database[dbid].reset_0){ database[dbid] = createNewDBEntry_v0(); }
				//if(!database[dbid].id){database[dbid].id=userID;}
			}else{
				DBLog("cdbe", dbid);
			
				database[ dbid ] = createNewDBEntry_v0();
			}
			if(callback){
				callback( database[ dbid ] );
			}
		});
		return;
	}
	let data = database[ dbid ];
	data.lastaccess = new Date().getTime();
	callback(data);
	return;
}

async function saveUserData( userID ){
	var options = createPostOptions( userID, env.db.endpoints.write );
	var req = https.request( options, (res)=>{
		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on("end",()=>{
			callback( data );
		})
	} );
	req.write( JSON.stringify( getUserData( userID ) ) );
	req.end();
}

async function saveDatabaseData( dbid, callback ){
	var options = createPostOptions2( dbid, env.db.endpoints.write );
	var req = https.request( options, ( res )=>{
		let data = '';
		res.on('data', (chunk) => {
			data += chunk;
		});

		res.on("end",()=>{
			callback( data );
		})
	});
	req.write( JSON.stringify( database[ dbid ] ) );
	req.end();
	return dbid;
}

module.exports.sync = function( author ){
	getRegisteredList( ( data )=>{
		let list = JSON.stringify( data );
		list.map( ( dbid )=>{
			loadFromDatabase( dbid, ( data )=>{
				let d = JSON.stringify( data );
				console.log("loadingFromDB", dbid);
				
			} )
		} )
	} )
}

module.exports.saveDatabase = function(){
	if(!DATABASE_NEEDS_SAVE){
		gc_entries_cleared = 0;
		Object.keys( database ).map( ( id )=>{
			// Garbage collection
			if(new Date().getTime() - database[id].lastaccess >= PERSISTENCE_INTERVAL){
				delete database[id];
				gc_entries_cleared++;
			}
		});
		DBLog(`[GC] Database doesn't need to be saved, ${gc_entries_cleared} db entries cleared`);
		return;	
	}
	DATABASE_NEEDS_SAVE = false;
	DBLog("saving database");
	Object.keys( database ).map( ( key )=>{
		saveDatabaseData( key, (data)=>{ DBLog(`DONE ${key}`); } ).then( (id)=>{
			// Garbage collection
			if(new Date().getTime() - database[id].lastaccess >= PERSISTENCE_INTERVAL){
				delete database[id];
			}
			DBLog( `s ${id}` );
		});
	});
}

module.exports.migrateENVDB_ENVDBOFFSHORE = function(){
	getRegisteredList( ( data )=>{
		let list = JSON.parse( data );
		list.map( ( dbid )=>{
			getUserDataDBID( dbid, ( data )=>{
				DBLog("Migrating", dbid);
				if(!data.id){return;}
				data.userID = parseInt(data.id);
				modules.dbmongo.mongoInsert( data ).then(()=>{ DBLog("Migration Success", dbid) });
			} )
		} )
	} )
}

// Save the databse every 10 mins;
setInterval( module.exports.saveDatabase, DATABASE_SAVE_INTERVAL );

module.exports.linkModule = function( m ){
	modules = m;
	loadLeaderboards();
}

module.exports.log = log;
module.exports.DBLog = DBLog;

module.exports.loadLeaderboards = loadLeaderboards;
module.exports.updateLeaderboards = updateLeaderboards;
module.exports.getLeaderboardsData = getLeaderboardsData;

module.exports.getGuildPreferences = function( guild ){
	return env.defaults.guild;
}

module.exports.getAuthorsBotPermissions = function( author ){
	
}
module.exports.loadFromDatabase = loadFromDatabase;
module.exports.save = saveUserData;
module.exports.get = getUserData;
module.exports.data = database;
module.exports.database = database;
module.exports.temp = temp;
module.exports.global = global;
module.exports.list = getRegisteredList;