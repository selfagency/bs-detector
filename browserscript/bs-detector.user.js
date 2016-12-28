// ==UserScript==
// @name            B.S. Detector
// @namespace       bs-detector
// @description     Warns users about unreliable news sources.
// @source_code     https://github.com/bs-detector/bs-detector
// @version         0.2.3
// @grant           GM_xmlhttpRequest
// @updateURL       https://github.com/bs-detector/bs-detector/raw/master/browserscript/bs-detector.user.js
// @downloadURL     https://github.com/bs-detector/bs-detector/raw/master/browserscript/bs-detector.user.js
// @require         https://raw.githubusercontent.com/bs-detector/bs-detector/master/ext/js/lib/jquery-3.1.1.slim.min.js
// ==/UserScript==

// Account for possible jquery conflicts.
this.$ = this.jQuery = jQuery.noConflict(true);

/**
 * Run the script when document ready.
 */
$(document).ready(function() {

  // Constant configurations.
  // JSON Data file, whatever is latest from github.
  var JSON_URL = '//raw.githubusercontent.com/bs-detector/bs-detector/master/ext/data/data.json';
  var UNSHORTEN_URL = '//unshorten.me/json/';
  var CSS_FILES = [
    '//github.com/bs-detector/bs-detector/raw/master/ext/css/bs-detector.css'
  ];

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

  // Make an ajax call.
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
              trigger();
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
      case 'clickbait':
        classType = 'Clickbait';
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
      expandLinks();
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

  // Add CSS.
  /*! Hint.css - v2.4.1 - 2016-11-08
   * http://kushagragour.in/lab/hint/
   * Copyright (c) 2016 Kushagra Gour */
  var hintCss = "<style>[class*=hint--]{position:relative;display:inline-block}[class*=hint--]:after,[class*=hint--]:before{position:absolute;-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);visibility:hidden;opacity:0;z-index:1000000;pointer-events:none;-webkit-transition:.3s ease;-moz-transition:.3s ease;transition:.3s ease;-webkit-transition-delay:0s;-moz-transition-delay:0s;transition-delay:0s}[class*=hint--]:hover:after,[class*=hint--]:hover:before{visibility:visible;opacity:1;-webkit-transition-delay:.1s;-moz-transition-delay:.1s;transition-delay:.1s}[class*=hint--]:before{content:'';position:absolute;background:0 0;border:6px solid transparent;z-index:1000001}[class*=hint--]:after{background:#383838;color:#fff;padding:8px 10px;font-size:12px;font-family:Helvetica,Arial,sans-serif;line-height:12px;white-space:nowrap;text-shadow:0 -1px 0 #000;box-shadow:4px 4px 8px rgba(0,0,0,.3)}[class*=hint--][aria-label]:after{content:attr(aria-label)}[class*=hint--][data-hint]:after{content:attr(data-hint)}[aria-label='']:after,[aria-label='']:before,[data-hint='']:after,[data-hint='']:before{display:none!important}.hint--top-left:before,.hint--top-right:before,.hint--top:before{border-top-color:#383838}.hint--bottom-left:before,.hint--bottom-right:before,.hint--bottom:before{border-bottom-color:#383838}.hint--top:after,.hint--top:before{bottom:100%;left:50%}.hint--top:before{margin-bottom:-11px;left:calc(50% - 6px)}.hint--top:after{-webkit-transform:translateX(-50%);-moz-transform:translateX(-50%);transform:translateX(-50%)}.hint--top:hover:before{-webkit-transform:translateY(-8px);-moz-transform:translateY(-8px);transform:translateY(-8px)}.hint--top:hover:after{-webkit-transform:translateX(-50%) translateY(-8px);-moz-transform:translateX(-50%) translateY(-8px);transform:translateX(-50%) translateY(-8px)}.hint--bottom:after,.hint--bottom:before{top:100%;left:50%}.hint--bottom:before{margin-top:-11px;left:calc(50% - 6px)}.hint--bottom:after{-webkit-transform:translateX(-50%);-moz-transform:translateX(-50%);transform:translateX(-50%)}.hint--bottom:hover:before{-webkit-transform:translateY(8px);-moz-transform:translateY(8px);transform:translateY(8px)}.hint--bottom:hover:after{-webkit-transform:translateX(-50%) translateY(8px);-moz-transform:translateX(-50%) translateY(8px);transform:translateX(-50%) translateY(8px)}.hint--right:before{border-right-color:#383838;margin-left:-11px;margin-bottom:-6px}.hint--right:after{margin-bottom:-14px}.hint--right:after,.hint--right:before{left:100%;bottom:50%}.hint--right:hover:after,.hint--right:hover:before{-webkit-transform:translateX(8px);-moz-transform:translateX(8px);transform:translateX(8px)}.hint--left:before{border-left-color:#383838;margin-right:-11px;margin-bottom:-6px}.hint--left:after{margin-bottom:-14px}.hint--left:after,.hint--left:before{right:100%;bottom:50%}.hint--left:hover:after,.hint--left:hover:before{-webkit-transform:translateX(-8px);-moz-transform:translateX(-8px);transform:translateX(-8px)}.hint--top-left:after,.hint--top-left:before{bottom:100%;left:50%}.hint--top-left:before{margin-bottom:-11px;left:calc(50% - 6px)}.hint--top-left:after{-webkit-transform:translateX(-100%);-moz-transform:translateX(-100%);transform:translateX(-100%);margin-left:12px}.hint--top-left:hover:before{-webkit-transform:translateY(-8px);-moz-transform:translateY(-8px);transform:translateY(-8px)}.hint--top-left:hover:after{-webkit-transform:translateX(-100%) translateY(-8px);-moz-transform:translateX(-100%) translateY(-8px);transform:translateX(-100%) translateY(-8px)}.hint--top-right:after,.hint--top-right:before{bottom:100%;left:50%}.hint--top-right:before{margin-bottom:-11px;left:calc(50% - 6px)}.hint--top-right:after{-webkit-transform:translateX(0);-moz-transform:translateX(0);transform:translateX(0);margin-left:-12px}.hint--top-right:hover:after,.hint--top-right:hover:before{-webkit-transform:translateY(-8px);-moz-transform:translateY(-8px);transform:translateY(-8px)}.hint--bottom-left:after,.hint--bottom-left:before{top:100%;left:50%}.hint--bottom-left:before{margin-top:-11px;left:calc(50% - 6px)}.hint--bottom-left:after{-webkit-transform:translateX(-100%);-moz-transform:translateX(-100%);transform:translateX(-100%);margin-left:12px}.hint--bottom-left:hover:before{-webkit-transform:translateY(8px);-moz-transform:translateY(8px);transform:translateY(8px)}.hint--bottom-left:hover:after{-webkit-transform:translateX(-100%) translateY(8px);-moz-transform:translateX(-100%) translateY(8px);transform:translateX(-100%) translateY(8px)}.hint--bottom-right:after,.hint--bottom-right:before{top:100%;left:50%}.hint--bottom-right:before{margin-top:-11px;left:calc(50% - 6px)}.hint--bottom-right:after{-webkit-transform:translateX(0);-moz-transform:translateX(0);transform:translateX(0);margin-left:-12px}.hint--bottom-right:hover:after,.hint--bottom-right:hover:before{-webkit-transform:translateY(8px);-moz-transform:translateY(8px);transform:translateY(8px)}.hint--large:after,.hint--medium:after,.hint--small:after{white-space:normal;line-height:1.4em;word-wrap:break-word}.hint--small:after{width:80px}.hint--medium:after{width:150px}.hint--large:after{width:300px}.hint--error:after{background-color:#b34e4d;text-shadow:0 -1px 0 #592726}.hint--error.hint--top-left:before,.hint--error.hint--top-right:before,.hint--error.hint--top:before{border-top-color:#b34e4d}.hint--error.hint--bottom-left:before,.hint--error.hint--bottom-right:before,.hint--error.hint--bottom:before{border-bottom-color:#b34e4d}.hint--error.hint--left:before{border-left-color:#b34e4d}.hint--error.hint--right:before{border-right-color:#b34e4d}.hint--warning:after{background-color:#c09854;text-shadow:0 -1px 0 #6c5328}.hint--warning.hint--top-left:before,.hint--warning.hint--top-right:before,.hint--warning.hint--top:before{border-top-color:#c09854}.hint--warning.hint--bottom-left:before,.hint--warning.hint--bottom-right:before,.hint--warning.hint--bottom:before{border-bottom-color:#c09854}.hint--warning.hint--left:before{border-left-color:#c09854}.hint--warning.hint--right:before{border-right-color:#c09854}.hint--info:after{background-color:#3986ac;text-shadow:0 -1px 0 #1a3c4d}.hint--info.hint--top-left:before,.hint--info.hint--top-right:before,.hint--info.hint--top:before{border-top-color:#3986ac}.hint--info.hint--bottom-left:before,.hint--info.hint--bottom-right:before,.hint--info.hint--bottom:before{border-bottom-color:#3986ac}.hint--info.hint--left:before{border-left-color:#3986ac}.hint--info.hint--right:before{border-right-color:#3986ac}.hint--success:after{background-color:#458746;text-shadow:0 -1px 0 #1a321a}.hint--success.hint--top-left:before,.hint--success.hint--top-right:before,.hint--success.hint--top:before{border-top-color:#458746}.hint--success.hint--bottom-left:before,.hint--success.hint--bottom-right:before,.hint--success.hint--bottom:before{border-bottom-color:#458746}.hint--success.hint--left:before{border-left-color:#458746}.hint--success.hint--right:before{border-right-color:#458746}.hint--always:after,.hint--always:before{opacity:1;visibility:visible}.hint--always.hint--top:before{-webkit-transform:translateY(-8px);-moz-transform:translateY(-8px);transform:translateY(-8px)}.hint--always.hint--top:after{-webkit-transform:translateX(-50%) translateY(-8px);-moz-transform:translateX(-50%) translateY(-8px);transform:translateX(-50%) translateY(-8px)}.hint--always.hint--top-left:before{-webkit-transform:translateY(-8px);-moz-transform:translateY(-8px);transform:translateY(-8px)}.hint--always.hint--top-left:after{-webkit-transform:translateX(-100%) translateY(-8px);-moz-transform:translateX(-100%) translateY(-8px);transform:translateX(-100%) translateY(-8px)}.hint--always.hint--top-right:after,.hint--always.hint--top-right:before{-webkit-transform:translateY(-8px);-moz-transform:translateY(-8px);transform:translateY(-8px)}.hint--always.hint--bottom:before{-webkit-transform:translateY(8px);-moz-transform:translateY(8px);transform:translateY(8px)}.hint--always.hint--bottom:after{-webkit-transform:translateX(-50%) translateY(8px);-moz-transform:translateX(-50%) translateY(8px);transform:translateX(-50%) translateY(8px)}.hint--always.hint--bottom-left:before{-webkit-transform:translateY(8px);-moz-transform:translateY(8px);transform:translateY(8px)}.hint--always.hint--bottom-left:after{-webkit-transform:translateX(-100%) translateY(8px);-moz-transform:translateX(-100%) translateY(8px);transform:translateX(-100%) translateY(8px)}.hint--always.hint--bottom-right:after,.hint--always.hint--bottom-right:before{-webkit-transform:translateY(8px);-moz-transform:translateY(8px);transform:translateY(8px)}.hint--always.hint--left:after,.hint--always.hint--left:before{-webkit-transform:translateX(-8px);-moz-transform:translateX(-8px);transform:translateX(-8px)}.hint--always.hint--right:after,.hint--always.hint--right:before{-webkit-transform:translateX(8px);-moz-transform:translateX(8px);transform:translateX(8px)}.hint--rounded:after{border-radius:4px}.hint--no-animate:after,.hint--no-animate:before{-webkit-transition-duration:0s;-moz-transition-duration:0s;transition-duration:0s}.hint--bounce:after,.hint--bounce:before{-webkit-transition:opacity .3s ease,visibility .3s ease,-webkit-transform .3s cubic-bezier(.71,1.7,.77,1.24);-moz-transition:opacity .3s ease,visibility .3s ease,-moz-transform .3s cubic-bezier(.71,1.7,.77,1.24);transition:opacity .3s ease,visibility .3s ease,transform .3s cubic-bezier(.71,1.7,.77,1.24)}</style>";
  $('body').prepend(hintCss);
  var bsCss = "<style>.bs-alert{background:#ff0000;display:block;height:28px;left:0;position:absolute;top:0;width:100vw;}.bs-alertp{color:#fff;display:block;font-family:'Arial','Helvetica',sans-serif;font-size:14px;font-weight:bold;line-height:2em;margin:0;text-align:center;text-transform:uppercase;}body.shift{margin-top:28px;}.bs-alert-inline{background:rgba(255,00,00,.25);border:1pxsolid#800000;border-radius:.25em;color:#800000;text-align:center;margin:8px0;padding:4px;}[class*=hint--]{}</style>";
  $('body').prepend(bsCss);

  // Then trigger the behaviors.
  xhReq(JSON_URL, function(file) {
    data = JSON.parse(file);
    // execute
    expandLinks();
    trigger();
    watchPage();
  });

});
