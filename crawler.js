var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

class Crawler {
  constructor(startUrl){
    this.START_URL = startUrl;
    this.MAX_PAGES_TO_VISIT= 10;
    this.SEARCH_WORD = "stemming";
    this.pagesVisited = {};
    this.numPagesVisited = 0;
    this.pagesToVisit = [];
    this.url = new URL(this.START_URL);
    this.baseUrl = this.url.protocol + "//" + this.url.hostname;
    this.pagesToVisit.push(this.START_URL);
    var self = this;
    
    this.crawl = function(){
      if(self.numPagesVisited >= self.MAX_PAGES_TO_VISIT) {
        console.log("Reached max limit of number of pages to visit.");
        return;
      }
      //assumes there are always more to visit
      var nextPage = self.pagesToVisit.pop();
      if (nextPage in self.pagesVisited) {
        // We've already visited this page, so repeat the crawl
        self.crawl();
      } else {
        // New page we haven't visited
        console.log(nextPage);
        self.visitPage(nextPage, self.crawl);
      }
    }

    this.visitPage = function(url, callback) {
      console.log(url);
      // Add page to our set
      self.pagesVisited[url] = true;
      self.numPagesVisited++;

      // Make the request
      console.log("Visiting page " + url);
      request(url, function(error, response, body) {
        if(error){
          console.log("error: " + error);
        }
        // Check status code (200 is HTTP OK)
        if(response && response.statusCode !== 200) {
          console.log("Status code: " + response.statusCode);
          callback();
          return;
        }
        // Parse the document body
        var $ = cheerio.load(body);
        console.log(typeof self.searchForWord);
        var isWordFound = self.searchForWord($, self.SEARCH_WORD);
        if(isWordFound) {
          console.log('Word ' + self.SEARCH_WORD + ' found at page ' + url);
        } else {
          self.collectInternalLinks($);
          // In this short program, our callback is just calling crawl()
          callback();
        }
      });
    }

    this.searchForWord = function($, word) {
      var bodyText = $('html > body').text().toLowerCase();
      return(bodyText.indexOf(word.toLowerCase()) !== -1);
    }

    this.collectInternalLinks = function($) {
      var relativeLinks = $("a[href^='/']");
      console.log("Found " + relativeLinks.length + " relative links on page");
      relativeLinks.each(function() {
        self.pagesToVisit.push(self.baseUrl + $(this).attr('href'));
      });
    }
  }
}

function _runCrawler(url){
  var crawler = new Crawler(url);
  crawler.crawl();
}

module.exports = {
  runCrawler: _runCrawler
}