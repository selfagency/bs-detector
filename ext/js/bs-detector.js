/*!
 * B.S. Detector v0.2.7 (http://bsdetector.tech)
 * Copyright 2016 The B.S. Detector Authors (https://github.com/selfagency/bs-detector/graphs/contributors)
 * Licensed under LGPL-3.0 (https://github.com/selfagency/bs-detector/blob/master/LICENSE)
 */

/*global chrome,browser,self,top,console,$,JSON,MutationObserver*/
/*jslint browser: true */


// If we don't have a browser object, check for chrome.
if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
    chrome = browser;
}


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
    this.observerConfig = {};
    this.targetNodes = [];
    this.windowUrl = window.location.hostname;
}



BSDetector.prototype = {

    constructor: BSDetector,


    /**
     * @description Log debug messages, if the flag is set
     *
     * @method debug
     * @param {string}
     */
    debug: function (message) {

        'use strict';

        if (this.debugActive === true) {
            console.debug('[B.S. 💩 Detector] ' + message);
        }
    },


    /**
     * @description Asynchronous loading function
     *
     * @method asynch
     * @param {string}
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
     * @description JSON validation function
     *
     * @method isJson
     * @param {string}
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
     * @method
     * @param {string}
     */
    cleanUrl: function (url) {

        'use strict';

        var
            testLink = '',
            thisUrl = '';

        // convert facebook urls
        if (this.siteId === 'facebook') {
            testLink = decodeURIComponent(url).substring(0, 30);

            if (testLink === 'https://l.facebook.com/l.php?u=' || testLink === 'http://l.facebook.com/l.php?u=') {
                thisUrl = decodeURIComponent(url).substring(30).split('&h=', 1);
            }
            url = thisUrl;
        }

        url = url2Domain(url);
        return url;
    },



    /**
     * @description Identify current site
     *
     * @method identifySite
     * @param {string}
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

        this.debug('currentUrl: ' + this.currentUrl);
        this.debug(this.currentSite);
        this.debug('siteId: ' + this.siteId);
        this.debug('dataType: ' + this.dataType);
    },



    /**
     * @description Expand short urls and append to anchor tags
     *
     * @method
     * @param {string}
     */
    getLinks: function () {

        'use strict';

        $.each(this.shorts, function () {
            var
                shortLink = 'a[href*="' + $(this) + '"]';

            $(shortLink).each(function () {
                bsd.toExpand.push($(this).attr('href'));
            });
        });
    },



    /*
     * @description
     *
     * @method
     * @param {string}
     */
    processLinks: function () {

        'use strict';

        if (this.toExpand) {

            this.debug('url array: ' + this.toExpand);

            chrome.runtime.sendMessage(null, {
                'operation': 'expandLinks',
                'shortLinks': this.toExpand.toString()
            }, null, function (response) {
                this.debug('processLinks: ' + response);

                if (this.isJson(response)) {
                    this.expanded = JSON.parse(response);
                    $.each(this.expanded, function (key, value) {
                        $('a[href="' + value.requestedURL + '"]').attr('longurl', value.resolvedURL);
                    });
                } else {
                    this.debug('BS Detector could not expand shortened link');
                    this.debug(response);
                }
            });
        }
    },



    /**
     * @description Generate warning message for a given url
     *
     * @method
     * @param {string}
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
            this.warnMessage = '💩 Warning: This may not be a reliable source. (' + classType + ')';
        }

        this.debug('warnMessage: ' + this.warnMessage);
    },



    /**
     * @description Flag entire site
     *
     * @method
     * @param {string}
     */
    flagSite: function () {

        'use strict';

        if (this.flagState !== 0) {
            return;
        }
        this.flagState = 1;
        this.warningMsg();
        var navs = $('nav, #nav, #navigation, #navmenu');

        if ($(navs)) {
            $(navs).first().addClass('bs-alert-shift');
        } else {
            $('body').addClass('bs-alert-shift');
        }

        if (this.dataType === 'caution') {
            $('body').prepend('<div class="bs-alert bs-warning"></div>');
        } else {
            $('body').prepend('<div class="bs-alert"></div>');
        }

        $('.bs-alert').append('<div class="bs-alert-close">✕</div>');
        $('.bs-alert').append('<p>' + this.warnMessage + '</p>');

        $('.bs-alert-close').on('click', function () {
            $(navs).first().removeClass('bs-alert-shift');
            $('body').removeClass('bs-alert-shift');
            $('.bs-alert').remove();
        });
    },



    /**
     * @description
     *
     * @method
     * @param {string}
     */
    showFlag: function () {

        'use strict';

        this.flagState = 1;
        $('.bs-alert').show();
    },



    /**
     * @description
     *
     * @method
     * @param {string}
     */
    hideFlag: function () {

        'use strict';

        this.flagState = -1;
        $('.bs-alert').hide();
    },



    /**
     * @description Get the hostname of a given link
     *
     * @method
     * @param {string}
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
     * @description Check if short link and if so, add to array
     *
     * @method
     * @param {string}
     */
    checkIfShort: function (theHost, currentElement) {

        'use strict';

        var isShort = $.map(this.shorts, function (url) {
            if (theHost === url || theHost === 'www.' + url) {
                return true;
            }
        });

        if (isShort === 'true') {
            this.shortUrls.push($(currentElement).attr('href'));
        }
    },



    /**
     * @description Target links
     *
     * @method
     * @param {string}
     */
    targetLinks: function () {

        'use strict';

        // find and label external links
        $('a[href]:not([href^="#"]),a[data-expanded-url]').each(function () {

            var
                a = new RegExp('/' + window.location.host + '/'),
                testLink = '',
                thisUrl = '';

            //this.debug('target link: ' + $(this));

            // exclude links that have the same hostname
            if (!a.test(bsd.href)) {
                $(this).attr('data-external', true);
            }

            // convert facebook urls
            if (bsd.siteId === 'facebook') {
                testLink = decodeURIComponent($(this)).substring(0, 30);

                if (testLink === 'https://l.facebook.com/l.php?u=') {
                    thisUrl = decodeURIComponent($(this)).substring(30).split('&h=', 1);
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

            //this.debug('external link: ' + this);

            if ($(this).attr('data-is-bs') !== 'true') {
                urlHost = bsd.getHost($(this));
                // checkIfShort(urlHost, this);

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
     * @method
     * @param {string}
     */
    flagIt: function ($badlinkWrapper) {

        'use strict';

        if (!$badlinkWrapper.hasClass('bs-flag')) {
            if (this.dataType === 'caution') {
                $badlinkWrapper.before('<div class="bs-alert-inline warning">' + this.warnMessage + '</div>');
            } else {
                $badlinkWrapper.before('<div class="bs-alert-inline">' + this.warnMessage + '</div>');
            }
            $badlinkWrapper.addClass('bs-flag');
        }
    },



    /**
     * @description
     *
     * @method
     * @param {string}
     */
    linkWarning: function () {

        'use strict';

        this.targetLinks();

        $('a[data-is-bs="true"]').each(function () {
            bsd.dataType = $(this).attr('data-bs-type');
            bsd.warningMsg();

            bsd.debug('bs link: ' + this);
            bsd.debug('dataType: ' + bsd.dataType);

            switch (bsd.siteId) {
            case 'facebook':
                if ($(this).parents('._1dwg').length >= 0) {
                    bsd.flagIt($(this).closest('.mtm'));
                }
                if ($(this).parents('.UFICommentContent').length >= 0) {
                    bsd.flagIt($(this).closest('.UFICommentBody'));
                }
                break;
            case 'twitter':
                if ($(this).parents('.tweet').length >= 0) {
                    bsd.flagIt($(this).closest('.js-tweet-text-container'));
                }
                break;
            case 'badlink':
            case 'none':
                break;
            default:
                // bsd.tagIt();
                break;
            }
        });

        this.firstLoad = false;
    },



    /**
     * @description
     *
     * @method
     * @param {string}
     */
    triggerMutation: function (mutations) {

        'use strict';

        var
            hasDesired = false,
            indexOuter = 0,
            indexInner = 0,
            nodes = null;

        // this.debug(mutations);
        this.debug('targetNodes: ' + this.targetNodes);

        if (arguments.length === 0) {
            this.mutationObserver.disconnect();
            this.linkWarning();

            $.each(this.targetNodes, function (id, node) {
                if (node !== null) {
                    bsd.mutationObserver.observe(node, bsd.observerConfig);
                }
            });
            return;
        } else {
            indexOuter = mutations.length;
        }

        this.mutationObserver.disconnect();

        nloop: while (indexOuter--) {
            switch (mutations[indexOuter].type) {
            case 'childList':
                nodes = mutations[indexOuter].addedNodes;
                indexInner = nodes.length;
                while (indexInner--) {
                    if (nodes[indexInner].nodeName.toLowerCase() === 'a') {
                        hasDesired = true;
                        break nloop;
                    }
                }
                break;
            case 'attributes':
                if (mutations[indexOuter].target.nodeName.toLowerCase() === 'a' && mutations[indexOuter].attributeName.toLowerCase() === 'href') {
                    hasDesired = true;
                    break nloop;
                }
                break;
            default:
                break;
            }
        }

        if (hasDesired) {
            this.targetLinks();
            this.linkWarning();
        }


        $.each(this.targetNodes, function (id, node) {
            if (node !== null) {
                bsd.mutationObserver.observe(node, bsd.observerConfig);
            }
        });
    },



    /**
     * @description Main execution script
     *
     * @method
     * @param {string}
     */
    execute: function () {

        'use strict';

        this.mutationObserver = new MutationObserver(function (mutations) {
            bsd.triggerMutation(mutations);
        });

        if (this.firstLoad === true) {
            this.identifySite();
            if (this.siteId === 'badlink') {
                this.flagSite();
            }
            this.firstLoad = false;
        }

        switch (this.siteId) {
        case 'facebook':
            this.targetNodes = [document.getElementById('mainContainer')];
            this.debug(this.targetNodes);
            $.each(this.targetNodes, function (id, node) {});
            this.observerConfig = {
                attributes: false,
                characterData: false,
                childList: true,
                subtree: true
            };
            break;
        case 'twitter':
            this.targetNodes = [document.getElementsByClassName('content-main')];
            this.observerConfig = {
                attributes: true,
                characterData: false,
                childList: true,
                subtree: true
            };
            break;
        case 'badSite':
            break;
        case 'none':
            break;
        default:
            this.targetNodes = null;
            this.observerConfig = {};
            break;
        }

        this.triggerMutation();
    }
};


var bsd = new BSDetector();


/**
 * @description Grab data from background and execute extension
 *
 * @method
 * @param {string}
 */
chrome.runtime.sendMessage(null, {'operation': 'passData'}, null, function (state) {

    'use strict';
bsd.debug('ret passData');
bsd.debug(state.sites);
bsd.debug(state.shorteners);

    bsd.data = state.sites;
    bsd.shorts = state.shorteners;

    // Data loaded, start execution.
    $(document).ready(function () {

        bsd.expandLinks = bsd.asynch.bind(null, bsd.getLinks, bsd.processLinks);
        bsd.execute();
    });
});



/**
 * @description Listen for messages but only in the top frame
 *
 * @method
 * @param {string}
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
