// declare variables
var bsId = [],
    currentSite = [],
    currentUrl = '',
    data = [],
    dataType = '',
    debug = true,
    expanded = {},
    firstLoad = true,
    shorts = [],
    shortUrls = [],
    siteId = '',
    warnMessage = '',
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
  url = url.replace(/^(?:https?|ftp)\:\/\//i, '');
  url = url.replace(/^www\./i, '');
  url = url.replace(/\/.*/, '');
  return url;
}

// grab data from background
chrome.runtime.sendMessage(null, {"operation": "passData"}, null, function(state) {
  data = state.sites;
  shorts = state.shorteners;
});

// identify current site
function idSite() {
  // currentSite looks for the currentUrl (window.location.hostname) in the JSON data file
  currentUrl = cleanUrl(windowUrl);
  if (debug) {
    console.log('currentUrl: ' + currentUrl);
  }

  if (self === top) {
    currentSite = $.map(data, function(id, obj) {
      if (currentUrl === id.url || currentUrl === 'www.' + id.url) return id;
    });
    if (debug) {
      console.log('currentSite: ' + currentSite[0]);
    }

    if (currentSite.length > 0 && (currentUrl == currentSite[0].url || currentUrl == 'www.' + currentSite[0].url)) {
      siteId = 'badlink';
      dataType = currentSite[0].type;
    } else {
      switch(currentUrl) {
        case 'facebook.com':
          siteId = 'facebook';
          break;
        case 'twitter.com':
          siteId = 'twitter';
          break;
        case currentSite:
          siteId = 'badlink';
          break;
        default:
          siteId = 'none';
          break;
      }
    }

    if (debug) {
      console.log('siteId: ' + siteId);
    }
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
      console.log(response);
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
    case 'test':
      classType = 'Test';
      break;
    default:
      classType = 'Classification Pending';
      break;
  }
  warnMessage = '💩 This website is not a reliable news source. Reason: ' + classType;
  console.log('warnMessage: ' + warnMessage);
}

// flag entire site
function flagSite() {
  warningMsg();
  $('body').addClass('shift');
  $('body').prepend('<div class="bs-alert"></div>');
  $('.bs-alert').append('<p>' + warnMessage + '</p>');
}

// get the hostname of a given link
function getHost(thisElement) {
  var thisUrl = '';
  if ($(thisElement).attr('data-expanded-url') != null) {
    thisUrl = $(thisElement).attr('data-expanded-url');
  } else {
    thisUrl = $(thisElement).attr('href');
  }
  if (thisUrl != null) {
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
      if (debug) {
        console.log('urlHost: ' + urlHost);
      }
      // checkIfShort(urlHost, this);

      // check if link is in list of bad domains
      bsId = $.map(data, function(id, obj) {
        if (urlHost == id.url || urlHost == 'www.' + id.url) return id;
      });

      // if link is in bad domain list, tag it
      if (bsId[0]) {
        $(this).attr('data-is-bs', true);
        $(this).attr('data-bs-type', bsId[0].type);
      }
    }
  });
}

// flag links
function flagIt(badLinkWrapper) {
  if (!badlinkWrapper.hasClass('bs-flag')) {
    badlinkWrapper.before('<div class="bs-alert-inline">' + warnMessage + '</div>');
    badlinkWrapper.addClass('bs-flag');
  }
}

// generate link warnings
function linkWarning() {
  var badlinkWrapper = '';
  targetLinks();

  $('a[data-is-bs="true"]').each(function() {
    if (debug) {
      console.log('bs link: ' + this);
    }
    dataType = $(this).attr('data-bs-type');
    warningMsg();

    switch(siteId) {
      case 'facebook':
        if ($(this).parents('._1dwg').length >= 0) {
          badlinkWrapper = $(this).closest('.mtm');
          flagIt(badLinkWrapper);
        }
        if ($(this).parents('.UFICommentContent').length >= 0) {
          badlinkWrapper = $(this).closest('.UFICommentBody');
          flagIt(badLinkWrapper);
        }
        break;
      case 'twitter':
        if ($(this).parents('.tweet').length >= 0) {
          badlinkWrapper = $(this).closest('.js-tweet-text-container');
          flagIt(badLinkWrapper);
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
  var mutationObserver = new MutationObserver(trigger);
  var observerConfig = {};
  var targetNodes = [];

  if (firstLoad) {
    idSite();
    if (siteId === 'badlink') {
      flagSite();
    }
    firstLoad = false;
  }

  switch(siteId) {
    case 'facebook':
      targetNodes  = [document.getElementById("contentArea"), document.getElementById("pagelet_timeline_main_column")];
      observerConfig = {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true
      };
      break;
    case 'twitter':
      targetNodes = [document.getElementById("content-main")];
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
    if (debug) {
      console.log('targetNodes: ' + targetNodes);
    }

    if (arguments.length === 0) {
      mutationObserver.disconnect();
      linkWarning();
      $.each(targetNodes, function(id, node) {
        if (node != null) {
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
      if (node != null) {
        mutationObserver.observe(node, observerConfig);
      }
    });
  }

  trigger();
}

// execute on load
chrome.extension.sendMessage({}, function(response) {
    $(document).ready(execute);
});
