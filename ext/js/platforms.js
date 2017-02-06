var platforms = {
    none: {
        itemSelectors: [],
        observer: {
            root: '',
            filter: []
        },
        externalLinkPattern: null,
        cleanurl: function (url) {
            'use strict';
            return url;
        }
    },

    facebook: {
        itemSelectors: [{
            parent: '._1dwg',
            body: '.mtm'
        }, {
            parent: '.UFICommentContent',
            body: '.UFICommentBody'
        }],
        observer: {
            root: 'body',
            filter: [{ element: 'div' }]
        },
        externalLinkPattern: new RegExp(/^https?:\/\/l\.facebook\.com\/l\.php\?u=([^&]+)/),
        cleanurl: function (url) {

            'use strict';

            var
                testLink = '',
                thisUrl = '';

            testLink = decodeURIComponent(url).substring(0, 30);

            if (testLink === 'https://l.facebook.com/l.php?u=' || testLink === 'http://l.facebook.com/l.php?u=') {
                thisUrl = decodeURIComponent(url).substring(30).split('&h=', 1);
                url = thisUrl;
            }

            return url;
        }
    },

    twitter: {
        itemSelectors: [{
            parent: '.tweet',
            body: '.js-tweet-text-container'
        }],
        observer: {
            root: 'div#page-container',
            filter: [{ element: 'div' }]
        },
        externalLinkPattern: null,
        cleanurl: function (url) {
            'use strict';
            return url;
        }
    }
};


/**
 * @description Platform class constructor with variable initialisation
 *
 * @method Platform
 */
function Platform(platformUrl) {

    'use strict';

    var
        name = '',
        config = {},
        url = platformUrl;


    switch (url) {
        case 'www.facebook.com':
        case 'facebook.com':
            this.name = 'facebook';
            break;
        case 'twitter.com':
            this.name = 'twitter';
            break;
        default:
            this.name = 'none';
            break;
    }

    this.config = platforms[this.name];

    return this;
}



Platform.prototype = {

    constructor: Platform,


    /**
     * @description Strip urls down to hostname
     *
     * @method cleanUrl
     * @param {string} url
     * @return {string}
     */
    cleanUrl: function (url) {

        'use strict';

        var
            cleanedUrl = '',
            fn = platforms[this.name].cleanurl;

        if (typeof fn === 'function') {
            cleanedUrl = fn(url);
        } else {
            cleanedUrl = url;
        }

        return url2Domain(cleanedUrl);
    },

    /**
     * @description Extract and expand external links from platform urls
     *
     * @method expandExternalLinks
     * @param {object} element
     * @param {string} url
     * @return {void}
     */
    expandExternalLinks: function ($element, url) {

        'use strict';

        var
            matches = null,
            matchedUrl = null;

        if (this.config.externalLinkPattern !== null) {
            if (matches = this.config.externalLinkPattern.exec(url)) {
                matchedUrl = decodeURIComponent(matches[1]);

                if (matchedUrl !== null) {
                    $element.attr('data-external', true);
                    $element.attr('data-expanded-url', matchedUrl);
                }
            }
        }
    }

};
