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

// Make an ajax call.
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

xhReq(browser.extension.getURL("/data/data.json"), function(file){
  siteList = JSON.parse(file);
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.operation) {
    case 'passData':
      sendResponse({sites: siteList, shorteners: shorts});
      break;
    case 'executeMain':
      sendResponse({});
      break;
  }
});
