/*!
 * B.S. Detector v0.2.7 (http://bsdetector.tech)
 * Copyright 2016 The B.S. Detector Authors (https://github.com/selfagency/bs-detector/graphs/contributors)
 * Licensed under LGPL-3.0 (https://github.com/selfagency/bs-detector/blob/master/LICENSE)
 */

/**
 * Utility functions to support using webextensions.
 * To be included by Gulp when building to the Firefix platform.
 * See: https://developer.mozilla.org/en-US/Add-ons/WebExtensions
 */

function ext_getExtensionURL(string path) {
    return browser.extension.getURL(path);
}

function ext_pageActionShow(integer tabId) {
    return browser.pageAction.show(tabId);
}

function ext_pageActionClickedAddListener(function callback) {
    return browser.pageAction.onClicked.addListener(callback);
}

function ext_runtimeSendMessage(string extensionId, any message, object options, function responseCallback) {
    return browser.runtime.sendMessage(extensionId, message, options, responseCallback);
}

function ext_onRuntimeMessageAddListener(function callback) {
    return browser.runtime.onMessage.addListener(callback);
}

function ext_tabsSendMessage(integer tabId, any message, object options, function responseCallback) {
    return browser.tabs.sendMessage(tabId, message, options, responseCallback);
}

function ext_onDomLoadAddListener(function callback, object filter) {
    return browser.webNavigation.onDOMContentLoaded.addListener(callback, filter);
}
