/* casper.js */
var casper = require('casper').create({
  verbose: true,
  logLevel: 'debug'
});

var account = require('account.json');

var login_url = 'https://member.inven.co.kr/user/scorpio/mlogin';
var main_url = 'http://www.inven.co.kr/webzine/';

casper.start(login_url, function(response) {
  this.echo('Login page is loaded.');
  this.fill('form#loginForm', {
    'user_id': account.id,
    'password': account.password
  }, false);
  this.echo('Try to login.');
  this.evaluate(function() {
    document.querySelector('button#loginBtn').click();
  });
  casper.waitFor(function check() {
    return (this.getCurrentUrl() === main_url);
  }, function then() {
    var userName = this.evaluate(function() {
      return document.querySelector('span.textUserNick').innerHTML;
    });
    if (userName) {
      this.echo('Login succeeded.');
      onLoginSuccess.bind(this)();
    } else {
      this.echo('Login failed.');
    }
  }, function timeout() {
    this.echo('Login failed becuase it took a long time.');
  });
});

function onLoginSuccess() {
  // comAdTopRight3,comAdHomeTop,comAdMidFull,comAdPopUp,comAdPromotion,
  // comAdSky3,comAdTi,comAdSP1,comAdSP2,comAdSlide,comAdBackSkin,comAdTopSky
  var iframes = this.evaluate(function() {
    var iframes = document.querySelectorAll('iframe');
    var iframe_names = [].map.call(iframes, function(iframe) {
      return iframe.name;
    }).filter(function(name) {
      return name.indexOf('comAd') > -1;
    });
    return iframe_names;
  });
  function clickAd() {
    casper.waitForSelector('a', function then() {
      this.click('a');
    }, function timeout() {
    });
  }
  this.echo('Start clicking on the ads.');
  this.each(iframes, function(self, iframe) {
    if (casper.exists('iframe[name="' + iframe + '"]')) {
      this.echo(iframe);
      casper.withFrame(iframe, clickAd.bind(this));
    }
  });
  this.echo('Clicking ads has ended.');
}

casper.run();
