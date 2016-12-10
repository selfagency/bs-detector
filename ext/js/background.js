/*!
 * B.S. Detector v0.2.7 (http://bsdetector.tech)
 * Copyright 2016 The B.S. Detector Authors (https://github.com/selfagency/bs-detector/graphs/contributors)
 * Licensed under LGPL-3.0 (https://github.com/selfagency/bs-detector/blob/master/LICENSE)
 */

/* global chrome,browser,JSON,$*/
/*jslint browser: true */


// If we don't have a browser object, check for chrome.
if (typeof chrome === 'undefined' && typeof browser !== 'undefined') {
    chrome = browser;
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



function xhReq(url, callback) {

    'use strict';

    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(xhr.responseText);
        }
    };
    xhr.send(null);
}



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
                if(domain && siteList[domain]){
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



function addExpanded(response) {

    'use strict';

    expanded.push(response);
    // console.log('api response: ' + response);
}



function expandLink(index, url) {

    'use strict';

    // console.log('url to expand: ' + url);
    var expandThis = 'https://unshorten.me/json/' + encodeURIComponent(url);
    // console.log('api call: ' + expandThis)
    xhReq(expandThis, addExpanded);
}



function expandLinks(request) {

    'use strict';

    toExpand = request.shortLinks.split(',');
    // console.log('incoming data: ' + toExpand);
    $.each(toExpand, expandLink);
}



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



// toggle display of the warning UI when the pageAction is clicked
chrome.pageAction.onClicked.addListener(function (tab) {

    'use strict';

    chrome.tabs.sendMessage(tab.id, {
        operation: 'toggleFlag'
    });
});
