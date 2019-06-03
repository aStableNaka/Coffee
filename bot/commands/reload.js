const Command = require("../class/command");
const env = require("../env");

class CommandReload extends Command{
	constructor(){
		super();
	}

	get botAdminOnly(){ return true; }
	get accessors(){ return ['reload']; }

	async execute( lToken ){
		lToken.send("Reloading commands!");
		if(lToken.flags.includes("savedb")){
			lToken.send("Saving Database!");
			lToken.bot.modules.db.saveDatabase();
		}
		if(lToken.flags.includes("all")){
			lToken.client.reloadModules();
		}else{
			lToken.bot.modules.cmd.loadCommands();
		}
	}
}

module.exports = new CommandReload();