var siteList = [];
var shorts = [
  'bit.do',
  't.co',
  'lnkd.in',
  'db.tt',
  'qr.ae',
  'adf.ly',
  'goo.gl',
  'bit.ly',
  'cur.lv',
  'tinyurl.com',
  'ow.ly',
  'ht.ly',
  'ity.im',
  'q.gs',
  'is.gd',
  'po.st',
  'bc.vc',
  'u.to',
  'j.mp',
  'buzurl.com',
  'cutt.us',
  'u.bb',
  'x.co',
  'scrnch.me',
  'vzturl.com',
  'qr.net',
  '1url.com',
  'tweez.me',
  'v.gd',
  'tr.im',
  'trib.al',
  'zip.net',
  '➡.ws',
  '✩.ws'
];
var toExpand = [];
var expanded = [];

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
