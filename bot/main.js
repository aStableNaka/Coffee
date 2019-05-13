const Discord = require('discord.js');
const client = new Discord.Client();
const env = require("./env.js");

const loader = require("./loader.js");
let modules = loader( "./bot/modules", "./modules", true );
let ready = false;
modules.client = client;
modules.clientStatistics = {
	ready:0,
	error:0,
	disconnect:0,
	message:0,
	rateLimit:0,
	reconnect:0
};

client.on('ready', () => {
  console.log(`[Client] Logged in as ${client.user.tag}!`);
  client.user.setActivity("Loading...");
  ready = true;
  modules.db.loadLeaderboards();
  modules.clientStatistics.ready++;
});

client.on('error', (e) => {
	console.log( "[Client] error", e.message );
	modules.clientStatistics.error++;
	modules.db.saveDatabase();
});

client.on('disconnect', () => {
	console.log( "[Client] Connection Closed. Reconnecting." );
	modules.db.saveDatabase();
	client.login(env.discord.token).then(()=>{});
	modules.clientStatistics.disconnect++;
	modules.db.saveDatabase();
	client.destroy();
	login();
});

client.on('message', msg => {
  modules.cmd.handle( msg, client );
  modules.clientStatistics.message++;
});

client.on('raw', data =>{
	modules.cmd.handleRaw( data );
});

client.on('rateLimit', rateLimitInfo=>{
	//console.log("[Client] Rate limited", rateLimitInfo);
	modules.db.temp.rateLimits++;
	modules.clientStatistics.rateLimit++;
});

client.on('reconnecting', ()=>{
	console.log("[Client] Reconnecting");
	modules.clientStatistics.reconnect++;
});

client.reloadModules = function(){
	ready = false;
	modules = loader( "./bot/modules", "./modules", true );
	modules.client = client;
	ready = true;
}

function login(){
	client.login(env.discord.token).then(()=>{
		console.log("[Client] Logged in!");
	}).catch( (e)=>{
		console.log("[Client] Something went wrong while trying to log in.");
		console.log(e);
	} );
	console.log("[Client] Logging in...");
}

/*function exitHandler(){
	//modules.db.saveDatabase()
	process.exit();
}*/

//process.on('SIGINT', exitHandler);


login();

module.exports = {
	modules: modules,
	client: client
}
