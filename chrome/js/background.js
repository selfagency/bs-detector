var siteList = [];
    shorts = ["✩.ws", "➡.ws", "1url.com", "adf.ly", "bc.vc", "bit.do", "bit.ly",
              "buzurl.com", "cur.lv", "cutt.us", "db.tt", "goo.gl", "ht.ly",
              "is.gd", "ity.im", "j.mp", "lnkd.in", "ow.ly", "po.st", "q.gs",
              "qr.ae", "qr.net", "scrnch.me", "t.co", "tinyurl.com", "tr.im",
              "trib.al", "tweez.me", "u.bb", "u.to", "v.gd", "vzturl.com",
              "x.co", "zip.net"];
    toExpand = [];
    expanded = [];
    dataType = '';

function xhReq(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('application/json');
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status == '200') {
        callback(xhr.responseText);
    }
  }
  xhr.send(null);
}

xhReq(chrome.extension.getURL("/data/data.json"), function(file){
  siteList = JSON.parse(file);
  // listen for loading of hosts in the siteList as soon as its populated
  var domain,
    domainList = [],
    domainRE = new RegExp(/^[^\s\/\.\?\#]+(\.[^\s\/\.\?\#]+)+$/); // yuck

  for(domain in siteList){
    if(domainRE.test(domain)){
      domainList.push({hostSuffix: domain.toLocaleLowerCase()});
    }
  }
  if(domainList.length > 0){
    chrome.webNavigation.onDOMContentLoaded.addListener(
      function(e){
        if(e.frameId == 0){
          chrome.pageAction.show(e.tabId);
          chrome.tabs.sendMessage(e.tabId, {operation: 'flagSite', type: type});
        }
      },
      { url: domainList, type: domainList.type }
    );
  }
});

function addExpanded(response) {
  expanded.push(response);
  // console.log('api response: ' + response);
}

function expandLink(index, url) {
  // console.log('url to expand: ' + url);
  var expandThis = 'https://unshorten.me/json/' + encodeURIComponent(url);
  // console.log('api call: ' + expandThis)
  xhReq(expandThis, addExpanded);
}

function expandLinks(request) {
  toExpand = request.shortLinks.split(',');
  // console.log('incoming data: ' + toExpand);
  $.each(toExpand, expandLink);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.operation) {
    case 'passData':
      sendResponse({sites: siteList, shorteners: shorts});
      break;
    case 'expandLink':
      expandLinks(request);
      sendResponse({expandedLinks: expanded});
      break;
  }
});

// toggle display of the warning UI when the pageAction is clicked
chrome.pageAction.onClicked.addListener(
  function(tab){
    chrome.tabs.sendMessage(tab.id, {operation: 'toggleFlag'});
  }
);
