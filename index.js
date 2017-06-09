var siteFileUtility = require('./siteFileUtility'),
    cheerio = require('cheerio'),
    request = require('sync-request');

function processSites(sites){
	var badLinks = [];
	for(var i = 0; i < sites.length; i++){
		var badAnchors = [];
		for(var j = 0; j < sites[i].pages.length; j++){
			badAnchors = badAnchors.concat(processSite(sites[i].pages[j], sites[i].whitelist));
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
	    $('a').each(function(i, element){
	    	var linkOkay = isLinkOkay($(this).attr('href'), whitelist);
	    	if(!linkOkay){
	    		badLinks.push($(this).attr('href'));
	    	}
		});
	} catch(e) {
	      console.log("Exception encountered processing page: " + url);
	}
	return badLinks;
}

function isLinkOkay(linkHref, whitelist){
	for(var i = 0; i < whitelist.length; i++){
		var pattern = new RegExp(whitelist[i]);
		if(pattern.test(linkHref)){
			return true;
		}
	};
	return false;
}

function processNotifications(badLinks){
	var notifiedParties = badLinks.reduce(function(acc,val){
		if(val.badLinks.length > 0 && !acc.includes(val.notify)){
			return acc.concat(val.notify);
		}else{
			return acc;
		}
	},[]);

	notifiedParties.forEach(function(party){
		var badLinksForParty = badLinks.reduce(function(acc,val){
			if(val.notify === party && val.badLinks.length){
				return acc.concat(val);
			}else{
				return acc;
			}
		},[]);
		message = "Attention! You have bad links on the following watched sites: <br/>";
		for(var i = 0; i < badLinksForParty.length; i++){
			message += badLinksForParty[i].name + "<br/>";
			for(var j = 0; j < badLinksForParty[i].badLinks.length; j++){
				message += "-	" + badLinksForParty[i].badLinks[j] + "<br/>";
			}
		}
		sendNotification(party, message);
	});
}

function notify(email, message){

}

var sites = siteFileUtility.getSites();
var badLinks = processSites(sites);
// processNotifications(badLinks);
console.log(JSON.stringify(badLinks));