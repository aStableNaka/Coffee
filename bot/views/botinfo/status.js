let process = require("process");
const ufmt = require("../../utils/formatting.js");
const pBar = ufmt.progressBar;
const os = require("os");
module.exports = function( lToken ){
	let memoryUsage = process.memoryUsage();
	let totalMemoryUsed = parseInt((memoryUsage.rss + memoryUsage.heapTotal)/1024/1024);
	let memProgressBar = pBar( totalMemoryUsed, 1024*4, `${ totalMemoryUsed } / ${1024*4} MB` );
	let cpuUsage = process.cpuUsage();
	let obj = {
		"embed": {
			"title": "Bot Status",
			"description": "",
			"color": 0xfec31b,
			"author":{
				"name":"Coffee",
				"icon_url": "https://i.imgur.com/cFTSxmq.png"
			},
			"fields": [
				{
					"name":"System",
					"value": ([
						`Memory Usage: ${memProgressBar}`,
						`Loads: [ ***${os.loadavg().map( (x)=>{return x.toFixed(3)} ).join(", ")}*** ]`,
						`User CPU Usage: [ ***${(cpuUsage.user/1000/1000/60).toFixed(3)}*** ] seconds`,
						`System CPU Usage: [ ***${(cpuUsage.system/1000/1000/60).toFixed(3)}*** ] seconds`,
						`System Uptime: [ ***${(os.uptime()/1000/60/60/24).toFixed(3)}*** ] days`
					]).join("\n"),
					"inline":true
				},
				{
					"name":"Database",
					"value":([
						`Active Documents: [ ***${ Object.keys( lToken.database.database ).length }*** ]`,
						`User Count: [ ***${ Object.keys( lToken.database.global.leaderboards ).length }*** ]`,
						`Inactive Count: [ ***${ lToken.database.temp.inactive }*** ]`,
						`Gross Activity: [ ***0*** ]`
					]).join("\n"),
					"inline":true
				},
				{
					"name":"Discord Client",
					"value":([
						`# of Guilds: [ ***${ [...lToken.client.guilds.values()].length }*** ]`,
						`Ping: [ ***${lToken.client.ping.toFixed(3)}*** ] ms`,
						`Uptime: [ ***${(lToken.client.uptime/1000/60).toFixed(3)}*** ] minutes`
					]).join("\n"),
					"inline":true
				},
				{
					"name":"Bot Statistics",
					"value":([
						`# of CMDs Used Total: [ ***${ lToken.database.temp.commandsTotal }*** ]`,
						`# of CMDs Used This Session: [ ***${ lToken.database.temp.commandsUsed }*** ]`,
						`# of Times Rate Limited: [ ***${ lToken.database.temp.rateLimits }*** ]`,
						`# of Miner's Blessings: [ ***${lToken.database.temp.blessings}*** ]`
					]).join("\n"),
					"inline":true
				},
				{
					"name":"DiscordClient event statistics",
					"value":([
						`on_msg: [ ***${ lToken.shared.modules.clientStatistics.message }*** ]`,
						`on_reconnect: [ ***${ lToken.shared.modules.clientStatistics.reconnect }*** ]`,
						`on_disconnect: [ ***${lToken.shared.modules.clientStatistics.disconnect}*** ]`,
						`on_error: [ ***${lToken.shared.modules.clientStatistics.error}*** ]`
					]).join("\n"),
					"inline":true
				},
				{
					"name":"Active users",
					"value":`> ${(Object.values(lToken.database.database).map((ud)=>{
						return ufmt.name(ud);
					})).join(", ")}`,
					"inline":true
				}
			]
		}
	}

	return obj; 
}
