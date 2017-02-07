/*!
 * B.S. Detector v0.2.7 (http://bsdetector.tech)
 * Copyright 2016 The B.S. Detector Authors (https://github.com/selfagency/bs-detector/graphs/contributors)
 * Licensed under LGPL-3.0 (https://github.com/selfagency/bs-detector/blob/master/LICENSE)
 */

/*global chrome,browser,self,top,console,$,JSON,MutationObserver*/
/*jslint browser: true */


/**
 * If we don't have a chrome object, check for browser and rename.
 */
if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
    chrome = browser;
}



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
    this.debugActive = false;
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
    this.ownHostRegExp = new RegExp(window.location.host);
    this.platform = new Platform(window.location.hostname);
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
            console.debug.apply(null, ['[B.S. 💩 Detector] '].concat(arguments));
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
     * @description Identify current site
     *
     * @method identifySite
     */
    identifySite: function () {

        'use strict';

        // currentSite looks for the currentUrl (window.location.hostname) in the JSON data file
        this.currentUrl = url2Domain(this.windowUrl);

        if (self === top) {

            if (this.platform.name === 'none') {
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

        var
            shorts = this.shorts,
            selectors = $('a[href]');

        $(selectors).filter(function (index, a) {
            var matches = shorts.some(function (shortener) {
                return a.hostname.endsWith(shortener);
            });

            return $.uniqueSort(matches);

        }).each(function (index, a) {
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

            chrome.runtime.sendMessage(null, {
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
            this.warnMessage = '⚠️ Caution: Source may be reliable but contents require further verification.';
        } else {
            this.warnMessage = '⚠️ Warning: This may not be a reliable source. (' + classType + ')';
        }
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
            thisUrl = this.platform.cleanUrl(thisUrl);
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

            bsd.platform.expandExternalLinks($(this), this.href);
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

            var
                index = 0,
                itemSelectors = bsd.platform.config.itemSelectors;

            bsd.dataType = $(this).attr('data-bs-type');
            bsd.warningMsg();

            if (itemSelectors.length > 0) {
                for (index in itemSelectors) {

                    if ($(this).parents(itemSelectors[index].parent).length > 0) {
                        bsd.flagPost($(this).closest(itemSelectors[index].body));
                    }
                }
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

        var
            observerRoot = bsd.platform.config.observer.root,
            observerRootObj = $(observerRoot);

        if (typeof observerRootObj == 'object') {
            observerRootObj.mutationSummary('disconnect');
        }

        bsd.observerExec();
    },

    /**
     * @description Scan for posts, turn on the observer, and scan again for more changes
     *
     * @method observerExec
     */
    observerExec: function () {

        'use strict';

        this.setAlertOnPosts();
        window.setTimeout(bsd.observe, 500);
        window.setTimeout(bsd.setAlertOnPosts, 1000);
    },

    /**
     * @description Turn on the mutation observer
     *
     * @method observe
     */
    observe: function () {

        'use strict';

        var
            observerRoot = bsd.platform.config.observer.root,
            observerRootObj = $(observerRoot),
            observerFilter = bsd.platform.config.observer.filter;

        if (typeof observerRootObj == 'object') {
            observerRootObj.mutationSummary('connect', bsd.observerCallback, observerFilter);
        }
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

        this.observerExec();

    }
};

/**
 * @description Grab data from background and execute extension
 * @link https://developer.chrome.com/extensions/runtime#method-sendMessage
 *
 * @method chrome.runtime.sendMessage
 * @param {string} extensionId
 * @param {mixed} message
 * @param {object} options
 * @param {function} responseCallback
 */
if (window === window.top || url2Domain(window.location.hostname) === 'twitter.com') {
    var bsd = new BSDetector();


    /**
     * @description Grab data from background and execute extension
     *
     * @method
     * @param {string}
     */
    chrome.runtime.sendMessage(null, {'operation': 'passData'}, null, function (state) {

        'use strict';

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
 * @link https://developer.chrome.com/extensions/runtime#event-onMessage
 *
 * @method chrome.runtime.onMessage.addListener
 * @param {function}
 */
if (window.top === window) {
    chrome.runtime.onMessage.addListener(function (message) {

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
