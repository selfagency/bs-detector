var data = new Array();
    shorts = new Array();
    toExpand = new Array();
    expanded = new Array();

function async(thisFunc, callback) {
  setTimeout(function() {
      thisFunc;
      if (callback) {callback();}
  }, 10);
}

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

chrome.runtime.sendMessage(null, {"operation": "passData"}, null, function(state) {
  data = state.sites;
  shorts = state.shorteners;
});

chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

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

            function linkWarning() {
              $.each(data, function() {
                var badLink = '[href*="' + this.url + '"],[data-expanded-url*="' + this.url +'"],[longurl*="' + this.url +'"]';
                var classType = '';
                switch (this.type) {
                  case '':
                    classType = 'Classification Pending';
                    break;
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
                  case 'satire':
                    classType = 'Satire';
                    break;
                  case 'state':
                    classType = 'State News Source';
                    break;
                  case 'hate':
                    classType = 'Hate Group';
                    break;
                }
                var warnMessage = '💩 This website is not a reliable news source. Reason: ' + classType;

                $(badLink).each(function() {
                  // facebook handler
                  if (window.location.hostname == 'www.facebook.com') {
                    var testLink = decodeURIComponent(this).substring(0, 30);
                    if (testLink = 'https://l.facebook.com/l.php?u=') {
                      thisUrl = decodeURIComponent(this).substring(30).split('&h=', 1);
                      $(this).attr('longurl', thisUrl);
                    }
                    if ($(this).parents('._1dwg').length == 1) {
                      badLinkWrapper = $(this).closest('.mtm');
                      if (!badLinkWrapper.hasClass('fFlagged')) {
                        badLinkWrapper.before('<div class="bsAlert">' + warnMessage + '</div>');
                        badLinkWrapper.addClass('fFlagged');
                      }
                    }
                    if ($(this).parents('.UFICommentContent').length == 1) {
                      badLinkWrapper = $(this).closest('.UFICommentBody');
                      if (!badLinkWrapper.hasClass('fFlagged')) {
                        badLinkWrapper.after('<div class="bsAlert">' + warnMessage + '</div>');
                        badLinkWrapper.addClass('fFlagged');
                      }
                    }
                  } else if (window.location.hostname == 'twitter.com') {
                    if ($(this).parents('.TwitterCard').length == 1) {
                      badLinkWrapper = $(this).closest('.TwitterCard');
                      if (!badLinkWrapper.hasClass('fFlagged')) {
                        badLinkWrapper.before('<div class="bsAlert">' + warnMessage + '</div>');
                        badLinkWrapper.addClass('fFlagged');
                      }
                    }
                  } else {
                    $(this).addClass("hint--error hint--large hint--bottom");
                    $(this).attr('aria-label', warnMessage);
                  }
                });
              });
            }

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

            function trigger() {
              async(expandLinks(), function() {
                linkWarning();
              });
            }

            trigger();
            watchPage();
          }
    }, 3);
});
