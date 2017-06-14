var siteFileUtility = require('./siteFileUtility'),
    cheerio = require('cheerio'),
    request = require('sync-request'),
    linkCrawler = require('./crawler.js');

function processSites(sites, callback){
	var siteCompleteCounter = sites.length;
	var badLinks = [];
	for(var i = 0; i < sites.length; i++){
		var site = sites[i];
		processSite(site.baseUrl, site.whitelist, function(badAnchors){
			if(badAnchors.length > 0){
				badLinks.push({
					name: site.name,
					notify: site.notify,
					badLinks: badAnchors
				});
			}
			if(--siteCompleteCounter < 1){
				callback(badLinks);
			}

		});
	}
}

function processSite(url, whitelist, callback){
	var badLinks = [];
	linkCrawler.runCrawler(url, function(crawler){
		crawler.externalLinksFound.forEach(function(link){
			if(!isLinkOkay(link, whitelist)){
	    		badLinks.push(link);
	    	}
		});
		callback(badLinks)
	});
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
		htmlMessage = "Attention! You have bad links on the following watched sites: <br/>";
		textMessage = "Attention! You have bad links on the following watched sites: \n";
		for(var i = 0; i < badLinksForParty.length; i++){
			htmlMessage += badLinksForParty[i].name + "<br/>";
			textMessage += badLinksForParty[i].name + "\n";
			for(var j = 0; j < badLinksForParty[i].badLinks.length; j++){
				htmlMessage += "-	" + badLinksForParty[i].badLinks[j] + "<br/>";
				textMessage += "-	" + badLinksForParty[i].badLinks[j] + "\n";
			}
		}
		notify(party, htmlMessage, textMessage);
	});
}

function notify(email, htmlMessage, textMessage){
	var mailInfo = require('./mailInfo');
	mailInfo.mailOptions.html = htmlMessage;
	mailInfo.mailOptions.text = textMessage;
	mailInfo.mailOptions.to = email;
	mailInfo.mailOptions.subject = "Bad Links Detected On Watched Sites";
    mailInfo.transporter.sendMail(mailInfo.mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
    });
}

var sites = siteFileUtility.getSites();
processSites(sites, function(badLinks){
	processNotifications(badLinks);
});

