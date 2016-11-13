/*!
* FooBar - The Unobtrusive Notification Bar That Doesn’t Suck!
* http://bit.ly/getfoobar
*
* Copyright 2011, Steven Usher & Brad Vincent
* http://themergency.com
* http://themergency.com/foobar-a-jquery-notification-plugin/
*
* Date: 8 October 2011
* Version : 2.1
*/

(function ($) {

  window.foobar = window.$foobar = $.foobar = function() { // $.foobar the main constructor for the plugin
    return fb.init.apply(this, arguments);
  };

  $.foobarGoogleCallback = function() { // this is the function called once the google api has been loaded into the page
    fb.googleApi.load.feeds();
  };

  var defaults={

    "height": {
      "bar": 30, // The height of the foobar in pixels
      "button": 30 // The height of the button in pixels, when the foobar is collapsed
    },

    "width": {
      "left": "*", // The width for the left section of the bar
      "center": "50%", // The width for the center section of the bar
      "right": "*", // The width for the right section of the bar
      "button": "80px" // The width for the button section of the bar
    },

    "position": {
      "ignoreOffsetMargin": false, // Forces the foobar to render itself at the top of the page
      "bar": "top", // How the foobar is positioned within the page (inline | top | bottom)
      "button": "right", // Position of the close / open button (left | right | hidden)
      "social": "left" // Position of the social links (left | right | hidden)
    },

    "display": {
      "type": "expanded", // The initial state of the foobar (expanded, collapsed, delayed, onscroll)
      "delay": 0, // Used in conjunction with the "delayed" and "onscroll" display values to determine the amount of time to wait before showing the foobar
      "speed": 250, // The speed at which to scroll the foobar into view
      "backgroundColor": "#6c9e00", // The CSS background color of the foobar
      "border": "solid 3px #FFF", // The CSS border styling for the bottom of the foobar
      "button": {
        "type": "toggle", // The type of action to perform when the close button is clicked.
        "spacer": true, // Whether or not to create another block the same size as the button on the opposite side of the foobar to ensure the messages remain centered.
        "backgroundColor": null, // The CSS background color of the button, if null inherits the bars display.backgroundColor value.
        "border": null // The CSS border styling for the bottom of the bar, if null inherits the bars display.border value.
      },
      "theme": {
        "bar": "triangle-arrow", // The theme used for the arrow buttons that are shown in the foobar
        "navigation": null // The theme used for the navigation buttons, if left null will inherit from bar
      }, 
      "easing": "swing", // The type of easing used when expanding or collapsing the foobar
      "shadow": true, // Sets whether to display the shadow below the foobar and close button
      "adjustPageHeight": true, // Sets whether or not the page height is adjusted to accommodate for the foobar so page content is not hidden when scrolled
      "rtl": false // Sets whether to configure the bar for RTL languages. If true messages are scrolled from right to left and the social text is displayed to the right of the icons.
    },

    "cookie": {
      "enabled": false, // Whether or not the state of the foobar is stored in a client-side cookie (open or closed)
      "name": "foobar-state", // The name of the cookie as it is stored on the client machine
      "duration": 1, // The number of days the client side cookie remains active
      "version": 1 // If the user cookie version is not the same as the one provided the plugin will ignore any set cookie and force a reshow of the foobar, it then creates a new cookie with the new version so the message will be shown just once.
    },

    "messages": [], // The messages to display in the foobar, if only 1 message it will be displayed permanently otherwise the message.delay value is used to cycle through the array.
    "message": {
      "delay": 4000, // The delay between switching of messages if more than 1 is supplied
      "fadeDelay": 300, // The time it takes to transition to the next message
      "random": false, // Sets whether or not to randomly select messages to be displayed
      "navigation": false, // Sets whether or not to display the prev & next arrows when 2 or more messages are being displayed
      "cssClass": null, // The CSS class to apply to the messages
      "scroll": {
        "enabled": true, // Sets whether or not to allow extra length messages to be scrolled into view
        "speed": 50, // The pixels per second to scroll extra length messages into view
        "delay": 2000 // The delay between initially displaying a long message and the beginning of scrolling it
      },
      "font": {
        "family": "Verdana", // The font family used for the messages
        "size": "10pt", // The font size used for the messages
        "color": "White", // The font color used for the messages
        "decoration": null, // The text decoration used for the messages
        "shadow": null, // The shadow applied to the font used for messages (only supported by browsers that support CSS3)
        "weight": null // The font weight used for the messages
      },
      "aFont": {
        "family": "Verdana", // The font family of any links in the messages
        "size": "10pt", // The font size of any links in the messages
        "color": "LightYellow", // The font color of any links in the messages
        "decoration": "underline", // The text decoration of any links in the messages
        "shadow": null, // The shadow applied to the font of any links in the messages (only supported by browsers that support CSS3)
        "weight": null, // The font weight of any links in the messages
        "hover": {
          "family": null, // The font family of any links in the messages when they are hovered over
          "size": null, // The font size of any links in the messages when they are hovered over
          "color": null, // The font color of any links in the messages when they are hovered over
          "decoration": null, // The text decoration of any links in the messages when they are hovered over
          "shadow": null, // The shadow applied to the font of any links in the messages when they are hovered over (only supported by browsers that support CSS3)
          "weight": null // The font weight of any links in the messages when they are hovered over
        }
      }
    },

    "rightHtml": null, // Custom HTML that is displayed in the right section of the bar
    "leftHtml": null, // Custom HTML that is displayed in the left section of the bar

    "social": {
      "text": "Follow us", // The text displayed in the social area
      "cssClass": null, // The CSS class to apply to the social links
      "font": {
        "family": "Verdana", // The font family of the text in the social area
        "size": "10pt", // The font size of the text in the social area
        "color": "White", // The font color of the text in the social area
        "decoration": null, // The text decoration of the text in the social area
        "shadow": null, // The shadow applied to the font of the text in the social area (only supported by browsers that support CSS3)
        "weight": null // The font weight of the text in the social area
      },
      "profiles": []
    },

    "rss": {
      "enabled": false, // If messages can be populated using an RSS feed
      "url": null, // The URL to the RSS feed
      "maxResults": 5, //The maximum number of RSS feed results to display as messages
      "linkText": "Read More", // The text displayed for the link back to the original post
      "linkTarget": "_blank" // The target for rss links (_blank | _self | _parent | _top | 'frameName')
    },

    "twitter": {
      "enabled": false, // If tweets can be loaded
      "user": null, // the user whose tweets you want to show
      "maxTweets": 5 // max number of tweets to fetch
    },
    
    "events": {
      "expanding": null,
      "collapsing": null,
      "setExpanded": null,
      "setCollapsed": null,
      "preRender": null,
      "postRender": null
    }
  };

  var fb = {
    settings: { },

    elements: { // The jQuery objects used to build the foobar
      main: {
        wrapper: null,
        shadow: null,
        container: null,
        row: null
      },
      left: {
        container: null,
        inner: null
      },
      center: {
        container: null,
        inner: null
      },
      right: {
        container: null,
        inner: null
      },
      message: null,
      open: {
        button: null,
        container: null
      },
      close: {
        button: null,
        container: null,
        spacer: null
      },
      prev: null,
      next: null
    },

    _internals: {
      state: {
        firstrun: true, // Whether or not this is the first time the foobar has been rendered.
        initialized: false, // Whether or not the foobar has been initialized (created and appended to the DOM)
        open: false, // Whether or not the foobar is expanded or collapsed
        top: false, // Whether or not the foobar is positioned top (inline | top) or bottom
        busy: false // Whether or not the foobar is busy expanding or collapsing itself or performing any other uninterruptible actions
      },
      offsetMargin: 0, // The calculated margin offset to apply to the HTML to adjust the page height when expanding collapsing the bar
      actualHeight: 0, // The calculated height of the bar including the shadow, padding and margin
      shadowHeight: 5, // Sets the additional height added to the bar to allow for the shadow. When the shadow is disabled this is set to 0.
      tabShadowHeight: 11 // Sets the additional height added to the open button to allow for the shadow.
    },

    utils: {
      isNotNullOrEmpty: function(value) {
        /// <summary>Checks if the supplied <paramref name="value"/> is a string and is not null or empty.</summary>
        /// <param name="value">The value to check.</param>
        return (typeof value == 'string' && value !== null && value !== '');
      },

      preventDefault: function(obj) {
        /// <summary>Basic check if the supplied <paramref name="obj"/> has the preventDefault function and executes it if it does.</summary>
        /// <param name="obj">The obj to check.</param>
        if (typeof obj != 'undefined' && obj !== null && typeof obj.preventDefault == 'function') {
          obj.preventDefault();
        }
      },

      applyFont: function(elements, font) {
        /// <summary>Applies the supplied <paramref name="font"/> to the jQuery array of <paramref name="elements"/>.</summary>
        /// <param name="elements">The jQuery array of elements to apply the font to.</param>
        /// <param name="font">The font to apply.</param>
        var def = { 'family': null, 'size': null, 'color': null, 'decoration': null, 'shadow': null }; // default template for fonts
        var f = $.extend({ }, def, font);
        if (fb.utils.isNotNullOrEmpty(f.family)) { elements.css('font-family', f.family); }
        if (fb.utils.isNotNullOrEmpty(f.size)) { elements.css('font-size', f.size); }
        if (fb.utils.isNotNullOrEmpty(f.color)) { elements.css('color', f.color); }
        if (fb.utils.isNotNullOrEmpty(f.decoration)) { elements.css('text-decoration', f.decoration); }
        if (fb.utils.isNotNullOrEmpty(f.shadow)) { elements.css('text-shadow', f.shadow); }
        if (fb.utils.isNotNullOrEmpty(f.weight)) { elements.css('font-weight', f.weight); }
      },

      setCookie: function(expanded) {
        /// <summary>Sets the foobar cookie to the supplied <paramref name="expanded"/> state.</summary>
        /// <param name="expanded">Whether the foobar is expanded or not.</param>
        var expires = '';
        if (fb.settings.cookie.duration) {
          var date = new Date();
          date.setTime(date.getTime() + (fb.settings.cookie.duration * 24 * 60 * 60 * 1000));
          expires = '; expires=' + date.toGMTString();
        }
        document.cookie = fb.settings.cookie.name + '=' + expanded + '|' + fb.settings.cookie.version + expires + '; path=/';
      },

      getCookie: function() {
        /// <summary>Gets the foobar cookie and returns it's value.</summary>
        var nameEq = fb.settings.cookie.name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEq) === 0) return fb.utils.parse.cookie(c.substring(nameEq.length, c.length));
        }
        return null;
      },

      deleteCookie: function() {
        /// <summary>Deletes the foobar cookie.</summary>
        var date = new Date();
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));
        document.cookie = fb.settings.cookie.name + '=; expires=' + date.toGMTString() + '; path=/';
      },

      formatTweetHtml: function(tweet) {
        /// <summary>Formats the tweet body text. See http://www.dustindiaz.com/basement/ify.html for more info.</summary>
        //if we are dealing with content from a twitter RSS feed then strip out the screen name
        var tweetPrefix = fb.settings.twitter.user + ': ';
        if (tweet.indexOf(tweetPrefix) === 0) {
          tweet = tweet.substring(tweetPrefix.length);
        }
        tweet = ' ' + tweet;

        // The tweets arrive as plain text, so we replace all the textual URLs with hyperlinks
        tweet = tweet.replace( /\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g , function(link, m1, m2, m3, m4) {
          var http = m2.match( /w/ ) ? 'http://' : '';
          return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + m1 + '</a>' + m4;
        });

        // Replace the mentions
        tweet = tweet.replace( /\B[@＠]([a-zA-Z0-9_]{1,20})/g , function(m, username) {
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
        });

        // Replace the lists
        tweet = tweet.replace( /\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g , function(m, userlist) {
          return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
        });

        // Replace the hashtags
        tweet = tweet.replace( /(^|\s+)#(\w+)/gi , function(m, before, hash) {
          return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
        });

        return tweet;
      },

      raise: function(handler) {
        /// <summary>Invokes the supplied handler function passing through any additional arguments to the handler.</summary>
        /// <param name="handler">The function to invoke.</param>
        try {
          if ($.isFunction(handler)) {
            var args = Array.prototype.slice.call(arguments); // convert the arguments object into an array
            args.shift(); // shift once to remove the handler itself
            handler.apply(fb, args);
          }
        }
        catch(err) {
          console.error(err);
        }
      },
      
      parse: {
        cookie: function(value) {
          /// <summary>Parses the cookie info from the supplied string <paramref name="value"/>.</summary>
          /// <param name="value">The cookie value to parse.</param>
          /// <remarks>Due to the changes in 2.0 to allow a developer to force a cookie reset the value returned requires some parsing so as to handle both the old and new structures.</remarks>
          if (typeof value === 'string') {
            if (value.indexOf('|') == -1) { // old cookie type - pre 2.0 release
              return {
                expanded: fb.utils.parse.bool(value, false),
                version: -1
              };
            } else {
              var parts = value.split('|');
              if (parts.length == 2) {
                return {
                  expanded: fb.utils.parse.bool(parts[0], false),
                  version: fb.utils.parse.integer(parts[1], -1)
                };
              }
            }
          }
          return null;
        },

        bool: function(value, def) {
          /// <summary>Parse the supplied string <paramref name="value"/> and return either the resulting boolean value or the supplied <paramref name="def"/> value if parsing fails.</summary>
          /// <param name="str">The string to parse.</param>
          /// <param name="def">The default value to return if parsing fails.</param>
          def = def || false;
          switch (typeof value) {
            case 'string':
              {
                switch (value.toLowerCase()) {
                  case '1': case 'true': return true;
                  case '0': case 'false': return false;
                  default: return def;
                }
              }
            case 'number':
              {
                switch (value) {
                  case 1: return true;
                  case 0: return false;
                  default: return def;
                }
              }
            case 'boolean': return value;
            default: return def;
          }
        },

        integer: function(value, def) {
          /// <summary>Parse the supplied string <paramref name="value"/> and return either the resulting integer value or the supplied <paramref name="def"/> value if parsing fails.</summary>
          /// <param name="str">The string to parse.</param>
          /// <param name="def">The default value to return if parsing fails.</param>
          def = def || null;
          switch(typeof value) {
            case 'string':
              {
                var result = parseInt(value);
                return isNaN(result) ? def : result;
              }
            case 'number': return value;
            default: return def;
          }
        },

        html: function(html) {
          /// <summary>Parse the supplied <paramref name="html"/> string to see if elements from the dom must be included.</summary>
          /// <param name="html">The HTML string to parse.</param>
          if (!fb.utils.isNotNullOrEmpty(html)) { return html; }
          if (html && html.match('{{include:(.*?)}}')) { //check if the html contains the keyword "{{include:}}"
            var regEx = new RegExp('{{include:(.*?)}}');
            var match = regEx.exec(html);
            while (match !== null) { //get the element's html
              var matchedHtml = $(match[1]).html();
              html = html.replace(match[0], matchedHtml);
              match = regEx.exec(html);
            }
          }
          return html;
        },

        width: function(value) {
          /// <summary>Parse the supplied <paramref name="value"/> and return a width object ready to be applied using jQuery's .css method.</summary>
          /// <param name="value">The value to parse.</param>
          return (typeof value != 'undefined' && value != null && value != "*" && value != "100%") ? { 'width': value } : { 'width': 'auto' };
        },
        
        borderWidth: function(value, def) {
          /// <summary>Parse the supplied border <paramref name="value"/> and return the width.</summary>
          /// <param name="value">The value to parse.</param>
          /// <param name="def">The default value to return if parsing fails.</param>
          var $tmp = $('<div></div>').css({ 'border': value, 'position': 'absolute', 'visibility': 'hidden' }).appendTo('body');
          var w = fb.utils.parse.integer($tmp.css('border-top-width'), def);
          $tmp.remove();
          return w;
        }
      },

      checks: {
        isMultipart: function(name, seperator) {
          /// <summary>Determine whether or not the specified <paramref name="name"/> is a multipart property name (basically just checking if the name contains the <paramref name="seperator"/>).</summary>
          /// <param name="name">The string to check.</param>
          /// <param name="seperator">The seperator string.</param>
          return (typeof name != 'undefined' && name !== null && name.length > 0 && name.indexOf(seperator) != -1);
        },
        
        hasProperties: function(obj) {
          /// <summary>Checks if the supplied <paramref name="obj"/> has any of its own properties, i.e. non inherited properties.</summary>
          /// <param name="obj">The object to check for properties.</param>
          if (typeof obj !== 'object') { return false; }
          for(var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              return true;
            }
          }
          return false;
        },
        
        isArray: function(obj) {
          /// <summary>Checks if the supplied <paramref name="obj"/> is an array.</summary>
          /// <param name="obj">The object to check.</param>
          return Object.prototype.toString.call(obj) === "[object Array]";
        }
      },
    
      property: {

        get: function(obj, name) {
          /// <summary>Gets the value of the property specified by the <paramref name="name"/> from the supplied <paramref name="obj"/>.</summary>
          /// <param name="obj">The object to retrieve the property value from.</param>
          /// <param name="name">The name of the property to get. (Child properties delimited with a period [.])</param>
          try {
            if (fb.utils.checks.isMultipart(name, '.')) {
              var propName = name.substring(0, name.indexOf('.'));
              var remainder = name.substring(name.indexOf('.') + 1);
              obj[propName] = obj[propName] || { };
              return fb.utils.property.get(obj[propName], remainder);
            }
            return obj[name];
          } catch(err) {
            console.error(err);
            return null;
          }
        },

        set: function(obj, name, value) {
          /// <summary>Sets the value of the property specified by the <paramref name="name"/> on the supplied <paramref name="obj"/>.</summary>
          /// <param name="obj">The object to set the property value on.</param>
          /// <param name="name">The name of the property to set. (Child properties delimited with a period [.])</param>
          try {
            if (fb.utils.checks.isMultipart(name, '.')) {
              var propName = name.substring(0, name.indexOf('.'));
              var remainder = name.substring(name.indexOf('.') + 1);
              obj[propName] = obj[propName] || { };
              fb.utils.property.set(obj[propName], remainder, value);
            } else {
              obj[name] = value;
            }
          } catch(err) {
            console.error(err);
          }
        },

        merge: function(base, changes) {
          /// <summary>Wrote this as jQuery.extend merges arrays by index rather than overwriting them. This will not merge nested arrays.</summary>
          /// <param name="base">The base object to merge the <paramref name="changes"/> into.</param>
          /// <param name="changes">The object containing the changes to merge into the <paramref name="base"/> object.</param>
          try {
            for (var prop in changes) {
              if (changes.hasOwnProperty(prop)) {
                if (fb.utils.checks.hasProperties(changes[prop]) && !fb.utils.checks.isArray(changes[prop])) {
                  base[prop] = base[prop] || { };
                  fb.utils.property.merge(base[prop], changes[prop]);
                } else if (fb.utils.checks.isArray(changes[prop])) {
                  base[prop] = []; // decided to use jquery's extend to clone arrays to avoid ref issues with objects
                  $.extend(true, base[prop], changes[prop]);
                } else {
                  base[prop] = changes[prop];
                }
              }
            }
          } catch(err) {
            console.error(err);
          }
        }
      }
    },

    messageLoop: {
      id: null,
      paused: false,
      sizes: [],
      
      index: { // Holds the current message loop indexes
        current: -1,
        next: 0,
        
        _random: function() {
          /// <summary>Gets a random message index to be displayed. This will return a random index between 0 and the maximum messages array index.</summary>
          if (fb.settings.messages.length <= 1) { return 0; }
          var from = 0, to = fb.settings.messages.length - 1;
          var random = Math.floor(Math.random() * (to - from + 1) + from);
          // Recursively get an index until it's not the same as the current index.
          return (random == fb.messageLoop.index.current) ? fb.messageLoop.index._random() : random;
        },
        
        _setCurrent: function() {
          /// <summary>Set the current index to the previous loops next value otherwise if random is enabled and multiple messages are available randomly pick one.</summary>
          if (fb.settings.message.random && fb.messageLoop.index.current == -1 && fb.settings.messages.length > 1) {
            fb.messageLoop.index.current = fb.messageLoop.index._random();
          } else {
            fb.messageLoop.index.current = fb.messageLoop.index.next;
          }
        },
        
        _setNext: function() {
          /// <summary>Increment the next index by one or set it back to 0 otherwise if random is enabled and multiple messages are available randomly pick one.</summary>
          if (fb.settings.message.random && fb.settings.messages.length > 1) {
            fb.messageLoop.index.next = fb.messageLoop.index._random();
          } else if (fb.messageLoop.index.next >= (fb.settings.messages.length - 1)) {
            fb.messageLoop.index.next = 0;
          } else {
            fb.messageLoop.index.next++;
          }
        }
      },
      
      create: function() {
        /// <summary>Creates the actual html for the messages for the bar and binds the various events.</summary>
        if ($('.foobar-message-wrapper').length !== fb.settings.messages.length || fb.messageLoop.sizes.length != fb.settings.messages.length) {
          fb.elements.message.empty();
          //first thing we do is append the messages to the dom to calculate their true widths
          for (var mi = 0; mi < fb.settings.messages.length; mi++) {
            var $msg = $('<div></div>')
              .attr('id', 'foobar-message-' + mi).addClass('foobar-message-wrapper')
              .css({ 'position': 'absolute', 'display': 'inline-block', 'visibility': 'hidden' })
              .html(fb.utils.parse.html(fb.settings.messages[mi]));
            
            fb.elements.message.append($msg); //append it to the dom
            fb.messageLoop._style($msg);
            fb.messageLoop.sizes[mi] = { 'width': $msg.width(), 'height': $msg.height() };
          }
        }
        fb.elements.message.children().hide();

        fb.elements.center.container.unbind('mouseenter mouseleave');
        fb.elements.prev.add(fb.elements.next).unbind('click');
        if (fb.settings.messages.length > 1) {
          fb.elements.center.container.hover(fb.messageLoop.pause, fb.messageLoop.resume);
          fb.elements.prev.click(fb.messageLoop.prev);
          fb.elements.next.click(fb.messageLoop.next);
        }
      },
      
      start: function(force) {
        /// <summary>This method now controls all aspects of displaying messages including the side scrolling animation.</summary>
        /// <param name="force">Whether or not to force the start. If forced any currently displayed messages or animations will be stopped/cleared immediately and the new index displayed.</param>
        force = force || false;
        if (!fb._internals.state.open || fb.settings.messages.length === 0 || fb.messageLoop.index.current == fb.messageLoop.index.next) { return; }
        if (!force && fb.messageLoop.paused) {
          fb.messageLoop.id = setTimeout(fb.messageLoop.start, fb.settings.message.delay);
          return;
        }
        fb.messageLoop.stop();
        fb.messageLoop.index._setCurrent();
        fb.messageLoop.create();

        //get the current bar and message sizes
        var cWidth = fb.elements.center.container.width();
        var mWidth = fb.messageLoop.sizes[fb.messageLoop.index.current].width;
        var mHeight = fb.messageLoop.sizes[fb.messageLoop.index.current].height;

        //get the current message and show it
        $('#foobar-message-' + fb.messageLoop.index.current)
          .css({
              'position': 'static', 'display': 'inline-block', 'visibility': 'visible', 'opacity': 100,
              'margin-left': 0, 'width': mWidth, 'min-height': mHeight, 'max-height': fb.settings.height.bar
            });

        fb.elements.message.css({ 'min-height': mHeight, 'max-height': fb.settings.height.bar }); //force the height

        fb.messageLoop.index._setNext();

        if (mWidth > cWidth) { //we need to scroll the message
          fb.messageLoop._scroll((mWidth - cWidth), force);
        } else if (fb.messageLoop.index.next != fb.messageLoop.index.current) { //we need to proceed to the next message
          fb.messageLoop.id = setTimeout(function() { fb.messageLoop._fade(force); }, fb.settings.message.delay);
        }
      },

      stop: function() {
        /// <summary>Stops the message loop</summary>
        if (typeof fb.messageLoop.id != 'undefined' && fb.messageLoop.id !== null) {
          clearTimeout(fb.messageLoop.id);
        }
        $('#foobar-message-' + fb.messageLoop.index.current).stop(false, false).css('margin-left', 0);
        fb.messageLoop.id = null;
      },

      pause: function() {
        /// <summary>Pauses the message loop</summary>
        if (fb.settings.message.navigation && !fb.messageLoop.paused) {
          fb.elements.prev.add(fb.elements.next).stop(false, true).fadeIn('fast');
        }
        fb.messageLoop.paused = true;
      },

      resume: function() {
        /// <summary>Resumes the message loop</summary>
        if (fb.settings.message.navigation && fb.messageLoop.paused) {
          fb.elements.prev.add(fb.elements.next).stop(false, true).fadeOut('fast');
        }
        fb.messageLoop.paused = false;
      },

      next: function() {
        /// <summary>Displays the next message in the loop. If the current message is the last the first will be displayed.</summary>
        if (fb.settings.messages.length > 1) {
          fb.messageLoop.stop();
          $('#foobar-message-' + fb.messageLoop.index.current).stop(false, false).css('margin-left', 0);
          var index = (fb.messageLoop.index.current + 1);
          index = (index <= (fb.settings.messages.length - 1)) ? index : 0;
          fb.messageLoop.index.next = index;
          fb.messageLoop.start(true);
        }
      },

      prev: function() {
        /// <summary>Displays the previous message in the loop. If the current message is the first the last will be displayed.</summary>
        if (fb.settings.messages.length > 1) {
          fb.messageLoop.stop();
          $('#foobar-message-' + fb.messageLoop.index.current).stop(false, false).css('margin-left', 0);
          var index = (fb.messageLoop.index.current - 1);
          index = (index >= 0) ? index : (fb.settings.messages.length - 1);
          fb.messageLoop.index.next = index;
          fb.messageLoop.start(true);
        }
      },

      _scroll: function(diff, force) {
        /// <summary>Scrolls the current message by the specified <paramref name="diff"/>.</summary>
        /// <param name="diff">The amount the message needs to be scrolled.</param>
        /// <param name="force">Whether or not to force the _reset. If forced any currently displayed messages or animations will be stopped/cleared immediately and the new index displayed.</param>
        var $message = $('#foobar-message-' + fb.messageLoop.index.current).css('margin-left', (fb.settings.display.rtl ? -(diff) : 0));
        if (fb.settings.message.scroll.enabled) {
          var speed = Math.round(diff / fb.settings.message.scroll.speed) * 1000; //how fast will it scroll
          var animation = { 'margin-left': (fb.settings.display.rtl ? 0 : -(diff)) };
          $message.delay(fb.settings.message.scroll.delay).animate(animation, speed, 'linear', function() {
            if (fb.messageLoop.index.next == fb.messageLoop.index.current) { //delay and then reset
              fb.messageLoop.id = setTimeout(function() { fb.messageLoop._reset(force); }, fb.settings.message.delay);
            } else { //delay and then continue with the message cycling
              fb.messageLoop.id = setTimeout(function() { fb.messageLoop._fade(force); }, fb.settings.message.delay);
            }
          });
        }
      },
      
      _reset: function(force) {
        /// <summary>Resets the message loop back to its starting values</summary>
        /// <param name="force">Whether or not to force the _reset. If forced any currently displayed messages or animations will be stopped/cleared immediately and the new index displayed.</param>
        force = force || false;
        if (fb.messageLoop.paused) { //pause if the user is hovering on the message
          fb.messageLoop.id = setTimeout(function() { fb.messageLoop._reset(force); }, fb.settings.message.delay);
          return;
        }
        //set the message back to its starting position
        $('#foobar-message-' + fb.messageLoop.index.current).stop(false, false).css('margin-left', 0);
        fb.messageLoop.index.current = -1; //reset the current index so it will cycle again
        fb.messageLoop.start(force);
      },

      _fade: function(force) {
        /// <summary>Fades out the current message and resets it back to its starting values</summary>
        /// <param name="force">Whether or not to force the _fade. If forced any currently displayed messages or animations will be stopped/cleared immediately and the new index displayed.</param>
        force = force || false;
        if (fb.messageLoop.paused) {
          fb.messageLoop.id = setTimeout(function() { fb.messageLoop._fade(force); }, fb.settings.message.delay);
          return;
        }

        //fade the current message out
        $('#foobar-message-' + fb.messageLoop.index.current).animate({ 'opacity': 0 }, fb.settings.message.fadeDelay, function() {
          fb.messageLoop.start(force);
        });
      },

      _style: function(message) {
        /// <summary>Applies either the message class or inline styles to the message.</summary>
        /// <param name="message">The message to apply the styles to.</param>
        if (fb.utils.isNotNullOrEmpty(fb.settings.message.cssClass)) {
          message.addClass(fb.settings.message.cssClass);
        } else {
          fb.utils.applyFont(message, fb.settings.message.font);
          var $a = message.find('a');
          fb.utils.applyFont($a, fb.settings.message.aFont);
          $a.unbind('mouseenter mouseleave').bind({
              mouseenter: function() { fb.utils.applyFont($(this), fb.settings.message.aFont.hover); },
              mouseleave: function() { fb.utils.applyFont($(this), fb.settings.message.aFont); }
            });
        }
      }
    },

    googleApi: {
      check: {
        core: function() {
          /// <summary>Checks if the Google API is loaded</summary>
          return (typeof google != 'undefined');
        },

        feeds: function() {
          /// <summary>Checks if the Google Feeds API is loaded</summary>
          return (fb.googleApi.check.core() && typeof google.feeds != 'undefined');
        }
      },

      load: {
        core: function() {
          /// <summary>Loads the Google API</summary>
          $('<script></script>')
            .attr('type', 'text/javascript')
            .attr('src', 'http://www.google.com/jsapi?callback=jQuery.foobarGoogleCallback')
            .appendTo('head');
        },

        feeds: function() {
          /// <summary>Loads the Google Feeds API</summary>
          google.load('feeds', '1', { 'callback': fb.googleApi.fetch.messages });
        }
      },

      fetch: {
        messages: function() {
          /// <summary>Loads the feeds or tweets, or both</summary>
          if (fb.settings.twitter.enabled && fb.utils.isNotNullOrEmpty(fb.settings.twitter.user)) {
            fb.googleApi.fetch.twitter(); // Handle the tweets for the bar
          }
          if (fb.settings.rss.enabled && fb.utils.isNotNullOrEmpty(fb.settings.rss.url)) {
            fb.googleApi.fetch.rss(); // Handle the rss for the bar
          }
        },

        twitter: function() {
          /// <summary>loads the tweets content and appends it to the messages array</summary>
          var twitterRssUrl = 'http://api.twitter.com/1/statuses/user_timeline.rss?trim_user=0&screen_name=' + fb.settings.twitter.user;
          var feed = new google.feeds.Feed(twitterRssUrl);
          feed.setNumEntries(fb.settings.twitter.maxTweets);
          feed.load(function(result) {
            fb.messageLoop.stop();

            if (!result.error) {
              for (var i = 0; i < result.feed.entries.length; i++) {
                var tweet = fb.utils.formatTweetHtml(result.feed.entries[i].title);
                fb.settings.messages.push(tweet);
              }
            } else { console.error(result.error.message); }

            fb.elements.message.stop(false, true).css({ 'left': 0, 'opacity': 100 });
            fb.messageLoop.start(true);
          });
        },

        rss: function() {
          /// <summary>loads the rss feeds content and appends it to the messages array</summary>
          var feed = new google.feeds.Feed(fb.settings.rss.url);
          feed.setNumEntries(fb.settings.rss.maxResults);
          feed.load(function(result) {
            fb.messageLoop.stop();

            if (!result.error) {
              for (var i = 0; i < result.feed.entries.length; i++) {
                var msg = result.feed.entries[i].title;
                if (fb.utils.isNotNullOrEmpty(fb.settings.rss.linkText)) {
                  msg += ' <a href="' + result.feed.entries[i].link + '" target="' + fb.settings.rss.linkTarget + '">' + fb.settings.rss.linkText + '</a>';
                }
                fb.settings.messages.push(msg);
              }
            } else { console.error(result.error.message); }

            fb.elements.message.stop(false, true).css({ 'left': 0, 'opacity': 100 });
            fb.messageLoop.start(true);
          });
        }
      }
    },

    init: function(arg1, arg2, arg3) {
      /// <summary>This function handles any arguments passed to the foobar constructor.</summary>
      if (typeof arg1 === 'string') {
        // if just a string is passed into the constructor it can be either an action to execute or a single message.
        switch (arg1) {
        case 'open': fb.expand(null); break;
        case 'close': fb.collapse(null); break;
        case 'toggle': fb.toggle(); break;
        case 'destroy': fb.destroy(); break;
        case 'prev': fb.messageLoop.prev(); break;
        case 'next': fb.messageLoop.next(); break;
        case 'start': fb.messageLoop.start(); break;
        case 'stop': fb.messageLoop.stop(); break;
        case 'option':
          {
            switch (arguments.length) {
            case 3: // 3 args = set option ('option', '[OPTION_NAME]', OPTION_VALUE)
              fb.option.set(arg2, arg3);
              break;
            case 2: // 2 args = get option ('option', '[OPTION_NAME]') or set multiple options ('option', options)
              {
                if (typeof arg2 === 'string') {
                  return fb.option.get(arg2);
                }
                fb.option.set(arg2, null);
              }
            }
            break;
          }
        default:
          fb.render($.extend(true, { }, defaults, { 'messages': [arg1] }));
          break;
        }
      } else { // extend the default options with the user provided options and apply them to the bar
        fb.render($.extend(true, { }, defaults, arg1));
      }
      return false;
    },

    create: function() {
      /// <summary>Creates the initial foobar jQuery elements setting the various fb.elements properties as it goes</summary>
      if ($('.foobar-wrapper').length === 0) { // if the foobar doesn't exist create it
        fb.elements.main.wrapper = $('<div></div>').addClass('foobar-wrapper');
        fb.elements.main.container = $('<table></table>').attr({ 'cellpadding': 0, 'cellspacing': 0 }).addClass('foobar-container');
        fb.elements.main.row = $('<tr></tr>').addClass('foobar-container-row');
        fb.elements.main.shadow = $('<div></div>').addClass('foobar-shadow');
        fb.elements.left.container = $('<td></td>').addClass('foobar-container-left');
        fb.elements.left.inner = $('<div></div>').addClass('foobar-container-inner');
        fb.elements.center.container = $('<td></td>').addClass('foobar-container-center');
        fb.elements.center.inner = $('<div></div>').addClass('foobar-container-inner');
        fb.elements.right.container = $('<td></td>').addClass('foobar-container-right');
        fb.elements.right.inner = $('<div></div>').addClass('foobar-container-inner');
        fb.elements.prev = $('<div></div>').addClass('foobar-prev-button');
        fb.elements.next = $('<div></div>').addClass('foobar-next-button');
        fb.elements.message = $('<div></div>').addClass('foobar-message');
        fb.elements.close.spacer = $('<td></td>').addClass('foobar-close-button-spacer');
        fb.elements.close.container = $('<td></td>').addClass('foobar-close-button-container');
        fb.elements.close.button = $('<span></span>').addClass('foobar-close-button');
        fb.elements.open.container = $('<div></div>').addClass('foobar-open-button-container');
        fb.elements.open.button = $('<span></span>').addClass('foobar-open-button');

        // append the initialized bar elements to the DOM
        fb.elements.main.wrapper.append(fb.elements.main.container.append(fb.elements.main.row)).append(fb.elements.main.shadow).append(fb.elements.open.container);
        fb.elements.main.row
          .append(fb.elements.left.container.append(fb.elements.left.inner))
          .append(fb.elements.center.container.append(fb.elements.center.inner.append(fb.elements.message).append(fb.elements.prev).append(fb.elements.next)))
          .append(fb.elements.right.container.append(fb.elements.right.inner))
          .append(fb.elements.close.container);
        fb.elements.close.container.append(fb.elements.close.button);
        fb.elements.open.container.append(fb.elements.open.button);
        $('body').prepend(fb.elements.main.wrapper);
      } else { // else get the already existing elements
        fb.elements.main.wrapper = $('.foobar-wrapper');
        fb.elements.main.container = $('.foobar-container');
        fb.elements.main.row = $('.foobar-container-row');
        fb.elements.main.shadow = $('.foobar-shadow');
        fb.elements.left.container = $('.foobar-container-left');
        fb.elements.left.inner = $('.foobar-container-left .foobar-container-inner');
        fb.elements.center.container = $('.foobar-container-center');
        fb.elements.center.inner = $('.foobar-container-center .foobar-container-inner');
        fb.elements.right.container = $('.foobar-container-right');
        fb.elements.right.inner = $('.foobar-container-right .foobar-container-inner');
        fb.elements.prev = $('.foobar-prev-button');
        fb.elements.next = $('.foobar-next-button');
        fb.elements.message = $('.foobar-message');
        fb.elements.close.spacer = $('.foobar-close-button-spacer');
        fb.elements.close.container = $('.foobar-close-button-container');
        fb.elements.close.button = $('.foobar-close-button');
        fb.elements.open.container = $('.foobar-open-button-container');
        fb.elements.open.button = $('.foobar-open-button');
      }
      fb._internals.state.initialized = true;
    },

    _render: {
      allow: function() {
        // check the cookie and button type to determine whether or not to allow rendering
        var cookie = fb.utils.getCookie();
        if (cookie != null && cookie.version == fb.settings.cookie.version 
            && fb.settings.cookie.enabled && !cookie.expanded 
              && fb.settings.display.button.type == 'close') {
          fb.destroy();
          return false;
        } else if (cookie != null && cookie.version != fb.settings.cookie.version 
            && fb.settings.cookie.enabled && !cookie.expanded 
              && fb.settings.display.button.type == 'close') {
          fb.utils.deleteCookie();
        }
        return true;
      },
    
      init: function() {
        fb._internals.state.top = fb.settings.position.bar != 'bottom';
        if (!fb._internals.state.initialized) {
          // Calc the current HTML elements margin to determine where to render the bar (This looks for anything like the WP admin bar which alters the margin top CSS value)
          fb._internals.offsetMargin = fb.utils.parse.integer($('html').css(fb._internals.state.top ? 'margin-top' : 'margin-bottom'), 0);
          fb._internals.offsetMargin = fb.settings.position.ignoreOffsetMargin ? 0 : fb._internals.offsetMargin;
          fb.create();
        } else { //clear the sides
          fb.elements.left.inner.add(fb.elements.right.inner).empty();
        }
        
        if (fb.settings.display.button.type=='close') {
          fb.elements.open.container.addClass('hidden');
        } else {
          fb.elements.open.container.removeClass('hidden');
        }
      
        fb.elements.main.container.show();
      },
      
      theme: function() {
        // apply the css classes for the theme
        if (fb.settings.display.theme.navigation == null) {
          fb.settings.display.theme.navigation = fb.settings.display.theme.bar;
        }
        fb.elements.main.wrapper.removeClass().addClass(fb.settings.display.theme.bar).addClass('foobar-wrapper');
        fb.elements.prev.removeClass().addClass(fb.settings.display.theme.navigation).addClass('foobar-prev-button');
        fb.elements.next.removeClass().addClass(fb.settings.display.theme.navigation).addClass('foobar-next-button');
      },
      
      backgroundColor: function() {
        // set the background color of the bar and button
        if (fb.settings.display.button.backgroundColor == null) {
          fb.settings.display.button.backgroundColor = fb.settings.display.backgroundColor;
        }
        fb.elements.main.container.add(fb.elements.prev).add(fb.elements.next).add(fb.elements.open.button).css({ 'background-color': fb.settings.display.backgroundColor });
        fb.elements.open.button.css({ 'background-color': fb.settings.display.button.backgroundColor });
      },
      
      shadow: function() {
        // display the shadow or not
        if (fb.settings.display.shadow) { fb.elements.main.wrapper.addClass('shadow'); }
        else { fb.elements.main.wrapper.removeClass('shadow'); }
        fb._internals.shadowHeight = fb.elements.main.shadow.height();
      },
      
      border: function() {
        // set the border for the bar
        if (fb.settings.display.button.border == null) {
          fb.settings.display.button.border = fb.settings.display.border;
        }
        fb.elements.main.container.css('border', 'none')
          .css(fb._internals.state.top ? 'border-bottom' : 'border-top', fb.settings.display.border);
        
        fb.elements.open.button.css('border', fb.settings.display.button.border)
          .css((fb._internals.state.top ? 'border-top' : 'border-bottom'), 'none');
      },
      
      height: function() {
        // set the height for all the bar elements
        fb.elements.open.container.height(fb.settings.height.button + fb._internals.tabShadowHeight);
        fb.elements.open.button.height(fb.settings.height.button);
        fb.elements.main.container.add(fb.elements.close.button).add(fb.elements.prev).add(fb.elements.next)
          .add(fb.elements.left.container).add(fb.elements.center.container).add(fb.elements.right.container).height(fb.settings.height.bar);
        fb.elements.left.inner.add(fb.elements.center.inner).add(fb.elements.right.inner).css('max-height', fb.settings.height.bar);

        var borderWidth = fb.utils.parse.borderWidth(fb.settings.display.border, 0);

        fb._internals.actualHeight = fb.settings.height.bar + fb._internals.shadowHeight + borderWidth;
        fb.elements.main.wrapper.height(fb._internals.actualHeight);
        fb.elements.prev.add(fb.elements.next).css('margin-top', -(fb.settings.height.bar / 2));
      },
      
      position: function() {
        // Apply the correct css to the bar
        fb.elements.main.wrapper.removeClass('inline top bottom').addClass(fb.settings.position.bar);
        if (!fb._internals.state.top) {
          fb.elements.main.container.before(fb.elements.main.shadow);
        } else {
          fb.elements.main.container.after(fb.elements.main.shadow);
        }
        
        // set the offsetMargin of the bar and div that contains the open button
        fb.elements.main.wrapper
          .add(fb.elements.open.container)
          .css((fb._internals.state.top ? 'bottom' : 'top'), 'auto')
          .css((fb._internals.state.top ? 'top' : 'bottom'), (fb.settings.position.bar == 'inline') ? 0 : fb._internals.offsetMargin);

        var borderWidth = fb.utils.parse.borderWidth(fb.settings.display.button.border, 0);
        var marginLeft = -((fb.elements.open.button.width() / 2) + borderWidth);
        fb.elements.open.button.css('margin-left', marginLeft);

        // Set the position of the close button setting the widths as we go
        fb.elements.close.spacer.detach();
        fb.elements.left.container.css(fb.utils.parse.width(fb.settings.width.left));
        fb.elements.center.container.css(fb.utils.parse.width(fb.settings.width.center));
        fb.elements.right.container.css(fb.utils.parse.width(fb.settings.width.right));
        fb.elements.close.container.add(fb.elements.close.spacer).add(fb.elements.open.container).css(fb.utils.parse.width(fb.settings.width.button));

        if (fb.settings.position.button == 'right') {
          if (fb.settings.display.button.spacer) { fb.elements.close.spacer.insertBefore(fb.elements.center.container); }
          fb.elements.close.container.insertAfter(fb.elements.right.container).show();
          fb.elements.open.container.css({ 'left': 'auto', 'right': '0px' }).show();
        } else if (fb.settings.position.button == 'left') {
          if (fb.settings.display.button.spacer) { fb.elements.close.spacer.insertAfter(fb.elements.center.container); }
          fb.elements.close.container.insertBefore(fb.elements.left.container).show();
          fb.elements.open.container.css({ 'right': 'auto', 'left': '0px' }).show();
        } else {
          fb.elements.close.container.hide();
          fb.elements.open.container.hide();
        }
      },
      
      social: function() {
        // Create and position the social bar
        if (fb.settings.position.social == 'left' || fb.settings.position.social == 'right') {
          if (fb.settings.social.profiles.length > 0) {
            var $social = $('.foobar-social').length > 0 ? $('.foobar-social') : $('<ul></ul>').addClass('foobar-social');
            $social.empty();

            if (fb.utils.isNotNullOrEmpty(fb.settings.social.text)) {
              var $text = $('<li></li>').addClass('foobar-social-text').text(fb.settings.social.text).css({ 'height': fb.settings.height.bar, 'line-height': fb.settings.height.bar+'px' });
              if (fb.utils.isNotNullOrEmpty(fb.settings.social.cssClass)) {
                $text.addClass(fb.settings.social.cssClass);
              } else {
                fb.utils.applyFont($text, fb.settings.social.font);
              }
              $social.append($text);
            }

            var def = { 'name': null, 'url': null, 'image': null, 'target': '_blank' }; // default template for social profiles
            $.each(fb.settings.social.profiles, function(i, p) {
              var profile = $.extend({ }, def, p);
              if (profile.name !== null && profile.url !== null && profile.image !== null) {
                var $a = $('<a></a>').attr('href', profile.url).attr('title', profile.name).attr('target', profile.target)
                  .css({ 'background': "url('" + profile.image + "') no-repeat center center", 'height': fb.settings.height.bar });

                $social.append($('<li></li>').css({ 'height': fb.settings.height.bar }).append($a));
              }
            });

            if (fb.settings.position.social == 'right') {
              $social.css('float', 'right');
              fb.elements.right.inner.append($social);
            } else if (fb.settings.position.social == 'left') {
              $social.css('float', 'left');
              fb.elements.left.inner.append($social);
            }
            $social.children('li').css({
              'float': (fb.settings.display.rtl ? 'right' : 'left'),
              'text-align': (fb.settings.display.rtl ? 'right' : 'left')
            });
          } else { $('.foobar-social').remove(); }
        } else { $('.foobar-social').remove(); }
      },
      
      customHtml: function() {
        if (fb.utils.isNotNullOrEmpty(fb.settings.rightHtml)) {
          fb.elements.right.inner.append(fb.utils.parse.html(fb.settings.rightHtml)); //add custom HTML to the right bar
        }
        if (fb.utils.isNotNullOrEmpty(fb.settings.leftHtml)) {
          fb.elements.left.inner.append(fb.utils.parse.html(fb.settings.leftHtml)); //add custom HTML to the left bar
        }
      },
      
      cookie: function() {
        var cookie = fb.utils.getCookie();
        if (cookie === null || cookie.version != fb.settings.cookie.version || !fb.settings.cookie.enabled) {
          if (!fb.settings.cookie.enabled || (cookie !== null && cookie.version != fb.settings.cookie.version)) { fb.utils.deleteCookie(); }
          switch (fb.settings.display.type) {
            case 'onscroll':
              fb.setCollapsed();
              $(window).one('scroll', function() { setTimeout(fb.expand, fb.settings.display.delay); });
              break;
            case 'delayed':
              fb.setCollapsed();
              setTimeout(fb.expand, fb.settings.display.delay);
              break;
            case 'collapsed':
              fb.setCollapsed();
              break;
            case 'expanded':
            default:
              fb.setExpanded();
              break;
          }
        } else {
          cookie.expanded ? fb.setExpanded() : fb.setCollapsed();
        }
      },
      
      finalise: function() {
        if (fb.settings.display.button.type == 'close') {
          fb.elements.open.button.unbind().hide();
          fb.elements.close.button.unbind().click(function(e) {
            fb.collapse(e, fb.destroy);
          });
        } else {
          fb.elements.open.button.unbind().click(fb.expand);
          fb.elements.close.button.unbind().click(fb.collapse); 
        }

        //finally, setup the messages, starting with clearing any previously created messages and resetting the messageLoop properties to there default.
        $('.foobar-message-wrapper').remove();
        fb.messageLoop.paused = false;
        fb.messageLoop.index.next = 0;
        fb.messageLoop.index.current = -1;

        var handleMessages = true, handleFeeds = false;
        // Handle the tweets for the bar
        if (fb.settings.twitter.enabled && fb.utils.isNotNullOrEmpty(fb.settings.twitter.user)) {
          handleMessages = false;
          if (fb.googleApi.check.core() && fb.googleApi.check.feeds()) {
            fb.googleApi.fetch.twitter();
          } else {
            handleFeeds = true;
          }
        }
        // Handle the rss for the bar
        if (fb.settings.rss.enabled && fb.utils.isNotNullOrEmpty(fb.settings.rss.url)) {
          handleMessages = false;
          if (fb.googleApi.check.core() && fb.googleApi.check.feeds()) {
            fb.googleApi.fetch.rss();
          } else {
            handleFeeds = true;
          }
        }

        if (handleFeeds) {
          if (fb.googleApi.check.feeds()) {
            fb.googleApi.load.feeds();
          } else {
            fb.googleApi.load.core();
          }
        }

        if (handleMessages) {
          fb.elements.message.stop(true, false).css('opacity', 100);
          fb.messageLoop.start();
        }

        fb._internals.state.firstrun = false;
        
        //Hack for IE8 table rendering issues, basically the browser does not re-render the table after a cell has been removed so the remaining cells do not expand to full the gap.
        var ua = $.browser;
        if (ua.msie && parseInt(ua.version) == 8) {
          var display = fb.elements.main.container.css('display');
          fb.elements.main.container.css({ 'visibility': 'hidden', 'display': 'inline-table' });
          fb.elements.main.shadow.css('visibility', 'hidden');
          setTimeout(function() {
            fb.elements.main.container.css({ 'visibility': 'visible', 'display': display });
            fb.elements.main.shadow.css('visibility', 'visible');
          }, 0);
        }
      }
    },
    
    render: function(settings) {
      /// <summary>The heart of the plugin, this function takes all the settings into account and applies them to the foobar</summary>
      /// <param name="settings">The combined user and default settings</param>
      fb.settings = settings; // Store it, love it, use it
      if (fb._render.allow()) {
	      //raise preRender event
	      fb.utils.raise(fb.settings.events.preRender, fb.settings);
        fb._render.init();
        fb._render.theme();
        fb._render.backgroundColor();
        fb._render.shadow();
        fb._render.border();
        fb._render.height();
        fb._render.position();
        fb._render.social();
        fb._render.customHtml();
        fb._render.cookie();
        fb._render.finalise();
	      //raise postRender event
	      fb.utils.raise(fb.settings.events.postRender, fb.settings);
      }
    },

    destroy: function() {
      /// <summary>Removes the entire bar from a page resetting it to how it was</summary>
      if (!fb._internals.state.initialized) { return; }
      if (fb.settings.display.adjustPageHeight) {
        var css = { 'margin-top': 0, 'margin-bottom': 0 };
        if (fb.settings.position.bar != 'inline') {
          css[(fb._internals.state.top ? 'margin-top' : 'margin-bottom')] = (fb._internals.offsetMargin <= 0) ? 0 : (fb._internals.offsetMargin - fb.settings.height.bar);
        } else {
          css[(fb._internals.state.top ? 'margin-top' : 'margin-bottom')] = fb._internals.offsetMargin;
        }
        $('html').css(css);
      }
      fb.elements.main.wrapper.remove();
      fb._internals.state.initialized = false;
    },

    toggle: function() {
      /// <summary>Toggles the foobar (either expands or collapses) using the animation settings</summary>
      if (!fb._internals.state.initialized) { return; }
      if (fb._internals.state.open) { fb.collapse(null); }
      else { fb.expand(null); }
    },

    expand: function(e) {
      /// <summary>Expands the foobar using the animation settings</summary>
      /// <param name="e">If used as an event handler the first parameter passed through is the event arguments</param>
      fb.utils.preventDefault(e);
      if (!fb._internals.state.initialized || fb._internals.state.open || fb._internals.state.busy) { return; }
      fb._internals.state.busy = true;

      fb.elements.open.button.stop(false, true).animate({ 'height': 0 }, fb.settings.display.speed);
      fb.elements.open.container.stop(false, true).animate({ 'height': 0 }, fb.settings.display.speed, function() {
        
        if (fb.settings.display.adjustPageHeight) {
          var css = { };
          if (fb.settings.position.bar != 'inline') {
            css[(fb._internals.state.top ? 'margin-bottom' : 'margin-top')] = 0;
            var animation = { };
            animation[(fb._internals.state.top ? 'margin-top' : 'margin-bottom')] = '+=' + fb.settings.height.bar;
            $('html').css(css).stop(false, true).animate(animation, fb.settings.display.speed);
          } else {
            css[(fb._internals.state.top ? 'margin-bottom' : 'margin-top')] = 0;
            css[(fb._internals.state.top ? 'margin-top' : 'margin-bottom')] = fb._internals.offsetMargin;
            $('html').css(css);
          }
        }
        fb.utils.raise(fb.settings.events.expanding, fb.settings);

        fb.elements.main.container.show();
        fb.elements.main.wrapper.stop(false, true).animate({ 'height': fb._internals.actualHeight }, fb.settings.display.speed, fb.settings.display.easing, function() {
          fb.elements.main.wrapper.focus();
          fb._internals.state.open = true;
          fb.messageLoop.start(true);
          fb._internals.state.busy = false;
        });
      });
      if (fb.settings.cookie.enabled) { fb.utils.setCookie(true); }
    },

    collapse: function(e, callback) {
      /// <summary>Collapses the foobar using the animation settings</summary>
      /// <param name="e">If used as an event handler the first parameter passed through is the event arguments</param>
      fb.utils.preventDefault(e);
      if (!fb._internals.state.initialized || !fb._internals.state.open || fb._internals.state.busy) { return; }
      fb._internals.state.busy = true;

      fb.messageLoop.stop();
      
      if (fb.settings.display.adjustPageHeight) {
        var css = { };
        if (fb.settings.position.bar != 'inline') {
          css[(fb._internals.state.top ? 'margin-bottom' : 'margin-top')] = 0;
          var animation = { };
          animation[(fb._internals.state.top ? 'margin-top' : 'margin-bottom')] = '-=' + fb.settings.height.bar;
          $('html').css(css).stop(false, true).animate(animation, fb.settings.display.speed);
        } else {
          css[(fb._internals.state.top ? 'margin-bottom' : 'margin-top')] = 0;
          css[(fb._internals.state.top ? 'margin-top' : 'margin-bottom')] = fb._internals.offsetMargin;
          $('html').css(css);
        }
      }
      fb.utils.raise(fb.settings.events.collapsing, fb.settings);

      fb.elements.main.wrapper.stop(false, true).animate({ 'height': fb._internals.shadowHeight }, fb.settings.display.speed, function() {
        fb.elements.main.container.hide();
        fb.elements.open.container.stop(false, true).animate({ 'height': fb.settings.height.button + fb._internals.tabShadowHeight }, fb.settings.display.speed, fb.settings.display.easing);
        fb.elements.open.button.stop(false, true).animate({ 'height': fb.settings.height.button }, fb.settings.display.speed, fb.settings.display.easing, function() {
          if ($.isFunction(callback)) { callback.call(); }
          fb._internals.state.busy = false;
        });
      });
      fb._internals.state.open = false;
      if (fb.settings.cookie.enabled) { fb.utils.setCookie(false); }
    },

    setExpanded: function() {
      /// <summary>Sets the bar to the expanded state, no animations occur when using this function</summary>
      if (!fb._internals.state.initialized || fb._internals.state.busy) { return; }
      
      fb.elements.main.wrapper.height(fb._internals.actualHeight);
      fb.elements.main.container.show();
      fb.elements.open.container.add(fb.elements.open.button).height(0);

      if (fb.settings.display.adjustPageHeight && fb.settings.position.bar != 'inline') {
        var css = { 'margin-top': 0, 'margin-bottom': 0 };
        css[(fb._internals.state.top ? 'margin-top' : 'margin-bottom')] = (fb._internals.offsetMargin <= 0) ? fb.settings.height.bar : (fb._internals.offsetMargin + fb.settings.height.bar);
        $('html').css(css);
      }
      if (fb._internals.state.firstrun || !fb._internals.state.open) { fb.utils.raise(fb.settings.events.setExpanded, fb.settings); }
      fb._internals.state.open = true;
      if (fb.settings.cookie.enabled) { fb.utils.setCookie(true); }
    },

    setCollapsed: function() {
      /// <summary>Sets the bar to the collapsed state, no animations occur when using this function</summary>
      if (!fb._internals.state.initialized || fb._internals.state.busy) { return; }
      
      fb.elements.main.wrapper.height(fb._internals.shadowHeight);
      fb.elements.main.container.hide();
      fb.elements.open.container.height(fb.settings.height.button + fb._internals.tabShadowHeight);
      fb.elements.open.button.height(fb.settings.height.button);

      if (fb.settings.display.adjustPageHeight && fb.settings.position.bar != 'inline') {
        var css = { 'margin-top': 0, 'margin-bottom': 0 };
        css[(fb._internals.state.top ? 'margin-top' : 'margin-bottom')] = fb._internals.offsetMargin;
        $('html').css(css);
      }
      if (fb._internals.state.firstrun || fb._internals.state.open) { fb.utils.raise(fb.settings.events.setCollapsed, fb.settings); }
      fb._internals.state.open = false;
      if (fb.settings.cookie.enabled) { fb.utils.setCookie(false); }
    },

    option: {
      get: function(name) {
        /// <summary>Gets any bar option value using the supplied property name.</summary>
        /// <param name="name">The property name to get.</param>
        return fb.utils.property.get(fb.settings, name);
      },
      set: function(name, value) {
        /// <summary>Sets any option for the bar and forces a redraw. If the first parameter supplied is an object its properties will be merged into the current settings object.</summary>
        /// <param name="name">The property name to set or an object containing the options.</param>
        /// <param name="value">The value to set for the property.</param>
        if (typeof name === 'string') { // Handle the normal setting of one option ('optionName', value)
          fb.utils.property.set(fb.settings, name, value);
        } else { // Otherwise extend the base settings with the object supplied
          fb.utils.property.merge(fb.settings, name);
        }
        fb.render(fb.settings); // then render
      }
    }
  };

})(jQuery);

// Declare the google variable but do not set a value. This will not overwrite the google variable if it is already set...
var google;

/* This block of code is here to enable more detailed debugging options without having to worry about browser support, this will only create the objects and functions if they do not exist... */
var console;
if(!window.console) { console={}; }
console.log=console.log||function () { };
console.warn=console.warn||function () { };
console.error=console.error||function () { };
console.info=console.info||function () { };

var JSON;
if(!JSON) { JSON={}; }
JSON.stringify=JSON.stringify||function () { };
/* End debug helpers */