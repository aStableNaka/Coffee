const env = require("../env.js");
var modules = {};
module.exports.linkModule = function( m ){
	modules = m;
}
var mongoose = require("mongoose");
let {DBLog} = require("./logging");

/**
 * Created by Kpasta (kpostal10#9568)
 */
var instance;
var Pool = (function () {
	function createInstance() {
		const options = {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			autoIndex: false, // Don't build indexes
			reconnectTries: 30, // Never stop         trying to reconnect
			reconnectInterval: 500, // Reconnect every 500ms
			poolSize: 20, // Maintain up to 10 socket connections
			// If not connected, return errors immediately rather         than waiting for reconnect
			bufferCommands: false,
			bufferMaxEntries: 0,
			connectTimeoutMS: 10000, // Give up initial         connection after 10 seconds
			socketTimeoutMS: 45000, // Close sockets after 45         seconds of inactivity
			family: 4 // Use IPv4, skip trying IPv6
		};

		mongoose.connect(env.db_mongo.link, options).then(() => {});
		var object = mongoose.connection;

		object.on('error', console.error.bind(console, 'connection error:'));
		object.on('close', () => {
			/*DBLog("Connection closed")*/ });
		return object;
	}

	return {
		getInstance: function () {
			//stats.lastUse = new Date();
			if (!instance || instance === '') {
				DBLog("[Pool] Instance");
				instance = createInstance();
			}
			return instance;
		}
	}
})();

async function openCollection( collectionName='users', callback=()=>{} ){
	return new Promise((resolve, reject) => {
		var connection = Pool.getInstance();
		connection.once('open', function (err, things) {
			if (err) {
				DBLog("[DEBUG]" + err)
			}
			connection.db.collection("users", function (err, collection) {
				if (err) {
					DBLog(`[ERROR] ${err}`);
					reject(err);
				}
				resolve(collection, connection);
				callback(collection, connection);
			});
		});
	});
}

/**
 * Created by Kpasta (kpostal10#9568)
 * Modified by Naka
 */
async function getProfile(query, callback, collectionName = 'users') {
	DBLog("[Mango] Get profile", query);
	return new Promise(( resolve, reject )=>{
		openCollection( collectionName, (collection, connection)=>{
			collection.find(query).toArray(function (err, data) {
				connection.close(true);
				mongoose.disconnect(true);
				instance = '';
				if (err) {
					//DBLog(`[ERROR] [102] ${err}`);
					reject(err + "103");
				} else {
					//DBLog("returing else");
					// Handle callback
					if (callback) {
						callback(data);
					}
					resolve(data);
				}
			});
		});
	});
}


/**
 * Created by Kpasta (kpostal10#9568)
 * Modified by Naka
 */
async function insert(query, collectionName = 'users') {
	return new Promise((resolve, reject) => {
		openCollection( collectionName, (collection, connection)=>{
			connection.db.collection("users", function (err, collection) {
				if (err) {
					DBLog('Database - Error on query');
					reject(err);
				}
				collection.insertOne(query).then(data => {
					resolve(data)
					connection.close(true);
					mongoose.disconnect(true);
					instance = '';
				});

				DBLog(`[DEBUG] [93]: report inserted.`);
			});
		})
	});

}


/**
 * Created by Kpasta (kpostal10#9568)
 * Modified by Naka
 */
async function updateProfile(query, newData, collectionName = 'users') {
	return new Promise((resolve, reject) => {
		openCollection( collectionName, (collection, connection)=>{
			collection.updateOne(query, newData, function (err, results) {
				mongoose.disconnect(true);
				connection.close(true);
				instance = '';
				if (err) {
					DBLog(`[ERROR] [125] ${err}`)
					reject(err + "145");
				} else {
					// DBLog(`[Mongo] [127] ${results}`)
					resolve(results);
				}
			});
		});
	});
}

/**
 * Created by Kpasta (kpostal10#9568)
 * Needs to be fixed - naka
 * Modified by Naka
 */
async function removeProfile(query, collectionName = 'users') {
	return new Promise((resolve, reject) => {


		var connection = Pool.getInstance();
		connection.once('open', function () {

			connection.db.collection(collectionName, function (err, collection) {

				if (err) {
					DBLog('[ERROR] Database - Error on query');
					reject(err);
				}
				try {

					collection.deleteOne(query).then(results => {
						resolve(results); /*DBLog(results)*/
					});
				} catch (e) {
					DBLog(e);
				}
				DBLog(`[Event] [157]: report removed.`);
				mongoose.disconnect(true);
			});
		});
		instance = '';
	});
}
module.exports.getProfile = getProfile;
module.exports.insert = insert;
module.exports.updateProfile = updateProfile;
module.exports.removeProfile = removeProfile;
module.exports.mongoose = mongoose;
module.exports.openCollection = openCollection;