// ==UserScript==
// @name                B.S. Detector
// @namespace           bs-detector
// @description         Warns users about unreliable news sources.
// @source_code         https://github.com/bs-detector/bs-detector
// @version             0.2.8
// @grant               GM_xmlhttpRequest
// @updateURL           https://github.com/bs-detector/bs-detector/raw/master/browserscript/bs-detector.user.js
// @downloadURL         https://github.com/bs-detector/bs-detector/raw/master/browserscript/bs-detector.user.js
// @require             https://raw.githubusercontent.com/bs-detector/bs-detector/master/ext/js/lib/jquery-3.1.1.slim.min.js
// ==/UserScript==

/**
 * Account for possible jquery conflicts.
 */
this.$ = this.jQuery = jQuery.noConflict(true);



/**
 * IE9 and up support for CustomEvent, create the function if it doesn't exist.
 */
(function () {
    if ( typeof window.CustomEvent === 'function' ) return false;

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = window.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();



/**
 * Given a function, get the arg list out of it.
 */
function _getArgs(func) {
    // First match everything inside the function argument parens.
    var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
    // Split the arguments string into an array comma delimited.
    return args.split(',').map(function(arg) {
        // Ensure no inline comments are parsed and trim the whitespace.
        return arg.replace(/\/\*.*\*\//, '').trim();
    }).filter(function(arg) {
        // Ensure no undefined values are added.
        return arg;
    });
}

/**
 * Chrome function mockups - used here to make it easier to copy and
 * paste from the standard extension to GM implementation outside of context.
 * When we copy code over, replace chrome calls with underscored functions.
 */

function _chrome_extension_getURL(url) {
    var EXT_URL = '//raw.githubusercontent.com/bs-detector/bs-detector/master/ext';
    return EXT_URL + url;
}

function _chrome_webNavigation_onDOMContentLoaded_addListener(callback, filter) {
    // Add the event listener for content loaded.
    $(document).ready(function() {
        // Make the call back.
        var event = new Object();
        event.url = window.location.href;
        event.frameId = 0;
        event.tabId = 0;
        callback(event);
    });
}

function _chrome_runtime_onMessage_addListener(callback) {
    // Add the event listener for content loaded.
    var eventFunction = function (e) {
        // Add the details as args.
        var passArgs = [];
        var args = _getArgs(callback);
        args.forEach( function (argName) {
            if (e.detail.hasOwnProperty(argName)) {
                passArgs.push(e.detail[argName]);
            }
            else {
                passArgs.push('');
            }
        });
        // Add the callback and functions defined for it.
        callback.apply(this, passArgs);
    }
    window.addEventListener('_sendMessage', eventFunction, false);
}

function _chrome_runtime_sendMessage(extId, message, options, callback) {
    var response = '';
    // Make the new event.
    var event = new CustomEvent('_sendMessage', {
        detail: {
            message: message,
            request: message,
            sender: 'sender',
            sendResponse: function (message) {
                response = message;
            }
        },
        bubbles: false,
        cancelable: false
    });
    // Dispatch the new event.
    window.dispatchEvent(event);
    // And make the callback with the results.
    if (callback) {
        callback(response);
    }
}

/**
function chrome.pageAction.show(tabId) {}
function chrome.tabs.sendMessage(tabId, message, options, callback) {}
 */

/**
 * Utility functions needed by the front and backends of the extension.
 */



/**
 * @description Cleanup a url to get the domain out of it.
 * @method url2Domain
 * @param {string} url The URL to cleanup.
 */
function url2Domain(url) {

    'use strict';

   if (url) {
        url = url.toString().replace(/^(?:https?|ftp)\:\/\//i, '');
        url = url.toString().replace(/^www\./i, '');
        url = url.toString().replace(/\/.*/, '');
        return url;
    }
}

/**
 * @description Makes an external JSON GET call, and executes a callback response.
 * @method xhReq
 * @param {string} url The external URL.
 * @param {callback} callback The callback on successful response.
 */
function xhReq(url, success, failure) {

    'use strict';

    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        // Once done loading.
        if (xhr.readyState === 4) {
            // Call the right feedback based on response.
            if (xhr.status === 200 && success) {
                success(xhr.responseText);
            } else if (failure) {
                failure(xhr.responseText);
            }
        }
    }
    xhr.send(null);
}



/**
 * Background functions.
 */



var
    siteList = [],
    shorts = [
        'bit.do',
        'bit.ly',
        'cutt.us',
        'goo.gl',
        'ht.ly',
        'is.gd',
        'ow.ly',
        'po.st',
        'tinyurl.com',
        'tr.im',
        'trib.al',
        'u.to',
        'v.gd',
        'x.co'
    ],
    toExpand = [],
    expanded = [];

/**
 * @description Expand a given set of links.
 * @method expandLinks
 * @param {string} request The set of links to expand.
 * @return {promise} A Deferred promise to allow sending after all links processed.
 */
 function expandLinks(request) {

    'use strict';

    var defer = new $.Deferred();
    var links = request.shortLinks.split(',');
    // Loop over each link to expand it.
    $.each(links, function (index, url) {
        var expandThis = 'https://unshorten.me/json/' + encodeURIComponent(url);
        // Make the AJAX call to expand, and handle response after.
        xhReq(expandThis, function (response) {
            expanded.push(response);
            // Is that the last link?
            if ((index + 1) >= links.length) {
                defer.resolve();
            }
        });
    });
    return defer.promise();
}



/**
 * @description Make the JSON call to gather data on load.
 * @method xhReq
 * @param {string} url The external URL.
 * @param {callback} callback The callback on successful response.
 */
xhReq(_chrome_extension_getURL('/data/data.json'), function (file) {

    'use strict';

    siteList = JSON.parse(file);

    // listen for loading of hosts in the siteList as soon as its populated
    var
        domain,
        domainList = [],
        domainRE = new RegExp(/^[^\s\/\.\?\#]+(\.[^\s\/\.\?\#]+)+$/); // yuck

    for (domain in siteList) {
        if (domainRE.test(domain)) {
            domainList.push({
                hostSuffix: domain.toLocaleLowerCase()
            });
        }
    }

console.log('loading');
console.log(siteList);
    if (domainList.length > 0) {
        _chrome_webNavigation_onDOMContentLoaded_addListener(function (e) {
            var domain;
            if (e.frameId === 0) {
                chrome.pageAction.show(e.tabId);
                domain = url2Domain(e.url);
                if (domain && siteList[domain]) {
                  chrome.tabs.sendMessage(e.tabId, {
                      operation: 'flagSite',
                      type: siteList[domain].type
                  });
                } else {
                  console.debug('No data found for domain.', domain, e);
                }
            }
        }, {
            url: domainList
        });
    }
});



/**
 * @description Add listeners to be called from bs-detector.js.
 * @method chrome.runtime.onMessage.addListener
 * @param {function}
 */
_chrome_runtime_onMessage_addListener(function (request, sender, sendResponse) {

    'use strict';

    switch (request.operation) {
        case 'passData':
            sendResponse({
                sites: siteList,
                shorteners: shorts
            });
        break;
        case 'expandLinks':
            // Call link expanding, returning only
            // once all the links have been completed.
            expandLinks(request).done(function () {
                sendResponse({
                    expandedLinks: expanded
                });
            });
        break;
    }
    // Support asynchronous response.
    return true;
});



/**
 * BS detector object and functions.
 */


/**
 * @description Class constructor with variable initialisation
 *
 * @method BSDetector
 */
function BSDetector() {

    'use strict';

    this.bsId = null;
    this.currentSite = null;
    this.currentUrl = '';
    this.data = [];
    this.dataType = '';
    this.debugActive = true;
    this.expandLinks = null;
    this.expanded = {};
    this.flagState = 0; // 0 initial, 1 open, -1 hidden
    this.firstLoad = true;
    this.shorts = [];
    this.shortUrls = [];
    this.siteId = '';
    this.warnMessage = '';
    this.mutationObserver = {};
    this.windowUrl = window.location.hostname;
    this.observerRoot = null;
    this.observerFilter = null;
    this.ownHostRegExp = new RegExp( window.location.host );
    this.lfbRegExp = new RegExp( /^https?:\/\/l\.facebook\.com\/l\.php\?u=([^&]+)/);
}



BSDetector.prototype = {

    constructor: BSDetector,


    /**
     * @description Log debug messages, if the debug flag is set
     *
     * @method debug
     * @param {string}
     */
    debug: function () {

        'use strict';

        if (this.debugActive === true) {
            console.debug.apply(null,['[B.S. Detector] '].concat(arguments));
        }
    },


    /**
     * @description Asynchronous loading function
     *
     * @method asynch
     * @param {string} thisFunc
     * @param {function} callback
     */
    asynch: function (thisFunc, callback) {

        'use strict';

        setTimeout(function () {
            thisFunc();
            if (typeof callback === 'function') {
                callback();
            }
        }, 10);
    },



    /**
     * @description Check if a string is valid JSON
     *
     * @method isJson
     * @param {string} string
     * @param {boolean}
     */
    isJson: function (string) {

        'use strict';

        try {
            JSON.parse(string);
        } catch (e) {
            console.error('Given string is no valid JSON');
            return false;
        }
        return true;
    },



    /**
     * @description Strip urls down to hostname
     *
     * @method cleanUrl
     * @param {string} url
     * @return {string}
     */
    cleanUrl: function (url) {

        'use strict';

        var
            testLink = '',
            thisUrl = '';

        if (this.siteId === 'facebook') {
            testLink = decodeURIComponent(url).substring(0, 30);

            if (testLink === 'https://l.facebook.com/l.php?u=' || testLink === 'http://l.facebook.com/l.php?u=') {
                thisUrl = decodeURIComponent(url).substring(30).split('&h=', 1);
                url = thisUrl;
            }

        }

        return url2Domain(url);
    },



    /**
     * @description Identify current site
     *
     * @method identifySite
     */
    identifySite: function () {

        'use strict';

        // currentSite looks for the currentUrl (window.location.hostname) in the JSON data file
        this.currentUrl = this.cleanUrl(this.windowUrl);

        if (self === top) {
            switch (this.currentUrl) {
            case 'www.facebook.com':
            case 'facebook.com':
                this.siteId = 'facebook';
                break;
            case 'twitter.com':
                this.siteId = 'twitter';
                break;
            default:
                this.siteId = 'none';
                // Try to find the site in data
                this.currentSite = this.data[this.currentUrl];
                if (typeof this.currentSite === 'undefined') {
                    // Maybe with 'www.' prefix?
                    this.currentSite = this.data['www.' + this.currentUrl];
                    if (typeof this.currentSite === 'undefined') {
                        // Maybe with regex? (TBD)
                        // For now, consider it not in the list..
                        this.currentSite = null;
                    }
                }
                if (this.currentSite) {
                    this.siteId = 'badlink';
                    this.dataType = this.currentSite.type;
                }
                break;
            }
        }

        this.debug('this.currentUrl: ', this.currentUrl);
        this.debug('this.currentSite: ', this.currentSite);
        this.debug('this.siteId: ', this.siteId);
        this.debug('this.dataType: ', this.dataType);

    },



    /**
     * @description Expand short urls and append to anchor tags
     *
     * @method getLinks
     */
    getLinks: function () {

        'use strict';

        var shorts = this.shorts;
        var selectors = $('a[href]').filter(function (index, a) {
            var matches = shorts.some(function (shortener) {
                return a.hostname.endsWith(shortener);
            });
            return $.uniqueSort(matches);
        })
        .each(function (index, a) {
            bsd.toExpand.push(a.href);
        });
    },



    /*
     * @description Expanding short urls
     *
     * @method processLinks
     */
    processLinks: function () {

        'use strict';

        if (this.toExpand) {

            this.debug('this.toExpand[]: ', this.toExpand);

            _chrome_runtime_sendMessage(null, {
                'operation': 'expandLinks',
                'shortLinks': this.toExpand.toString()
            }, null, function (response) {
                this.debug('Expanded Links: ', response);

                if (this.isJson(response)) {
                    this.expanded = JSON.parse(response);
                    $.each(this.expanded, function (key, value) {
                        $('a[href="' + value.requestedURL + '"]').attr('longurl', value.resolvedURL);
                    });
                } else {
                    this.debug('Could not expand shortened link');
                    this.debug('Response: ' + response);
                }
            });
        }
    },



    /**
     * @description Generate warning message for a given url
     *
     * @method warningMsg
     */
    warningMsg: function () {

        'use strict';

        var classType = '';

        switch (this.dataType) {
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


        if (this.dataType === 'caution') {
            this.warnMessage = 'x Caution: Source may be reliable but contents require further verification.';
        } else {
            this.warnMessage = 'x Warning: This may not be a reliable source. (' + classType + ')';
        }

        this.debug('this.warnMessage: ', this.warnMessage);
    },



    /**
     * @description Flag entire site
     *
     * @method flagSite
     */
    flagSite: function () {

        'use strict';

        var navs = $('nav, #nav, #navigation, #navmenu');

        if (this.flagState !== 0) {
            return;
        }

        this.flagState = 1;
        this.warningMsg();

        if ($(navs)) {
            $(navs).first().addClass('bs-alert-shift');
        } else {
            $('body').addClass('bs-alert-shift');
        }

        if (this.dataType === 'caution') {
            $('body').prepend($('<div class="bs-alert bs-caution">'));
        } else {
            $('body').prepend($('<div class="bs-alert">'));
        }

        $('.bs-alert').append($('<div class="bs-alert-close">').text('✕'));
        $('.bs-alert').append($('<span class="bs-alert-span">').text(this.warnMessage));

        $('.bs-alert-close').on('click', function () {
            $(navs).first().removeClass('bs-alert-shift');
            $('body').removeClass('bs-alert-shift');
            $('.bs-alert').remove();
        });
    },



    /**
     * @description Make flags visible
     *
     * @method showFlag
     */
    showFlag: function () {

        'use strict';

        this.flagState = 1;
        $('.bs-alert').show();
    },



    /**
     * @description Make flags invisible
     *
     * @method hideFlag
     */
    hideFlag: function () {

        'use strict';

        this.flagState = -1;
        $('.bs-alert').hide();
    },



    /**
     * @description Get the hostname of a given element's link
     *
     * @method getHost
     * @param {object} $element
     * @return {string}
     */
    getHost: function ($element) {

        'use strict';

        var thisUrl = '';
        if ($element.attr('data-expanded-url') !== null && $element.attr('data-expanded-url') !== undefined) {
            thisUrl = $element.attr('data-expanded-url');
        } else {
            thisUrl = $element.attr('href');
        }
        if (thisUrl !== null && thisUrl !== undefined) {
            thisUrl = this.cleanUrl(thisUrl);
        }

        return thisUrl;
    },



    /**
     * @description Target links
     *
     * @method targetLinks
     */
    targetLinks: function () {

        'use strict';

        // find and label external links
        $('a[href]:not([href^="#"]), a[data-expanded-url]').each(function () {

            var
                testLink = '',
                thisUrl = '',
                matches = null;

            // exclude links that have the same hostname
            if (!bsd.ownHostRegExp.test(this.href)) {
                $(this).attr('data-external', true);
            }

            // convert facebook urls
            if (bsd.siteId === 'facebook') {

                testLink = decodeURIComponent(this.href);
                if (matches = bsd.lfbRegExp.exec(this.href)) {
                    thisUrl = decodeURIComponent(matches[1]);
                }
                if (thisUrl !== '') {
                    $(this).attr('data-external', true);
                    $(this).attr('data-expanded-url', thisUrl);
                }
            }
        });

        // process external links
        $('a[data-external="true"]').each(function () {
            var urlHost = '';

            if ($(this).attr('data-is-bs') !== 'true') {

                urlHost = bsd.getHost($(this));
                // check if link is in list of bad domains
                bsd.bsId = bsd.data[urlHost];

                // if link is in bad domain list, tag it
                if (typeof bsd.bsId !== 'undefined') {
                    $(this).attr('data-is-bs', true);
                    $(this).attr('data-bs-type', bsd.bsId.type);
                }
            }
        });
    },



    /**
     * @description Flag links
     *
     * @method flagPost
     * @param {object} $badlinkWrapper
     */
    flagPost: function ($badlinkWrapper) {

        'use strict';

        if (!$badlinkWrapper.hasClass('bs-flag')) {

            if (this.dataType === 'caution') {
                $badlinkWrapper.before($('<div class="bs-alert-inline warning">').text(this.warnMessage));
            } else {
                $badlinkWrapper.before($('<div class="bs-alert-inline">').text(this.warnMessage));
            }

            $badlinkWrapper.addClass('bs-flag');
        }
    },



    /**
     * @description
     *
     * @method setAlertOnPosts
     * @param {string}
     */
    setAlertOnPosts: function () {

        'use strict';

        bsd.targetLinks();

        $('a[data-is-bs="true"]').each(function () {
            bsd.dataType = $(this).attr('data-bs-type');
            bsd.warningMsg();

            bsd.debug('Current warning link: ', this);
            bsd.debug('bsd.dataType: ', bsd.dataType);

            switch (bsd.siteId) {
            case 'facebook':
                if ($(this).parents('._1dwg').length >= 0) {
                    bsd.flagPost($(this).closest('.mtm'));
                }
                if ($(this).parents('.UFICommentContent').length >= 0) {
                    bsd.flagPost($(this).closest('.UFICommentBody'));
                }
                break;
            case 'twitter':
                if ($(this).parents('.tweet').length >= 0) {
                    bsd.flagPost($(this).closest('.js-tweet-text-container'));
                }
                break;
            case 'badlink':
            case 'none':
                break;
            default:
                break;
            }
        });

        this.firstLoad = false;
    },

    /**
     * @description Main run this after a mutation
     *
     * @method observerCallback
     */
    observerCallback: function () {

      'use strict';

      bsd.debug('observerCallback');
      bsd.observerRoot.mutationSummary("disconnect");
      bsd.observerExec();
    },

    /**
     * @description Scan for posts, turn on the observer, and scan again for more changes
     *
     * @method observerExec
     */
    observerExec: function () {

      'use strict';

      bsd.debug('observerExec');
      this.setAlertOnPosts();
      window.setTimeout(this.observe,500);
      window.setTimeout(this.setAlertOnPosts,1000);
    },

    /**
     * @description Turn on the mutation observer
     *
     * @method observe
     */
    observe: function () {

      'use strict';

      bsd.debug('observe',bsd.observerCallback,bsd.observerFilter, bsd.observerRoot);
      bsd.observerRoot.mutationSummary("connect", bsd.observerCallback, bsd.observerFilter);
    },

    /**
     * @description Main execution script
     *
     * @method execute
     */
    execute: function () {

        'use strict';

        if (this.firstLoad === true) {
            this.identifySite();

            if (this.siteId === 'badlink') {
                this.flagSite();
            }

            this.firstLoad = false;
        }

        switch (this.siteId) {
        case 'facebook':
            this.observerRoot = $("body");
            this.observerFilter = [{ element:"div" }];
            break;
        case 'twitter':
            this.observerRoot = $("div#page-container");
            this.observerFilter = [{ element:"div" }];
            break;
        case 'badSite':
            break;
        case 'none':
        default:
            this.observerRoot = $("body");
            this.observerFilter = [{ element:"div" }];
            break;
        }

        this.observerExec();

    }
};



/**
 * @description Grab data from background and execute extension
 * @link https://developer.chrome_com/extensions/runtime#method-sendMessage
 *
 * @method chrome.runtime.sendMessage
 * @param {string} extensionId
 * @param {mixed} message
 * @param {object} options
 * @param {function} responseCallback
 */
if (window === window.top || url2Domain(window.location.hostname) == 'twitter.com') {
    var bsd = new BSDetector();


    /**
     * @description Grab data from background and execute extension
     *
     * @method
     * @param {string}
     */
    _chrome_runtime_sendMessage(null, {'operation': 'passData'}, null, function (state) {

        'use strict';

console.log('state');
console.log(state);
        // If we're ready, start loading data.
        if (state != 'undefined' && state.sites != 'undefined' && state.shorteners != 'undefined') {
            bsd.data = state.sites;
            bsd.shorts = state.shorteners;

            // Data loaded, start execution.
            $(document).ready(function () {
                bsd.expandLinks = bsd.asynch.bind(null, bsd.getLinks, bsd.processLinks);
                bsd.execute();
            });
        }
    });
}



/**
 * @description Listen for messages but only in the top frame
 * @link https://developer.chrome_com/extensions/runtime#event-onMessage
 *
 * @method chrome.runtime.onMessage.addListener
 * @param {function}
 */
if (window.top === window) {
    _chrome_runtime_onMessage_addListener(function (message) {

        'use strict';

        switch (message.operation) {
        case 'flagSite':
            bsd.dataType = message.type;
            bsd.flagSite();
            break;
        case 'toggleFlag':
            if (bsd.flagState === 1) {
                bsd.hideFlag();
            } else if (bsd.flagState === -1) {
                bsd.showFlag();
            }
            break;
        }
    });
}
