const Command = require("../class/command");
const env = require("../env");
const loader = require("../loader");
const views = loader("./bot/views/botinfo", "./views/botinfo");
const locale = require("../data/EN_US");

class CommandPreference extends Command {
	constructor() {
		super();
		this.wip = true;
	}
	get botAdminOnly() {
		return false;
	}
	get usesDatabase() {
		return false;
	}
	get accessors() {
		return ['pref', 'preference'];
	}
	get mimics() {
		return [];
	}
	get help() {
		return null;
	}
	get helpExamples() {
		return [
			['pref', '', 'View a list of available crafting options!'],
			['craft', '< item name >', 'craft an item!']
		];
	}
	get helpGroup() {
		return "Crafting";
	}
	get helpName() {
		return "Crafting";
	}
	get helpPage() {
		return 2;
	}
	modifyArgs(args) {
		return args;
	}
	async execute(Chicken) {

	}
}

module.exports = new CommandPreference();