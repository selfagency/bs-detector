/*!
 * B.S. Detector v0.2.7 (http://bsdetector.tech)
 * Copyright 2016 The B.S. Detector Authors (https://github.com/selfagency/bs-detector/graphs/contributors)
 * Licensed under LGPL-3.0 (https://github.com/selfagency/bs-detector/blob/master/LICENSE)
 */

/* global chrome,browser,JSON,$*/
/* jslint browser: true */


/**
 * If we don't have a chrome object, check for browser and rename.
 */
if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
    chrome = browser;
}



/**
 * @description Add an expanded URL response to the expanded object.
 * @method addExpanded
 * @param {string} response The response to add.
 */
function addExpanded(response) {

    'use strict';

    expanded.push(response);
}



/**
 * @description Expand a given link.
 * @method expandLink
 * @param {string} index The DOM object
 * @param {string} url The url to expand.
 */
 function expandLink(url) {

    'use strict';

    var expandThis = 'https://unshorten.me/json/' + encodeURIComponent(url);
    xhReq(expandThis, addExpanded);
}



/**
 * @description Expand a given set of links.
 * @method expandLinks
 * @param {string} request The set of links to expand.
 */
 function expandLinks(request) {

    'use strict';

    toExpand = request.shortLinks.split(',');
    $.each(expandLink);
}

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
 * @description Make the JSON call to expand a link.
 * @method xhReq
 * @param {string} url The external URL.
 * @param {callback} callback The callback on successful response.
 */
xhReq(chrome.extension.getURL('/data/data.json'), function (file) {

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

    if (domainList.length > 0) {
        chrome.webNavigation.onDOMContentLoaded.addListener(function (e) {
            var domain;
            if (e.frameId === 0) {
                chrome.pageAction.show(e.tabId);
                domain = url2Domain(e.url);
                if(domain && siteList[domain]) {
                  chrome.tabs.sendMessage(e.tabId, {
                      operation: 'flagSite',
                      type: siteList[domain].type
                  });
                } else {
                  console.debug('no data found for domain', domain, e);
                }
            }
        }, {
            url: domainList,
            type: domainList.type
        });
    }
});



/**
 * @description Add listeners to be called from bs-detector.js.
 * @method chrome.runtime.onMessage.addListener
 * @param {function}
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    'use strict';

    switch (request.operation) {
    case 'passData':
        sendResponse({
            sites: siteList,
            shorteners: shorts
        });
        break;
    case 'expandLink':
        expandLinks(request);
        sendResponse({
            expandedLinks: expanded
        });
        break;
    }
});



/**
 * @description Toggle display of the warning UI when the pageAction is clicked.
 * @method chrome.pageAction.onClicked.addListener
 * @param {function}
 */
 chrome.pageAction.onClicked.addListener(function (tab) {

    'use strict';

    chrome.tabs.sendMessage(tab.id, {
        operation: 'toggleFlag'
    });
});
