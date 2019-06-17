const fs = require("fs");

let extensionWhitelist = [
	".js",
	".json"
]

// Recursive module loading
function loadDirectory( dir, root, recursive ){
	var modules = {};
	fs.readdirSync( dir ).map( ( filename )=>{
		let stat = fs.lstatSync( `${dir}/${ filename }` );
		if(stat.isFile() && filename.includes(".js")){
			// Derefrerence the module so we don't run into any cache issues
			delete require.cache[ require.resolve(`${root}/${ filename }`) ];
			//console.log(`[Loader] Loading ${root}/${ filename }...`);
			// Load it
			var m = require( `${root}/${ filename }`);
			modules[ filename.split(".")[0] ] = m;
			
			//console.log(`Loaded module ${root}/${ filename }!`);
		}else if( stat.isDirectory && recursive ){
			modules[ filename ] = loadDirectory( `${dir}/${filename}`, `${root}/${filename}`, recursive );
		}
	})
	Object.values( modules ).map( (m)=>{
		if(m.linkModule){
			m.linkModule(modules);
		}
	} )
	return modules;
}

module.exports = loadDirectory;