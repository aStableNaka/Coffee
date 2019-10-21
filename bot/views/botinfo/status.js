let process = require("process");
const ufmt = require("../../utils/fmt.js");
const pBar = ufmt.progressBar;
const os = require("os");
module.exports = function (Chicken) {
	const maxMemory = 1;
	let memoryUsage = process.memoryUsage();
	let totalMemoryUsed = parseInt((memoryUsage.rss + memoryUsage.heapTotal) / 1024 / 1024);
	let memProgressBar = pBar(totalMemoryUsed, 1024 * maxMemory, `${totalMemoryUsed} / ${1024 * maxMemory} MB`);
	let cpuUsage = process.cpuUsage();
	let obj = {
		"embed": {
			"title": "Bot Status",
			"description": "",
			"color": 0xfec31b,
			"author": {
				"name": "Coffee",
				"icon_url": "https://i.imgur.com/cFTSxmq.png"
			},
			"fields": [
				{
					"name": "System",
					"value": ([
						`Memory Usage: ${memProgressBar}`,
						`Loads: [ ***${os.loadavg().map((x) => { return x.toFixed(3) }).join(", ")}*** ]`,
						`User CPU Usage: [ ***${(cpuUsage.user * 1e-6).toFixed(3)}*** ] seconds`,
						`System CPU Usage: [ ***${(cpuUsage.system * 1e-6).toFixed(3)}*** ] seconds`,
						`System Uptime: [ ***${(os.uptime() / 60 / 60 / 24).toFixed(3)}*** ] days`
					]).join("\n"),
					"inline": true
				},
				{
					"name": "Database",
					"value": ([
						`Active Documents: [ ***${Object.keys(Chicken.database.cache).length}*** ]`,
						`User Count: [ ***${Object.keys(Chicken.shared.modules.db.global.leaderboards).length}*** ]`,
						`Inactive Count: [ ***${Chicken.shared.modules.db.temp.inactive}*** ]`,
						`Gross Activity: [ ***0*** ]`
					]).join("\n"),
					"inline": true
				},
				{
					"name": "Discord Client",
					"value": ([
						`# of Guilds: [ ***${[...Chicken.client.guilds.values()].length}*** ]`,
						`Ping: [ ***${Chicken.client.ping.toFixed(3)}*** ] ms`,
						`Uptime: [ ***${(Chicken.client.uptime / 1000 / 60).toFixed(3)}*** ] minutes`
					]).join("\n"),
					"inline": true
				},
				{
					"name": "Bot Statistics",
					"value": ([
						`# of CMDs Used Total: [ ***${Chicken.shared.modules.db.temp.commandsTotal}*** ]`,
						`# of CMDs Used This Session: [ ***${Chicken.shared.modules.db.temp.commandsUsed}*** ]`,
						`# of Times Rate Limited: [ ***${Chicken.shared.modules.db.temp.rateLimits}*** ]`,
						`# of Miner's Blessings: [ ***${Chicken.shared.modules.db.temp.blessings}*** ]`
					]).join("\n"),
					"inline": true
				},
				{
					"name": "DiscordClient event statistics",
					"value": ([
						`on_msg: [ ***${Chicken.shared.modules.clientStatistics.message}*** ]`,
						`on_reconnect: [ ***${Chicken.shared.modules.clientStatistics.reconnect}*** ]`,
						`on_disconnect: [ ***${Chicken.shared.modules.clientStatistics.disconnect}*** ]`,
						`on_error: [ ***${Chicken.shared.modules.clientStatistics.error}*** ]`
					]).join("\n"),
					"inline": true
				},
				{
					"name": "Active users",
					"value": `> ${(Object.values(Chicken.database.cache).map((ud) => {
						return ufmt.name(ud);
					})).join(", ")}`,
					"inline": true
				}
			]
		}
	}

	return obj;
}
