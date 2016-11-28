// ==UserScript==
// @name            B.S. Detector
// @namespace       bs-detector
// @description     Warns users about unreliable news sources.
// @source_code     https://github.com/selfagency/bs-detector
// @version         0.2.3
// @grant           GM_xmlhttpRequest
// @updateURL       https://github.com/selfagency/bs-detector/raw/master/greasemonkey/bs-detector.user.js
// @downloadURL     https://github.com/selfagency/bs-detector/raw/master/greasemonkey/bs-detector.user.js
// @require         https://raw.githubusercontent.com/selfagency/bs-detector/master/chrome/js/jquery-3.1.1.slim.min.js
// @resource        https://raw.githubusercontent.com/selfagency/bs-detector/master/chrome/css/hint.min.css
// @resource        https://raw.githubusercontent.com/selfagency/bs-detector/master/chrome/css/inject.css
// ==/UserScript==

// Account for possible jquery conflicts.
this.$ = this.jQuery = jQuery.noConflict(true);

/**
 * Run the script when document ready.
 */
$(document).ready(function() {

  // Constant configurations.
  // JSON Data file, whatever is latest from github.
  var JSON_URL = 'https://raw.githubusercontent.com/selfagency/bs-detector/master/chrome/data/data.json';
  var UNSHORTEN_URL = 'https://unshorten.me/json/';

  // Short URLs to use.
  var shorts = [
    'bit.do',
    't.co',
    'lnkd.in',
    'db.tt',
    'qr.ae',
    'adf.ly',
    'goo.gl',
    'bit.ly',
    'cur.lv',
    'tinyurl.com',
    'ow.ly',
    'ht.ly',
    'ity.im',
    'q.gs',
    'is.gd',
    'po.st',
    'bc.vc',
    'u.to',
    'j.mp',
    'buzurl.com',
    'cutt.us',
    'u.bb',
    'x.co',
    'scrnch.me',
    'vzturl.com',
    'qr.net',
    '1url.com',
    'tweez.me',
    'v.gd',
    'tr.im',
    'trib.al',
    'zip.net',
    '➡.ws',
    '✩.ws'
  ];

  // declare variables
  var firstLoad = true;
  var currentUrl = window.location.hostname;
  var siteId = '';
  var currentSite = [];
  var data = [];
  var dataType = '';
  var toExpand = [];
  var warnMessage = '';

  // asynchronus loading function
  function async(thisFunc, callback) {
    setTimeout(function() {
      thisFunc;
      if (callback) {callback();}
    }, 10);
  }

  function xhReq(url, callback) {
    // Using built in Greasemonkey request to handle cross domain.
    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      onload: function(xhr) {
        callback(xhr.responseText);
      }
    });
  }

  // json validation function
  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  // identify current site
  function idSite() {
    // currentSite looks for the currentUrl (window.location.hostname) in the JSON data file
    if (self === top) {
      currentSite = $.map(data, function(id, obj) {
        if (currentUrl === id.url || currentUrl === 'www.' + id.url) return id;
      });
      if (currentSite.length > 0 && (currentUrl == currentSite[0].url || currentUrl == 'www.' + currentSite[0].url)) {
        siteId = 'badlink';
        dataType = currentSite[0].type;
      } else {
        switch(currentUrl) {
          case 'www.facebook.com':
            siteId = 'facebook';
            break;
          case 'twitter.com':
            siteId = 'facebook';
            break;
          case currentSite:
            siteId = 'badlink';
            break;
          default:
            siteId = 'none';
            break;
        }
      }
    }
  }

  // expand short urls and append to anchor tags
  function expandLinks() {

    function getLinks() {
      $.each(shorts, function() {
        var shortLink = 'a[href*="' + this + '"]';
        $(shortLink).each(function() {
          var theLink = ($(this).attr('href'));
          toExpand.push(theLink);
        });
      });
    }

    function processLinks() {
      if (toExpand) {
        // GM Change - replacing chrome.runtime call.
        $.each(toExpand, function(index, url) {
          xhReq(UNSHORTEN_URL + url, function(response) {
            if (isJson(response)) {
              var expanded = JSON.parse(response);
              $('a[href="' + expanded.requestedURL + '"]').attr('longurl', expanded.resolvedURL);
            } else {
              console.log('BS Detector could not expand shortened link.');
              console.log(response);
            }
          });
        });
      }
    }

    async(getLinks(), function() {
      processLinks();
    });
  }

  // generate warning message for a given url
  function warningMsg() {
    var classType = '';
    switch (dataType) {
      case 'bias':
        classType = 'Extreme Bias';
        break;
      case 'conspiracy':
        classType = 'Conspiracy Theory';
        break;
      case 'fake':
        classType = 'Fake News';
        break;
      case 'junksci':
        classType = 'Junk Science';
        break;
      case 'rumors':
        classType = 'Rumor Mill';
        break;
      case 'satire':
        classType = 'Satire';
        break;
      case 'state':
        classType = 'State News Source';
        break;
      case 'hate':
        classType = 'Hate Group';
        break;
      case 'test':
        classType = 'The Self Agency: Makers of the B.S. Detector';
        break;
      default:
        classType = 'Classification Pending';
        break;
    }
    if (dataType != 'test') {
      warnMessage = '💩 This website is not a reliable news source. Reason: ' + classType;
    } else {
      warnMessage = classType;
    }
  }

  // flag entire site
  function flagSite() {
    warningMsg();
    $('body').addClass('shift');
    $('body').prepend('<div class="bs-alert"></div>');
    $('.bs-alert').append('<p>' + warnMessage + '</p>');
  }

  // flag links fb/twitter
  function flagIt() {
    if (!badLinkWrapper.hasClass('fFlagged')) {
      badLinkWrapper.before('<div class="bs-alert-inline">' + warnMessage + '</div>');
      badLinkWrapper.addClass('fFlagged');
    }
  }

  // generate link warnings
  function linkWarning() {
    $.each(data, function() {
      if (currentUrl != this.url) {
        var badLink = '[href*="' + this.url + '"],[data-expanded-url*="' + this.url +'"],[longurl*="' + this.url +'"]';
        dataType = this.type;
        warningMsg();
      }

      switch(siteId) {
        case 'badlink':
          $(badLink).each(function() {
            if ($(this).attr('is-bs') != 'true' && $(this).attr('href').indexOf(currentSite[0].url) < 0) {
              $(this).prepend('💩 ');
              $(this).addClass("hint--error hint--large hint--bottom");
              $(this).attr('aria-label', warnMessage);
              $(this).attr('is-bs', 'true');
            }
          });
          break;
        case 'none':
          $(badLink).each(function() {
            if ($(this).attr('is-bs') != 'true') {
              $(this).prepend('💩 ');
              $(this).addClass("hint--error hint--large hint--bottom");
              $(this).attr('aria-label', warnMessage);
              $(this).attr('is-bs', 'true');
            }
          });
          break;
        case 'facebook':
          var testLink = decodeURIComponent(this).substring(0, 30);
          if (testLink = 'https://l.facebook.com/l.php?u=') {
            thisUrl = decodeURIComponent(this).substring(30).split('&h=', 1);
            $(this).attr('longurl', thisUrl);
          }
          $(badLink).each(function() {
            if ($(this).parents('._1dwg').length == 1) {
              badLinkWrapper = $(this).closest('.mtm');
              flagIt();
            }
            if ($(this).parents('.UFICommentContent').length == 1) {
              badLinkWrapper = $(this).closest('.UFICommentBody');
              flagIt();
            }
          });
          break;
        case 'twitter':
          $(badLink).each(function() {
            if ($(this).parents('.TwitterCard').length == 1) {
              badLinkWrapper = $(this).closest('.TwitterCard');
              flagIt();
            }
          });
          break;
      }
    });

    firstLoad = false;
  }

  // watch page for changes
  function watchPage() {
    var mutationObserver = new MutationObserver(function() {
      trigger();
    });
    var targetNode = document.body;
    var observerConfig = {
      childList: true,
      subtree: true
    };
    mutationObserver.observe(targetNode, observerConfig);
  }

  // execution script
  function trigger() {
    if (firstLoad) {
      idSite();
      if (siteId === 'badlink') {
        flagSite();
      }
      linkWarning();
    } else {
      linkWarning();
    }
  }

  // GM Change - replacing chrome.runtime call.
  // Then trigger the behaviors.
  xhReq(JSON_URL, function(file) {
    data = JSON.parse(file);
    expandLinks();
    // execute
    trigger();
    watchPage();
  });

});
