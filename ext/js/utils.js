/*!
 * B.S. Detector v0.2.7 (http://bsdetector.tech)
 * Copyright 2016 The B.S. Detector Authors (https://github.com/selfagency/bs-detector/graphs/contributors)
 * Licensed under LGPL-3.0 (https://github.com/selfagency/bs-detector/blob/master/LICENSE)
 */

/**
 * Utility functions needed by the front and backends of the extension
 */

/**
 * @description Cleanup a url to get the domain out of it.
 * @method url2Domain
 * @param {string} url The URL to cleanup.
 */
function url2Domain(url) {

    'use strict';

    if (url) {
        url = url.toString().replace(/^(?:https?|ftp)\:\/\//i, '');
        url = url.toString().replace(/^www\./i, '');
        url = url.toString().replace(/\/.*/, '');
        return url;
    }
}

/**
 * @description Makes an external JSON GET call, and executes a callback response.
 * @method xhReq
 * @param {string} url The external URL.
 * @param {callback} callback The callback on successful response.
 */
function xhReq(url, success, failure) {

    'use strict';

    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        // Once done loading.
        if (xhr.readyState === 4) {
            // Call the right feedback based on response.
            if (xhr.status === 200 && success) {
                success(xhr.responseText);
            } else if (failure) {
                failure(xhr.responseText);
            }
        }
    };
    xhr.send(null);
}
