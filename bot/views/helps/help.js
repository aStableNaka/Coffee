module.exports = function( lToken ){
	let wip = [];
	let page = Math.min(2, Math.max(0, lToken.numbers[0] || 1));
	let embed = {
		"embed": {
			"description":`[ ***Help page ${page}/2*** ]`,
			"color": 0xfec31b,
			"fields": [],
			"footer":{
				"icon_url": "https://i.imgur.com/Rx4eoje.png",
				"text":"On mobile? Add an extra ~ to any command for a mobile-friendly view!"
			}
		}
	}
	Object.values( lToken.shared.sources ).map( (cmd)=>{
		let p = cmd.helpPage || 1;
		if(p != page){ return; }
		if(cmd.help){
			let s = cmd.wip?"[ **WIP** ] ":'';
			let value = cmd.helpExamples.map( (arr)=>{
				return `${s} ~**${arr[0]} ${arr[1]}** *${arr[2]}*`;
			} ).join("\n");
			if(cmd.wip){
				wip.push( {
					name: `${s} ${cmd.helpName}`,
					value: `${value}`
				});
			}else{
				embed.embed.fields.push( {
					name: `${cmd.helpName}`,
					value: value
				});
			}
		}
	});
	embed.embed.fields = [...embed.embed.fields, ...wip];
	return embed;
}