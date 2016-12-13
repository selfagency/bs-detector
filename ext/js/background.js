
/*!
 * B.S. Detector v0.3.0 (http://bsdetector.tech)
 * Copyright 2016 The B.S. Detector Authors (https://github.com/selfagency/bs-detector/graphs/contributors)
 * Licensed under LGPL-3.0 (https://github.com/selfagency/bs-detector/blob/master/LICENSE)
 */

/* global chrome,browser,JSON,$*/
/*jslint browser: true */

var DATA_HISTORY = 'https://github.com/bs-detector/opensources/commits/master/notCredible/notCredible.json';
var JSON_DATA = 'https://raw.githubusercontent.com/bs-detector/opensources/master/notCredible/notCredible.json';

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

// Define IndexedDB. This works on all devices/browsers.
var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

/*
 * @description Get the commit history from the repo and if the commit date/time is differed,
 * download the data and store the date/time of the update
 * @method getCommitDate
 * @param {string} DATA_HISTORY - history url
 */
function getCommitDate(url, callback) {

    'use strict';

    var gcd = new XMLHttpRequest();
    gcd.overrideMimeType('html/text');
    gcd.open('GET', url, true);
    gcd.onreadystatechange = function () {
        if (gcd.readyState === 4 && gcd.status === 200) {
            callback(gcd.responseText);
        }
    };
    gcd.send(null);
}

getCommitDate(DATA_HISTORY, function (file) {
    'use strict';
    var parser = new DOMParser()
    var historyHTML = parser.parseFromString(file, "text/html");
    //console.log(historyHTML);
    var dateElement = historyHTML.getElementsByTagName("relative-time")[0];
    if(dateElement.hasAttributes()) {
        var attrs = dateElement.attributes;
        var datetime = "";
       for(var i = 0; i < attrs.length; i++) {
            if(attrs[i].name == 'datetime') {
                datetime = attrs[i].value;
            }
        }
        if(getDateTime() != datetime) {
            xhReq(JSON_DATA, function (file) {

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
            storeDateTime(datetime);  
        }
    }
});

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

/*
 * @description Store data to the local storage from the data array object
 *
 * @method storeData
 * @param {object} data
 */

function storeData(data) {
    if(data !== undefined) {
        var del = indexedDB.deleteDatabase('bsDB');
        del.onsuccess = function () {
            console.log("Deleted bsDB database successfully");
        };
        del.onerror = function () {
            console.log("Couldn't bsDB delete database");
        };
        del.onblocked = function () {
            console.log("Couldn't delete database due to the operation being blocked");
        };
        // Open (or create) the database
        var open = indexedDB.open('bsDB', 1);

        // Create the schema
        open.onupgradeneeded = function() {
            var db = open.result;

            var store = db.createObjectStore("bsStore", {keyPath: "id"});
            var index = store.createIndex("attrIndex", ["attr.language", "attr.type", "attr.notes"]);
        };

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx = db.transaction("bsStore", "readwrite");
            var store = tx.objectStore("bsStore");
            var index = store.index("attrIndex");

            // Store the data to the local storage
            for(var key in data) {
                var value = data[key];
                store.put({id: key.toLocaleLowerCase(), attr: {language: value.language, type: value.type, notes: value.notes}});
            }

            // Close the db when the transaction is done
            tx.oncomplete = function() {
                db.close();
            };
        }
    } 
}

/*
 * @description Retrieve an attribute value by a domain name
 *
 * @method getAttrData
 * @param {string} site - site domain
 * @returnType {object} attr - language, type, notes
 */
 function getAttrData(site) {
    var attr = { language: '', type: '', note: ''};
    // Open (or create) the database
    var open = indexedDB.open("bsDB", 1);

    open.onsuccess = function() {
        // Start a new transaction
        var db = open.result;
        var tx = db.transaction("bsStore", "readwrite");
        var store = tx.objectStore("bsStore");
    
        // Query the data
        var getAttr = store.get(site);

        getAttr.onsuccess = function() {
            console.log(getAttr)
            attr = getAttr.result.attr;
        };

        // Close the db when the transaction is done
        tx.oncomplete = function() {
            db.close();
        };
    }
    return attr;   
 }

 /**
  * @description Strip urls down to hostname
  *
  * @method
  * @param {string}
  */
function cleanURL(url) {

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

    url = url.toString().replace(/^(?:https?|ftp)\:\/\//i, '');
    url = url.toString().replace(/^www\./i, '');
    url = url.toString().replace(/\/.*/, '');
    return url;
}

/*
 * @description Store last committed date of data
 * @method storeDateTime
 * @param {string} datetime
 */

function storeDateTime(datetime) {
    if(datetime !== undefined) {
        // Open (or create) the database
        var open = indexedDB.open("bsUpdate", 1);

        // Create the schema
        open.onupgradeneeded = function() {
            var db = open.result;
            var store = db.createObjectStore("bsUpdateStore", {keyPath: "id"});
            var index = store.createIndex("dtIndex", ["dt.update"]);
        };

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx = db.transaction("bsUpdateStore", "readwrite");
            var store = tx.objectStore("bsUpdateStore");

            // Store the date/time to the local storage
            store.put({id: 'datetime', dt: {update: datetime}});

            // Close the db when the transaction is done
            tx.oncomplete = function() {
                db.close();
            };
        }
    } 
}

/*
 * @description Store last committed date of data
 * @method storeDateTime
 * @returnType {string}
 */

function getDateTime() {
    // Open (or create) the database
    var open = indexedDB.open("bsUpdate", 1);
    var datetime = '';

    // Create the schema
    open.onupgradeneeded = function() {
        var db = open.result;
        var store = db.createObjectStore("bsUpdateStore", {keyPath: "id"});
    };

    open.onsuccess = function() {
        // Start a new transaction
        var db = open.result;
        var tx = db.transaction("bsUpdateStore", "readwrite");
        var store = tx.objectStore("bsUpdateStore");
        // Query the data
        var getDT = store.get('datetime');

        getDT.onsuccess = function() {
            datetime = getDT.result.dt.update;
        };

        // Close the db when the transaction is done
        tx.oncomplete = function() {
            db.close();
        };

    }
    return datetime
}

