var fs = require('fs');

var _getSites = function(){
    var sitesArray = JSON.parse(fs.readFileSync('sites.json'));
    var myArgs = process.argv.slice(2);
    if(myArgs.length>0){
        sitesArray =  sitesArray.filter(function(site){
            return myArgs.includes(site.name);
        });
    }
    return sitesArray;
}

module.exports = {
	getSites: _getSites
}