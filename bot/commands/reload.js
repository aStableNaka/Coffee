const Command = require("../class/command");
const env = require("../env");

class CommandReload extends Command{
	constructor(){
		super();
	}

	get botAdminOnly(){ return true; }
	get accessors(){ return ['reload']; }

	async execute( Chicken ){
		Chicken.send("Reloading commands!");
		if(Chicken.flags.includes("savedb")){
			Chicken.send("Saving Database!");
			Chicken.bot.modules.db.saveDatabase();
		}
		if(Chicken.flags.includes("all")){
			Chicken.client.reloadModules();
		}else{
			Chicken.bot.modules.cmd.loadCommands();
		}
	}
}

module.exports = new CommandReload();