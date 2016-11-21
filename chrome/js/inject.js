var data = [];
    shorts = [];

chrome.runtime.sendMessage(null, {"operation": "passData"}, null, function(state) {
  data = state.sites;
  shorts = state.shorteners;
});

chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            function linkWarning(link) {
              $.each(link, function() {
                var badLink = 'a[href*="' + this.url + '"]';
                var warnMessage = ' This website is not a reliable news source. Reason: ';
                switch (this.type) {
                  case '':
                    var warnMessage = '💩' + warnMessage + 'Classification Pending';
                    break;
                  case 'bias':
                    var warnMessage = '🗯' + warnMessage + 'Extreme Bias';
                    break;
                  case 'conspiracy':
                    var warnMessage = '👁' + warnMessage + 'Conspiracy Theory';
                    break;
                  case 'fake':
                    var warnMessage = '📰' + warnMessage + 'Fake News';
                    break;
                  case 'satire':
                    var warnMessage = '😂' + warnMessage + 'Satire';
                    break;
                  case 'hate':
                    var warnMessage = '💀' + warnMessage + 'Hate Group';
                    break;
                }

                $(badLink).each(function() {
                  if (window.location.hostname == "www.facebook.com") {
                    theWrapper = $(this).closest('div.userContentWrapper');
                    if (!theWrapper.hasClass('fFlagged')) {
                      theWrapper.find('div.userContent').before('<div class="bsAlert">' + warnMessage + '</div>');
                      theWrapper.addClass('fFlagged');
                    }
                  } else {
                    $(this).addClass("hint--error hint--large hint--bottom");
                    $(this).attr('aria-label', warnMessage);
                  }
                });
              });
            };

            function watchPage() {
              var mutationObserver = new MutationObserver(function() {
                linkWarning(data);
              });
              var targetNode = document.body;
              var observerConfig = {
                childList: true,
                subtree: true
              };
              mutationObserver.observe(targetNode, observerConfig);
            }

            linkWarning(data);
            watchPage();
          }
    }, 2);
});
