// declare variables
var currentUrl = window.location.hostname;
    data = [];
    dataType = '';
    expanded = [];
    firstLoad = true;
    shorts = [];
    siteId = '';
    toExpand = [];
    warnMessage = '';

// asyncrhonus loading function
function async(thisFunc, callback) {
  setTimeout(function() {
      thisFunc;
      if (callback) {callback();}
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

// grab data from background
chrome.runtime.sendMessage(null, {"operation": "passData"}, null, function(state) {
  data = state.sites;
  shorts = state.shorteners;
});

// execute on load
chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // identify current site
            function idSite() {
              var currentSite = $.map(data, function(id, entry) {
                if (currentUrl === id.url || currentUrl === 'www.' + id.url) return id;
              });

              if (currentSite.url && currentSite.url == currentUrl) {
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
                  console.log('url array: ' + toExpand);
                  chrome.runtime.sendMessage(null, {"operation": "expandLinks", "shortLinks": toExpand.toString()}, null, function(response) {
                    console.log(response);
                    if (isJson(response)) {
                      expanded = JSON.parse(response);
                      $.each(expanded, function(key, value) {
                        $('a[href="' + value.requestedURL + '"]').attr('longurl', value.resolvedURL);
                      });
                    } else {
                     console.log('BS Detector could not expand shortened link');
                     console.log(response);
                    }
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
                default:
                  classType = 'Classification Pending';
                  break;
              }
              warnMessage = '💩 This website is not a reliable news source. Reason: ' + classType;
            }

            // flag entire site
            function flagSite() {
              warningMsg();
              $('body').addClass('shift');
              $('body').prepend('<div class="bs-alert"></div>');
              $('.bs-alert').append(warnMessage);
            }

            // flag links
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
                  case 'none':
                    $(badLink).each(function() {
                      if ($(this).text.substring(1) != '💩') {
                        $(this).prepend('💩 ');
                        $(this).addClass("hint--error hint--large hint--bottom");
                        $(this).attr('aria-label', warnMessage);
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
              // async(expandLinks(), function() {
              //   linkWarning();
              // });
              if (firstLoad) {
                idSite();
                if (siteId === 'badlink') {
                  flagSite();
                  linkWarning();
                } else {
                  linkWarning();
                }
              } else {
                linkWarning();
              }
            }

            // execute
            trigger();
            watchPage();
          }
    }, 10);
});
