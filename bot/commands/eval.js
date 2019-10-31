const fs = require("fs");

const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader("./bot/views/ev", "./views/ev");

const ufmt = require("../utils/fmt.js");
const bpUtils = require("../utils/bp");
const globalStates = require("../utils/globalstates");
const pN = ufmt.numPretty;
const fBP = ufmt.formatBP;

const BigInt = require("big-integer");
const BigNum = require('bignumber.js');
const locale = require("../data/EN_US.json");

const itemUtils = require("../utils/item.js");

// For temporary stuff
let temp = {};

class CommandEval extends Command {
	constructor() {
		super();
	}
	get botAdminOnly() {
		return true;
	}
	get accessors() {
		return ['ev', 'eval', 'e'];
	}
	modifyArgs(args) {
		return args.join(" ");
	}
	get usesDatabase() {
		return true;
	}
	async execute(Chicken) {
		try {
			let modules = Chicken.bot.modules;
			let db = modules.db;
			let commands = Chicken.bot.commands;
			let author = Chicken.author;
			let userData = Chicken.userData;
			let send = (...args) => {
				Chicken.send(...args)
			};

			Chicken.mArgs = Chicken.msg.toString().split(' ').slice(1).join(' ').replace("```javascript\n", '\n').replace('```', '');
			// Env protection
			Chicken.mArgs = Chicken.mArgs.replace(/env/gi, '({})');
			console.log(Chicken.mArgs);
			let ev = eval(Chicken.mArgs);

			let jRes = function (msg) {
				views.eval_success(Chicken, ufmt.code(JSON.stringify(msg, null, "\t")));
			}

			if (Chicken.oFlags["noresponse"]) {
				return;
			}
			if (Chicken.flags.includes('json')) {
				ev = JSON.stringify(ev, null, "\t");
			}
			if (Chicken.flags.includes('simple')) {
				Chicken.send(ev);
			} else {
				Chicken.send(views.eval_success(Chicken, ufmt.code(ev)));
			}
			if (Chicken.oFlags["save"]) {
				let filename = `./debug/eval_${new Date().getTime()}.txt`;
				fs.writeFileSync(filename, ev);
				Chicken.send(`[ Eval ] data written to ${filename}`);
			}
		} catch (error) {
			Chicken.send(views.eval_fail(Chicken, error));
		}
	}
}

module.exports = new CommandEval();