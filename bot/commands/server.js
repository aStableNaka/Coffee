const Command = require("../class/command");
const loader = require("../loader");
const locale = require("../data/EN_US");

const hexCache = {};
// todo add pages
class CommandServer extends Command{
	constructor(){
		super();
	}
	get botAdminOnly(){ return false; }
	get usesDatabase(){ return true; }
	get accessors(){ return ['server']; }
	get mimics(){ return [
		{name:"hex",cmd:"server hex"},
	];}
	get help(){ return {
		name:"Server",
		value:"Server commands"
	};}
	get helpExamples(){ return [
			['hex', '', 'Chose a random color role!'],
			['hex', '< #FFFFFF >', 'Set role to input color']
	];}
	get helpGroup(){ return "Server"; }
	get helpName(){ return "Server"; }
	get helpPage(){ return 3; }
	  modifyArgs( args ){ return args; }

	  handleHexInvalidPerms( lToken ){
			lToken.send("I'd love to help, but I don't have the permissions to manage your role!");
	  }

	  /**
	   * Acts on valid parameters
	   * @param {*} lToken 
	   * @param {*} validColorInteger 
	   */
	  executeHexCreate( lToken, validColorInteger ){
			if(!lToken.userData.hexRoleIDS){lToken.userData.hexRoleIDS = {};}

			let rolename = `coffee.hex.${lToken.userData.id}`;
			let existingRoleID = lToken.userData.hexRoleIDS[lToken.guild.id];
			let existingRole = lToken.guild.roles.find(x=>x.id==existingRoleID || null);
			let hexString = validColorInteger.toString(16).padStart(6, '0');

			function confirmation(created){
				  lToken.send( {
						embed:{
							  title:"Color Change",
							  description:`You've ${created?'created a':'changed your'} role color: #${hexString}`,
							  color:validColorInteger,
							  image:{
									url:`https://www.colorhexa.com/${hexString}.png`
							  }
						}
				  })
			}

			if(existingRole){
				  // modify the role
				  existingRole.setColor( validColorInteger ).then( ()=>{
						confirmation();
						lToken.guild.members.find( x=>x.id==lToken.userData.id ).addRole( existingRole, 'Coffee hex' );
				  } ).catch((e)=>{ this.handleHexInvalidPerms(lToken); });
			}else{
				  // create a new role
				  lToken.guild.createRole({name:rolename,color:hexString}).then( (role)=>{
						lToken.userData.hexRoleIDS[lToken.guild.id] = role.id;
						confirmation( true );
						lToken.guild.members.find(x=>x.id==lToken.userData.id).addRole( role, 'Coffee hex' );
				  }).catch(()=>{ this.handleHexInvalidPerms(lToken); });
			}
	  }

	  /**
	   * Assumes inputHex is valid
	   * @param {*} lToken 
	   * @param {*} inputHex 
	   */
	  executeHex( lToken, inputHex ){
			if(inputHex){
				  this.executeHexCreate( lToken, parseInt( inputHex.replace('#', ''), 16 ) );
			} else if(lToken.args.length==1){
				  // Using sophisticated color generation algorithms
				  let hex = Math.floor(0xffffff*Math.random());
				  let hexString = hex.toString(16).padStart(6, '0');
				  hexCache[lToken.userData.id] = hex;
				  lToken.send( {
						embed:{
							  title:"Color Explorer",
							  description:`Here's a color: \`#${hexString}\``,
							  color:hex,
							  image:{
									url:`https://www.colorhexa.com/${hexString}.png`
							  },
							  footer:{
									text:`Use "~hex apply" to apply this color`
							  }
						}
				  });
			}else if(lToken.args[1]=='apply'){
				  if(hexCache[lToken.userData.id]){
						this.executeHexCreate(lToken, hexCache[lToken.userData.id] );
				  }else{
						lToken.send(`Which color do you want?\nUse \`~hex\` to explore color options!`);
				  }
			}else{
				  lToken.send( `Hmm... I couldn't find a valid hexadecimal...\nUse \`~hex\` to explore color options!` );
			}
	  }

	async execute( lToken ){
			if(!lToken.guild){
				  lToken.send('This command is exclusive to servers only!');
				  return;
			}
			switch( lToken.args[0] ){
				  case 'hex':
						this.executeHex( lToken, (lToken.args.join(' ').match(/#?([A-f0-9]){6,7}/gi)||[null])[0] );
						break;
				  default:
						break;
			}
	}
}

module.exports = new CommandServer();