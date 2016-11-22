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
  'zip.net',
  '➡.ws',
  '✩.ws'
];
var expandedLinks = {};

function readFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType('application/json');
    rawFile.open('GET', file, true);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status == '200') {
          callback(rawFile.responseText);
      }
    }
    rawFile.send(null);
}

readFile(chrome.extension.getURL("/data/data.json"), function(file){
  siteList = JSON.parse(file);
});

function checkLink(url, callback) {
  var xhr = new XMLHttpRequest();
  getLink = 'http://urlex.org/json/' + url;
  xhr.open('GET', getLink, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status == '200') {
      callback(xhr.responseText);
    }
  }
  xhr.send(null);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.operation) {
    case 'passData':
      sendResponse({sites: siteList, shorteners: shorts});
      break;
    case 'expandLink':
      checkLink(request.shortLink, function(response) {
        expandedLinks = response;
      });
      sendResponse({expandedLinks: expandedLinks});
      break;
  }
});
