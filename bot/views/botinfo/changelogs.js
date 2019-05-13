module.exports = function( changelogs ){
    return changelogs[changelogs.length-1].join("\n");
}