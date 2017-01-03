/*!
 * B.S. Detector v0.2.7 (http://bsdetector.tech)
 * Copyright 2016 The B.S. Detector Authors (https://github.com/selfagency/bs-detector/graphs/contributors)
 * Licensed under LGPL-3.0 (https://github.com/selfagency/bs-detector/blob/master/LICENSE)
 */

/* global chrome,browser,JSON,$*/
/* jslint browser: true */



/**
 * @description Expand a given set of links.
 * @method expandLinks
 * @param {string} request The set of links to expand.
 * @return {promise} A Deferred promise to allow sending after all links processed.
 */
function expandLinks(request, success) {

    'use strict';

    var links = request.shortLinks.split(',');
    // Loop over each link to expand it.
    $.each(links, function (index, url) {
        var expandThis = 'https://unshorten.me/json/' + encodeURIComponent(url);
        // Make the AJAX call to expand, and handle response after.
        xhReq(expandThis, function (response) {
            expanded.push(response);
            success();
        });
    });
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
 * @description Make the JSON call to gather data on load.
 * @method xhReq
 * @param {string} url The external URL.
 * @param {callback} callback The callback on successful response.
 */
xhReq(ext_getExtensionURL('/data/data.json'), function (file) {

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
        ext_onDomLoadAddListener(function (e) {
            var domain;
            if (e.frameId === 0) {
                ext_pageActionShow(e.tabId);
                domain = url2Domain(e.url);
                if (domain && siteList[domain]) {
                    ext_tabsSendMessage(e.tabId, {
                        operation: 'flagSite',
                        type: siteList[domain].type
                    });
                } else {
                    console.debug('no data found for domain', domain, e);
                }
            }
        }, {
            url: domainList
        });
    }
});



/**
 * @description Add listeners to be called from bs-detector.js.
 * @method ext_onRuntimeMessageAddListener
 * @param {function}
 */
ext_onRuntimeMessageAddListener(function (request, sender, sendResponse) {

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
            expandLinks(request, function () {
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
 * @description Toggle display of the warning UI when the pageAction is clicked.
 * @method ext_pageActionClickedAddListener
 * @param {function}
 */
ext_pageActionClickedAddListener(function (tab) {

    'use strict';

    ext_tabsSendMessage(tab.id, {
        operation: 'toggleFlag'
    });
});
