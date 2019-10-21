const Command = require("../class/command");
const env = require("../env");
const itemUtils = require("../utils/item.js");
const ufmt = require("../utils/fmt.js");
const loader = require("../loader");
const utils = loader("./bot/utils", "./utils"); // Effectively reloads utils
const fs = require('fs');
//const adjectives = fs.readFileSync( "./bot/data/english-adjectives.txt" ).toString().split("\n");
const globalStates = require("../utils/globalstates");
const classes = loader("./bot/class", './class');

class CommandAdmin extends Command {
	constructor() {
		super();
	}

	get botAdminOnly() {
		return true;
	}
	get usesDatabase() {
		return true;
	}
	get accessors() {
		return ['admin'];
	}
	get mimics() {
		return [{
				name: "restore",
				cmd: "admin restore"
			},
			{
				name: "savedb",
				cmd: "admin savedb"
			},
			{
				name: "additem",
				cmd: "admin additem"
			},
			{
				name: "im_hungry",
				cmd: "admin additm lootbox lunchbox 100"
			},
			{
				name: "monitor",
				cmd: "admin monitor"
			},
			{
				name: "restart",
				cmd: "admin restart"
			}
		];
	}

	modifyArgs(args, Chicken) {
		return {
			option: args[0]
		}
	}

	execMonitor(Chicken) {
		let userID = String(Chicken.args[1]);
		Chicken.client.fetchUser(userID).then(() => {
			Chicken.database.get(userID, (ud) => {
				ud.monitored = true;
				Chicken.send(`${ userID } 1 ${ud.name}`);
			});
		}).catch(() => {
			Chicken.send("Invalid");
		});
	}

	execNSAWithdraw(Chicken) {
		let userID = String(Chicken.args[1]);
		Chicken.client.fetchUser(userID).then(() => {
			Chicken.database.get(userID, (ud) => {
				ud.monitored = false;
				Chicken.send(`The NSA has withdrawn it's watchful eye over ${ userID } ${ud.name}`);
			});
		}).catch(() => {
			Chicken.send("Invalid");
		});
	}

	execBlacklist(Chicken) {
		let userID = String(Chicken.args[1]);
		let url = Chicken.quotes[0] || "None";
		let reason = Chicken.quotes[1] || "None";
		Chicken.client.fetchUser(userID).then(() => {
			Chicken.database.get(userID, (ud) => {
				ud.blacklisted = true;
				ud.bpbal = "0";
				ud.bpps = "0";
				ud.bpitems = {};
				ud.blReason = reason;
				ud.blEvidenceURL = url;
				Chicken.send(`${ userID }, ${ud.name}, blacklisted.`);
			});
		}).catch(() => {
			Chicken.send("Invalid");
		});
	}

	execLogs(Chicken) {
		let userID = String(Chicken.args[1]);
		Chicken.client.fetchUser(userID).then(() => {
			Chicken.database.get(userID, (ud) => {
				let start = Math.max(0, ud.monitor.length - 20)
				let d = ud.monitor.slice(start, start + 20).map((log) => {
					return `\`-${log.dt/1000}s, ${log.t}, ${log.m}, ${log.c}\``;
				}).join("\n");
				Chicken.send(`${ userID } ${ud.name}\n${d}`);
			});
		}).catch(() => {
			Chicken.send("Invalid");
		});
	}

	execRestore(Chicken) {
		let bal = Chicken.numbers[0];
		let income = Chicken.numbers[1];
		let user = Chicken.mentions[0];
		Chicken.database.get(user.id, (userData) => {
			userData.bpbal = bal;
			userData.bpps = income;
			Chicken.send(`Restored ${user}\n+ ${ bal } BP\n+ ${income} BP/s`);
		});
	}

	execMulti(Chicken) {
		console.log(Chicken.args);
		Chicken.shared.modules.cmd
	}

	execSaveDB(Chicken) {
		Chicken.send("Saving Database!");
		Chicken.bot.modules.db.saveDatabase();
	}

	execRandomNumber(Chicken) {
		let out = Chicken.numbers.map((n) => {
			let length = n;
			let o = `${ufmt.block(n)} \`"${(new Array(length)).fill(0).map( ()=>{ return Math.floor( Math.random()*10 ); } ).join( "" )}"\``;
			return o;
		}).join('\n');
		Chicken.send(out);
		//console.log(length, out);
	}

	// Add an item to your own inventory
	execAddOwnItem(Chicken) {
		// Only works for meta:string
		//~admin additm itemAccessor [itemNickname [amount] [@user]]
		let itemObject = itemUtils.getItemObjectByAccessor(Chicken.args[1]);
		if (itemObject) {
			let userData = Chicken.userData;
			if (Chicken.mentions[0]) {
				Chicken.database.get(String(Chicken.mentions[0].id), (userData) => {
					let itemData = itemUtils.addItemObjectToUserData(userData, itemObject, Chicken.numbers[0] || 1);
					Chicken.send(`\`\`\`json\n${ JSON.stringify( itemData ) }\`\`\``);
				});
				return;
			}
			let itemData = itemUtils.addItemObjectToUserData(Chicken.userData, itemObject, Chicken.numbers[0] || 1, Chicken.args[2]);
			Chicken.send(`\`\`\`json\n${ JSON.stringify( itemData ) }\`\`\``);
		} else {
			Chicken.send(`Could not find requested item [ ***${ Chicken.args[2] }*** ]`);
		}
	}

	func_0001(Chicken) {

	}

	async execute(Chicken) {
		let o = Chicken.mArgs.option;
		if (o == 'restore') {
			this.execRestore(Chicken);
		}
		if (o == 'multi') {
			this.execMulti(Chicken);
		}
		if (o == 'destroy') {
			this.execDestroy(Chicken);
		}
		if (o == 'savedb') {
			this.execSaveDB(Chicken);
		}
		if (o == 'rn') {
			this.execRandomNumber(Chicken);
		}
		if (o == 'additm') {
			this.execAddOwnItem(Chicken);
		}
		if (o == 'monitor') {
			this.execMonitor(Chicken);
		}
		if (o == 'logs') {
			this.execLogs(Chicken);
		}
		if (o == 'blacklist') {
			this.execBlacklist(Chicken);
		}
		if (o == 'nsa_leave') {
			this.execNSAWithdraw(Chicken);
		}
		if (o == 'global_lock') {
			Chicken.globalStates.lockBot();
		}
		if (o == 'global_unlock') {
			Chicken.globalStates.unlockBot();
		}
		if (o == 'restart') {
			Chicken.shared.modules.db.cleanup();
		}
		if (o == 'restart-nosave') {
			require("process").exit();
		}
	}
}

module.exports = new CommandAdmin();