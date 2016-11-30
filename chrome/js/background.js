var siteList = [];
    shorts = ["✩.ws", "➡.ws", "1url.com", "adf.ly", "bc.vc", "bit.do", "bit.ly",
              "buzurl.com", "cur.lv", "cutt.us", "db.tt", "goo.gl", "ht.ly",
              "is.gd", "ity.im", "j.mp", "lnkd.in", "ow.ly", "po.st", "q.gs",
              "qr.ae", "qr.net", "scrnch.me", "t.co", "tinyurl.com", "tr.im",
              "trib.al", "tweez.me", "u.bb", "u.to", "v.gd", "vzturl.com",
              "x.co", "zip.net"];
    toExpand = [];
    expanded = [];

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
