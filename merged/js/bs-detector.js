// If we don't have a browser object, check for chrome.
if (typeof chrome === "undefined" && typeof browser !== "undefined") {
  chrome = browser;
}

// declare variables
var bsId = null,
    currentSite = null,
    currentUrl = '',
    data = [],
    dataType = '',
    debug = true,
    expanded = {},
    flagState = 0,  // 0 initial, 1 open, -1 hidden
    firstLoad = true,
    shorts = [],
    shortUrls = [],
    siteId = '',
    warnMessage = '',
    mutationObserver = {},
    observerConfig = {},
    targetNodes = [],
    windowUrl = window.location.hostname;

// asynchronous loading function
function asynch(thisFunc, callback) {
  setTimeout(function() {
    thisFunc();
    if (typeof callback === 'function') {callback();}
  }, 10);
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

// strip urls down to hostname
function cleanUrl(url) {
  // convert facebook urls
  if (siteId == 'facebook') {
    var testLink = decodeURIComponent(url).substring(0, 30);
    var thisUrl = '';
    if (testLink == 'https://l.facebook.com/l.php?u=' || testLink == 'http://l.facebook.com/l.php?u=') {
      thisUrl = decodeURIComponent(url).substring(30).split('&h=', 1);
    }
    url = thisUrl;
  }

  url = url.toString().replace(/^(?:https?|ftp)\:\/\//i, '');
  url = url.toString().replace(/^www\./i, '');
  url = url.toString().replace(/\/.*/, '');
  return url;
}

// identify current site
function idSite() {
  // currentSite looks for the currentUrl (window.location.hostname) in the JSON data file
  currentUrl = cleanUrl(windowUrl);

    if (self === top) {
        switch(currentUrl) {
        case 'www.facebook.com':
        case 'facebook.com':
            siteId = 'facebook';
            break;
        case 'twitter.com':
            siteId = 'twitter';
            break;
        default:
            siteId = 'none';
            // Try to find the site in data
            currentSite = data[ currentUrl ];
            if (typeof(currentSite) === 'undefined') {
                // Maybe with 'www.' prefix?
                currentSite = data[ "www." + currentUrl ];
                if (typeof(currentSite) === 'undefined') {
                    // Maybe with regex? (TBD)
                    // For now, consider it not in the list..
                    currentSite = null;
                }
            }
            if (currentSite) {
                siteId = 'badlink';
                dataType = currentSite.type;
            }
            break;
        }
    }

    if (debug) {
        console.log('currentUrl: ' + currentUrl);
        console.dir(currentSite);
        console.log('siteId: ' + siteId);
        console.log('dataType: ' + dataType);
    }
}

// expand short urls and append to anchor tags
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
    if (debug) {
      console.log('url array: ' + toExpand);
    }
    chrome.runtime.sendMessage(null, {"operation": "expandLinks", "shortLinks": toExpand.toString()}, null, function(response) {
      if (debug) {
        console.log('processLinks: ' + response);
      }
      if (isJson(response)) {
        expanded = JSON.parse(response);
        $.each(expanded, function(key, value) {
          $('a[href="' + value.requestedURL + '"]').attr('longurl', value.resolvedURL);
        });
      } else if (debug) {
       console.log('BS Detector could not expand shortened link');
       console.log(response);
      }
    });
  }
}

var expandLinks = asynch.bind(null, getLinks, processLinks);

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
    case 'caution':
      classType = 'Caution';
      break;
    case 'test':
      classType = 'Test';
      break;
    default:
      classType = 'Classification Pending';
      break;
  }
  if (dataType === 'caution') {
    warnMessage = '⚠️ Caution: Source may be reliable but contents require further verification.';
  } else {
    warnMessage = '💩 Warning: This may not be a reliable source. (' + classType +')';
  }
  if (debug) {
    console.log('warnMessage: ' + warnMessage);
  }
}

// flag entire site
function flagSite() {
  if(flagState != 0){
    return;
  }
  flagState = 1;
  warningMsg();
  var navs = $('nav, #nav, #navigation, #navmenu');

  if ($(navs)) {
    $(navs).first().addClass('bs-alert-shift');
  } else {
    $('body').addClass('bs-alert-shift');
  }

  if (dataType === 'caution') {
    $('body').prepend('<div class="bs-alert bs-warning"></div>');
  } else {
    $('body').prepend('<div class="bs-alert"></div>');
  }

  $('.bs-alert').append('<div class="bs-alert-close">✕</div>');
  $('.bs-alert').append('<p>' + warnMessage + '</p>');

  $('.bs-alert-close').on('click', function() {
    $(navs).first().removeClass('bs-alert-shift');
    $('body').removeClass('bs-alert-shift');
    $('.bs-alert').remove();
  });
}

function showFlag(){
  flagState = 1;
  $('.bs-alert').show();
}

function hideFlag(){
  flagState = -1;
  $('.bs-alert').hide();
}

// get the hostname of a given link
function getHost(thisElement) {
  var thisUrl = '';
  if ($(thisElement).attr('data-expanded-url') !== null && $(thisElement).attr('data-expanded-url') !== undefined) {
    thisUrl = $(thisElement).attr('data-expanded-url');
  } else {
    thisUrl = $(thisElement).attr('href');
  }
  if (thisUrl !== null && thisUrl !== undefined) {
    thisUrl = cleanUrl(thisUrl);
  }
  return thisUrl;
}

// check if short link and if so, add to array
function checkIfShort(theHost, currentElement) {
  var isShort = $.map(shorts, function(url) {
    if (theHost == url || theHost == 'www.' + url) return true;
  });
  if (isShort == 'true') {
    var shortUrl = $(currentElement).attr('href');
    shortUrls.push(shortUrl);
  }
}

