const Command = require("../class/command");
const loader = require("../loader");
const locale = require("../data/EN_US");

const hexCache = {};
class CommandServer extends Command {
	constructor() {
		super();
	}
	get botAdminOnly() {
		return false;
	}
	get usesDatabase() {
		return true;
	}
	get accessors() {
		return ['server'];
	}
	get mimics() {
		return [{
			name: "hex",
			cmd: "server hex"
		}, ];
	}
	get help() {
		return 0;
	}
	get helpExamples() {
		return [
			['hex', '', 'Chose a random color role!'],
			['hex', '< #FFFFFF >', 'Set role to input color']
		];
	}
	get helpGroup() {
		return "Server";
	}
	get helpName() {
		return "Server";
	}
	get helpPage() {
		return 3;
	}
	modifyArgs(args) {
		return args;
	}

	handleHexInvalidPerms(Chicken) {
		Chicken.send("I'd love to help, but I don't have the permissions to manage your role!");
	}

	/**
	 * Acts on valid parameters
	 * @param {*} Chicken 
	 * @param {*} validColorInteger 
	 */
	executeHexCreate(Chicken, validColorInteger) {
		if (!Chicken.userData.hexRoleIDS) {
			Chicken.userData.hexRoleIDS = {};
		}

		let rolename = `coffee.hex.${Chicken.userData.id}`;
		let existingRoleID = Chicken.userData.hexRoleIDS[Chicken.guild.id];
		let existingRole = Chicken.guild.roles.find(x => x.id == existingRoleID || null);
		let hexString = validColorInteger.toString(16).padStart(6, '0');

		function confirmation(created) {
			Chicken.send({
				embed: {
					title: "Color Change",
					description: `You've ${created?'created a':'changed your'} role color: #${hexString}`,
					color: validColorInteger,
					image: {
						url: `https://www.colorhexa.com/${hexString}.png`
					}
				}
			})
		}

		if (existingRole) {
			// modify the role
			existingRole.setColor(validColorInteger).then(() => {
				confirmation();
				Chicken.guild.members.find(x => x.id == Chicken.userData.id).addRole(existingRole, 'Coffee hex');
				existingRole.setPosition(0);
			}).catch((e) => {
				this.handleHexInvalidPerms(Chicken);
			});
		} else {
			// create a new role
			Chicken.guild.createRole({
				name: rolename,
				color: hexString
			}).then((role) => {
				Chicken.userData.hexRoleIDS[Chicken.guild.id] = role.id;
				confirmation(true);
				Chicken.guild.members.find(x => x.id == Chicken.userData.id).addRole(role, 'Coffee hex');
				role.setPosition(0);
			}).catch(() => {
				this.handleHexInvalidPerms(Chicken);
			});
		}
	}

	/**
	 * Assumes inputHex is valid
	 * @param {*} Chicken 
	 * @param {*} inputHex 
	 */
	executeHex(Chicken, inputHex) {
		if (inputHex) {
			this.executeHexCreate(Chicken, parseInt(inputHex.replace('#', ''), 16));
		} else if (Chicken.args.length == 1) {
			// Using sophisticated color generation algorithms
			let hex = Math.floor(0xffffff * Math.random());
			let hexString = hex.toString(16).padStart(6, '0');
			hexCache[Chicken.userData.id] = hex;
			Chicken.send({
				embed: {
					title: "Color Explorer",
					description: `Here's a color: \`#${hexString}\``,
					color: hex,
					image: {
						url: `https://www.colorhexa.com/${hexString}.png`
					},
					footer: {
						text: `Use "~hex apply" to apply this color`
					}
				}
			});
		} else if (Chicken.args[1] == 'apply') {
			if (hexCache[Chicken.userData.id]) {
				this.executeHexCreate(Chicken, hexCache[Chicken.userData.id]);
			} else {
				Chicken.send(`Which color do you want?\nUse \`~hex\` to explore color options!`);
			}
		} else {
			Chicken.send(`Hmm... I couldn't find a valid hexadecimal...\nUse \`~hex\` to explore color options!`);
		}
	}

	executeQuote() {

	}

	executeQuotes() {

	}

	async execute(Chicken) {
		if (!Chicken.guild) {
			Chicken.send('This command is exclusive to servers only!');
			return;
		}
		switch (Chicken.args[0]) {
			case 'hex':
				this.executeHex(Chicken, (Chicken.args.join(' ').match(/#?([A-f0-9]){6,7}/gi) || [null])[0]);
				break;
			default:
				break;
		}
	}
}

module.exports = new CommandServer();