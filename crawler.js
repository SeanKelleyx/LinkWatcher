var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

class Crawler {
  constructor(startUrl, doneProcessing){
    this.START_URL = startUrl;
    this.doneProcessing = doneProcessing;
    this.pagesVisited = {};
    this.externalLinksFound = [];
    this.pagesToVisit = [];
    this.url = new URL(this.START_URL);
    this.baseUrl = this.url.protocol + "//" + this.url.hostname;
    this.pagesToVisit.push(this.START_URL);
    var self = this;
    
    this.crawl = function(){
      if(self.pagesToVisit.length > 0){
        var nextPage = self.pagesToVisit.pop();
        if (nextPage in self.pagesVisited) {
          self.crawl();
        } else {
          self.visitPage(nextPage, self.crawl);
        }
      }else{
        self.doneProcessing(self);
      }
    }

    this.visitPage = function(url, callback) {
      console.log(url);
      self.pagesVisited[url] = true;
      request(url, function(error, response, body) {
        if(error){
          console.log("error: " + error);
          callback();
          return;
        }
        if(response && response.statusCode !== 200) {
          callback();
          return;
        }
        var $ = cheerio.load(body);
        self.collectLinks($);
        callback();
      });
    }

    this.collectLinks = function($) {
      var allLinks = $("a");
      allLinks.each(function() {
        var href = $(this).attr('href');
        if(href){
          var absoluteRegExp = new RegExp('^(?:[a-z]+:)?//', 'i');
          if(absoluteRegExp.test(href) && href.indexOf(self.url.hostname) != 7 && href.indexOf(self.url.hostname) != 8){
            if(!self.externalLinksFound.includes(href)){
              self.externalLinksFound.push(href);
            }
          }else{
            if(absoluteRegExp.test(href)){
              self.pagesToVisit.push(href);
            }else if(href[0] === "/"){
              self.pagesToVisit.push(self.baseUrl + href);
            }else{
              self.pagesToVisit.push(self.baseUrl + "/" + href);
            }
          }
        }
      });
    }
  }
}

function _runCrawler(url, callback){
  var crawler = new Crawler(url, callback);
  crawler.crawl();
}

module.exports = {
  runCrawler: _runCrawler
}