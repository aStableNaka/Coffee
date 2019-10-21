const env = require("../env.js");
var modules = {};
module.exports.linkModule = function (m) { modules = m; };
var mongodb = require("mongodb");
let { DBLog } = require("./logging");

const connectionOptions = {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	autoIndex: false, // Don't build indexes
	reconnectTries: 30, // Never stop		 trying to reconnect
	reconnectInterval: 500, // Reconnect every 500ms
	poolSize: 20, // Maintain up to 10 socket connections
	// If not connected, return errors immediately rather		 than waiting for reconnect
	loggerLevel: "error",
	bufferMaxEntries: 0,
	connectTimeoutMS: 10000, // Give up initial		 connection after 10 seconds
	socketTimeoutMS: 45000, // Close sockets after 45		 seconds of inactivity
	family: 4 // Use IPv4, skip trying IPv6
};

const client = new mongodb.MongoClient(env.db_mongo.link, connectionOptions);
let connection = null;
let db = null;
/**
 * Connection wrapper
 * @param {Function( database )} callback 
 */
async function createConnection(callback) {
	let close = () => { };
	if (!client.isConnected || !db) {
		client.connect((err) => {
			DBLog(`[MongoDB] connecting ${err || ''}`);
			db = client.db('coffee');
			callback(db, close);
		});
		return;
	}
	callback(db, close);
}

async function openCollection(collectionName = 'users', callback = (collection, close) => { }) {
	createConnection((db, close) => {
		db.collection(collectionName, {}, (err, collection) => {
			if (err) {
				close();
				DBLog(`[MongoDB:Error:40] ${err}`);
				return;
			}
			callback(collection, close);
		});

	})
}

/**
 * Does all the connecting and other nonsense, make calls directly to the connection. The other params
 * in the callback are not necessary.
 * @param {*} collectionName 
 * @param {Function(collection, close, resolve, reject)} callback 
 */
async function wrapper43(collectionName, callback = (collection, close, resolve, reject) => { }) {
	return new Promise((resolve, reject) => {
		openCollection(collectionName, (collection, close) => {
			callback(collection, close, resolve, reject)
		})
	})
}

async function getProfile(query, callback = () => { }, collectionName, options) {
	return wrapper43(collectionName, (collection, close, resolve, reject) => {
		collection.find(query, options).toArray(function (err, data) {
			close();
			if (err) { reject(err); DBLog(`[MongoDB:Error:55] ${err}`); return; }
			resolve(data);
			callback(data);
		});
	})
}

async function insert(query, collectionName, options) {
	if (env.beta) {
		if (env.db_mongo.writable.indexOf(collectionName) == -1) {
			console.warn(`[Beta] Mongo insert denied for collection ${collectionName}`);
			return;
		}
	}
	return wrapper43(collectionName, (collection, close, resolve, reject) => {
		collection.insertOne(query, options).then(function (data) {
			close();
			resolve(data);
		});
	})
}

async function updateProfile(query, newData, collectionName) {
	if (env.beta) {
		if (env.db_mongo.writable.indexOf(collectionName) == -1) {
			console.warn(`[Beta] Mongo update denied for collection ${collectionName}`);
			return;
		}
	}
	return wrapper43(collectionName, (collection, close, resolve, reject) => {
		collection.updateOne(query, newData, function (data) {
			close();
			resolve(data);
		})
	})
}
async function removeProfile() { }

module.exports.getProfile = getProfile;
module.exports.query = getProfile;
module.exports.insert = insert;
module.exports.updateProfile = updateProfile;
module.exports.removeProfile = removeProfile;
module.exports.mongoose = {};
module.exports.mongodb = mongodb;
module.exports.openCollection = openCollection;
module.exports.client = client;
module.exports.wrapper43 = wrapper43;