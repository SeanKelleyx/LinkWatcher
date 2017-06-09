var siteFileUtility = require('./siteFileUtility'),
    cheerio = require('cheerio'),
    request = require('sync-request');

function processSites(sites){
	var badLinks = [];
	for(var i = 0; i < sites.length; i++){
		var badAnchors = [];
		for(var j = 0; j < sites[i].pages.length; j++){
			badAnchors.push(processSite(sites[i].pages[j], sites[i].whitelist));
			// return map or object of site to error anchors
		}
		if(badAnchors.length > 0){
			badLinks.push({
				name: sites[i].name,
				notify: sites[i].notify,
				badLinks: badAnchors
			});
		}
	}
	return badLinks;
}

function processSite(url, whitelist){
	var badLinks = [];
	try{
	    var res = request('GET', url);
	    var pageHtml = res.getBody();
	    var $ = cheerio.load(pageHtml);
	    var anchorList = $('a');
	    for(var i = 0; i < anchorList.length; i++){
	    	if(!isLinkOkay(anchorList[i].attribs.href, whitelist)){
	    		badLinks.push(anchorList[i].attribs.href);
	    	}
	    }
	} catch(e) {
	      console.log("Exception encountered getting page: " + url);
	}
	return badLinks;
}

function isLinkOkay(linkHref, whitelist){
	for(var i = 0; i < whitelist.length; i++){
		var pattern = new RegExp(whitelist[i]);
		if(pattern.test(linkHref)){
			return true;
		}
	}
	return false;
}

function processErrors(errors){
	//send notifications to notification contact person
}

var sites = siteFileUtility.getSites();
var badLinks = processSites(sites);
// processErrors(errors);
console.log(JSON.stringify(badLinks));