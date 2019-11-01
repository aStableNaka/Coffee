const Command = require("../class/command");
const env = require("../env");
const OLDMESSAGE = "**~bp** <buy | shop>\n**~shop** <page>\n**~mine**\n**~buy** <itemCode> <amount | max>";
const loader = require("../loader");
const views = loader("./bot/views/helps", "./views/helps");

const emojis = require("../utils/emojis");
const page = require("../utils/page");

class CommandHelp extends Command {
	constructor() {
		super();
	}

	get accessors() {
		return ['help'];
	}

	modifyArgs(args) {
		return {
			cmd: args[0],
			group: args[1] == 'group'
		};
	}
	async execute(Chicken) {
		if (!Chicken.mArgs.group) {

			// Dynamic view
			let view = views.help;

			function pageThing(hookMsg) {
				// Starting conditions
				const maxPages = 3;
				Chicken.numbers[0] = Math.min(maxPages, Math.max(0, Chicken.numbers[0] || 1));

				let pageOperators = [];
				if (Chicken.numbers[0] > 1) {
					pageOperators.push(
						page.createPageOperator(emojis.arrow_left, () => {

							// Backwards operation
							Chicken.numbers[0]--;

							Chicken.send(view(Chicken)).then(pageThing);
						})
					)
				}
				if (Chicken.numbers[0] < maxPages) {
					pageOperators.push(
						page.createPageOperator(emojis.arrow_right,
							() => {

								// Forewards operation
								Chicken.numbers[0]++;

								Chicken.send(view(Chicken)).then(pageThing);
							})
					)
				}

				page.createPageManager(Chicken, hookMsg, pageOperators);
			}

			Chicken.send(view(Chicken)).then(pageThing);
		}
	}
}

module.exports = new CommandHelp();