// target links
function targetLinks() {

  // find and label external links
  var targetThis = 'a[href]:not([href^="#"]),a[data-expanded-url]';
  $(targetThis).each(function() {
    if (debug) {
      console.log('target link: ' + this);
    }

    // exclude links that have the same hostname
    var a = new RegExp('/' + window.location.host + '/');
    if (!a.test(this.href)) {
      $(this).attr('data-external', true);
    }

    // convert facebook urls
    if (siteId == 'facebook') {
      var testLink = decodeURIComponent(this).substring(0, 30);
      var thisUrl = '';
      if (testLink == 'https://l.facebook.com/l.php?u=') {
        thisUrl = decodeURIComponent(this).substring(30).split('&h=', 1);
      }
      if (thisUrl !== '') {
        $(this).attr('data-external', true);
        $(this).attr('data-expanded-url', thisUrl);
      }
    }
  });

  // process external links
  $('a[data-external="true"]').each(function() {
    if (debug) {
      console.log('external link: ' + this);
    }
    if ($(this).attr('data-is-bs') != 'true') {
      var urlHost = getHost(this);
      // checkIfShort(urlHost, this);

      // check if link is in list of bad domains
      bsId = data[ urlHost ];

      // if link is in bad domain list, tag it
      if (typeof(bsId) !== 'undefined') {
        $(this).attr('data-is-bs', true);
        $(this).attr('data-bs-type', bsId.type);
      }
    }
  });
}

// generate link warnings
function linkWarning() {
  var badlinkWrapper = '';
  targetLinks();

  // flag links
  function flagIt(badlinkWrapper) {
    if (!badlinkWrapper.hasClass('bs-flag')) {
      if (dataType === 'caution') {
        badlinkWrapper.before('<div class="bs-alert-inline warning">' + warnMessage + '</div>');
      } else {
        badlinkWrapper.before('<div class="bs-alert-inline">' + warnMessage + '</div>');
      }
      badlinkWrapper.addClass('bs-flag');
    }
  }

  $('a[data-is-bs="true"]').each(function() {
    dataType = $(this).attr('data-bs-type');
    warningMsg();
    if (debug) {
      console.log('bs link: ' + this);
      console.log('dataType: ' + dataType);
    }

    switch(siteId) {
      case 'facebook':
        if ($(this).parents('._1dwg').length >= 0) {
          badlinkWrapper = $(this).closest('.mtm');
          flagIt(badlinkWrapper);
        }
        if ($(this).parents('.UFICommentContent').length >= 0) {
          badlinkWrapper = $(this).closest('.UFICommentBody');
          flagIt(badlinkWrapper);
        }
        break;
      case 'twitter':
        if ($(this).parents('.tweet').length >= 0) {
          badlinkWrapper = $(this).closest('.js-tweet-text-container');
          flagIt(badlinkWrapper);
        }
        break;
      case 'badlink':
      case 'none':
      default:
        // tagIt();
        break;
    }
  });

  firstLoad = false;
}

// execution script
function execute() {
  mutationObserver = new MutationObserver(function(mutations){
    trigger(mutations);
  });

  if (firstLoad) {
    idSite();
    if (siteId === 'badlink') {
      flagSite();
    }
    firstLoad = false;
  }

  switch(siteId) {
    case 'facebook':
      targetNodes  = [document.getElementById("mainContainer")];
      testobject = document.getElementById("mainContainer");
      console.dir(targetNodes);
      $.each(targetNodes, function(id, node){
      });
      observerConfig = {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true
      };
      break;
    case 'twitter':
      targetNodes = [document.getElementsByClassName("content-main")];
      observerConfig = {
        attributes: true,
        characterData: false,
        childList: true,
        subtree: true
      };
      break;
    case 'badSite':
    case 'none':
    default:
      targetNodes = null;
      observerConfig = {};
      break;
  }

  function trigger(mutations) {
    console.dir(mutations);
    if (debug) {
      console.log('targetNodes: ' + targetNodes);
    }

    if (arguments.length === 0) {
      mutationObserver.disconnect();
      linkWarning();
      $.each(targetNodes, function(id, node) {
        if (node !== null) {
          mutationObserver.observe(node, observerConfig);
        }
      });
      return;
    }
    var hasDesired = false, i = mutations.length, nodes, j;
    mutationObserver.disconnect();

    nloop: while (i--) {
      switch (mutations[i].type) {
        case 'childList':
          nodes = mutations[i].addedNodes;
          j = nodes.length;
          while (j--) if (nodes[j].nodeName.toLowerCase() === 'a') {
            hasDesired = true;
            break nloop;
          }
          break;
        case 'attributes':
          if (mutations[i].target.nodeName.toLowerCase() === 'a' &&
              mutations[i].attributeName.toLowerCase() === 'href') {
            hasDesired = true;
            break nloop;
          }
          break;
        default:
          break;
      }
    }
    if (hasDesired) linkWarning();
    $.each(targetNodes, function(id, node) {
      if (node !== null) {
        mutationObserver.observe(node, observerConfig);
      }
    });
  }

  trigger();
}

// grab data from background
chrome.runtime.sendMessage(null, {"operation": "passData"}, null, function(state) {
  data = state.sites;
  shorts = state.shorteners;
  // Data loaded, start execution.
  $(document).ready(execute);
});

// listen for messages but only in the top frame
if(window.top === window){
  chrome.runtime.onMessage.addListener(
    function(msg){
      switch(msg.operation){
        case 'flagSite':
          dataType = msg.type;
          flagSite();
          break;
        case 'toggleFlag':
          if(flagState == 1){
            hideFlag();
          } else if(flagState == -1){
            showFlag();
          }
          break;
      }
    }
  );
}
