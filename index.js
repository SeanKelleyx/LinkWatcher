var siteFileUtility = require('./siteFileUtility'),
    cheerio = require('cheerio'),
    request = require('sync-request');

function processSites(sites){
	var errors = [];
	for(var i = 0; i < sites.length; i++){
		var errorAnchors = [];
		for(var j = 0; j < sites[i].pages.length; j++){
			errorAnchors.concat(processSite(sites[i].pages[j], sites[i].whitelist));
			// return map or object of site to error anchors
		}
		if(errorAnchors.length > 0){
			var errorObject = {
				name: sites[i].name,
				notify: sites[i].notify,
				errors: errorAnchors
			};
			errors.push(errorObject);
		}
	}
	return errors;
}

function processErrors(errors){
	//send emails to notification contact person
}

var sites = siteFileUtility.getSites();
var errors = processSites(sites);
processErrors(errors);