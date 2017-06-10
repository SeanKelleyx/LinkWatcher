Link Watcher
============

What it does:
-------------

Watches specified web pages for links, checks them against a whitelist, and notifies you if there are unexpected links on a page.

How it works:
-------------

To print the anchor hrefs to the console call the `printAnchors.js` file. You can supply `names` of sites as arguments if you only want to run some of the sites in your `sites.json` file. example: `node printAnchors.js MySite` would only print out anchors for "MySite" assuming you have a site named "MySite" in your `sites.json` file.

To check links of sites/pages in `sites.json` you can call the `index.js` file. Again you can supply the `names` of specific sites as arguments if you only want to run some of the sites in your `sites.json` file. example: `node index.js MySite` would only check the anchors of `MySite` against the specified whitelist for that site. Omitting any arguments runs the check agains all sites in the `sites.json` file.


What goes in `sites.json`
-------------------------

You need to create a file in your project directory called `sites.json` this contains information on the sites you want to keep track of as well as who to contact if there is an issue, and what links should be whitelisted. The whitelist is an array of regular expressions for whitelisted anchor hrefs.

example:
```
[
	{
		"name": "Site1",
		"notify": "your@email.com",
		"pages": [
			"http://yoursite1.com"
		],
		"whitelist": [
			"^#"
			"^mailto:whatever@gmail\\.com"
		]
	},
	{
		"name": "Site2",
		"notify": "your@email.com",
		"pages": [
			"http://yoursite2.com"
		],
		"whitelist": ["^https?:\/\/(?:www\\.)?google\\.com"]
	}
]
```

What goes in `mailInfo.js`
--------------------------

You need to create a file in your project directory called `mailInfo.js` this should use [nodemailer (docs here)](https://nodemailer.com/about/) and export a transport and mailOptions.

super simple example:
```
let nodemailer = require('nodemailer');

let _transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'whatever@gmail.com',
        pass: 'yourpassword'
    }
});

var _mailOptions = {
    from: '"LinkWatcher" <whatever@gmail.com>'
};

module.exports = {
	transporter: _transporter,
	mailOptions: _mailOptions
};
```


TODO
----

* Optionally supply a blacklist of regular expressions
* Allow notifications by email or on slack channel
* Get rid of for loops
* Get rid of sync-request's