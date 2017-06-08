var siteFileUtility = require('./siteFileUtility'),
    cheerio = require('cheerio'),
    request = require('sync-request');

function printSiteAnchors(sites){
    for(var i = 0; i < sites.length; i++){
        console.log(sites[i].name);
        for(var j = 0; j < sites[i].pages.length; j++){
            console.log("# " + sites[i].pages[j]);
            try{
                var res = request('GET', sites[i].pages[j]);
                var pageHtml = res.getBody();
                var $ = cheerio.load(pageHtml);
                var anchorList = $('a');
                for(var k = 0; k < anchorList.length; k++){
                    console.log("-   " + anchorList[k].attribs.href);
                }
            } catch(e) {
                console.log("-   Exception encountered getting page.");
            }
        }
    }
}

var sites = siteFileUtility.getSites();
printSiteAnchors(sites);