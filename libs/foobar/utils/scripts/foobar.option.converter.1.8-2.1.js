var foc = {
  _mappings: {},
  _fixes: {},
  convert: function( options18 ) {
    if ( typeof options18 === 'string' ){ return options18; }
    foc._fixes = foc.fixes();
    foc._mappings = foc.mappings();
    var options20 = {};
    foc.options.parse( options18, '', options20 );
    return options20;
  },
  path: {
    add: function( path, value ){
      if ( path === null || path == 'undefined' || path.length == 0 ){
        path = value;
      } else {
        path += '.' + value;
      }
      return path;
    },

    remove: function( path ){
      if ( path === null || path == 'undefined' || path.length == 0 || path.lastIndexOf( '.' ) == -1 ){
        path = '';
      } else if ( path.lastIndexOf( '.' ) != -1 ){
        path = path.substring( 0, path.lastIndexOf( '.' ) );
      }
      return path;
    },

    multipart: function( path ){
      return (typeof path != 'undefined' && path !== null && path.length > 0 && path.indexOf('.') != -1);
    }
  },
  options: {
    parse: function( options18, path, options20 ){
      try {
        var hadOwnProperties = false;
        for (var prop in options18) {
          if (options18.hasOwnProperty(prop)){
            path = foc.path.add( path, prop );
            hadOwnProperties = true;
            var propValue = options18[prop];
            var isArray = Object.prototype.toString.call(propValue) === "[object Array]";
            if (typeof propValue === 'object' && propValue !== null && !isArray && !foc.options.parse( propValue, path, options20 )){
              foc.path.remove( path );
            } else if (typeof propValue !== 'object' || propValue === null || isArray) {
              var newPath = foc._mappings[path];
              if (typeof newPath == 'undefined' ) {
                console.warn('UNKNOWN OPTION: ', { 'name': path });
              } else if (newPath == null) {
                console.info('REMOVED OPTION: ', { 'name': path });
              } else {
                console.log('FOUND OPTION: ', { 'oldName': path, 'newName': newPath });
                foc.options._set( options20, newPath, newPath, propValue );
              }
            }
            path = foc.path.remove( path );
          }
        }
        return hadOwnProperties;
      } catch(err) {
        console.error(err);
      }
      return false;
    },
    _set: function( obj, path, root, value ){
      try {
        if ( foc.path.multipart( path ) ){
          var first = path.substring( 0, path.indexOf( '.' ) );
          var remainder = path.substring( path.indexOf( '.' ) + 1 );
          obj[ first ] = obj[ first ] || {};
          foc.options._set( obj[ first ], remainder, root, value );
        } else {
          var checked = foc.options._fix(root, value);
          obj[ path ] = checked;
          var opt = { };
          opt[root] = checked;
          console.log('SET OPTION: ', opt);
        }
      } catch(err) {
        console.error(err);
      }
    },
    _fix: function( path, value ){
      if (foc._fixes[path] && typeof foc._fixes[path] === 'function') {
        return foc._fixes[path](value);
      }
      return value;
    }
  },
  mappings: function(){
    var map = {};
    // Height
    map[ 'height' ] = 'height.bar';
    map[ 'collapsedButtonHeight' ] = 'height.button';

    // Width
    map[ 'leftWidth' ] = 'width.left';
    map[ 'centerWidth' ] = 'width.center';
    map[ 'rightWidth' ] = 'width.right';

    // Position
    map[ 'ignoreHtmlMarginTop' ] = 'position.ignoreOffsetMargin';
    map[ 'positioning' ] = 'position.bar';
    map[ 'positionClose' ] = 'position.button';
    map[ 'positionSocial' ] = 'position.social';

    // Display
    map[ 'display' ] = 'display.type';
    map[ 'displayDelay' ] = 'display.delay';
    map[ 'speed' ] = 'display.speed';
    map[ 'backgroundColor' ] = 'display.backgroundColor';
    map[ 'border' ] = 'display.border';
    map[ 'buttonTheme' ] = 'display.theme.bar';
    map[ 'easing' ] = 'display.easing';
    map[ 'enableShadow' ] = 'display.shadow';
    map[ 'adjustPageHeight' ] = 'display.adjustPageHeight';
    map[ 'messagesScrollDirection' ] = 'display.rtl';

    // Messages
    map[ 'messages' ] = 'messages';
    map[ 'messageSizes' ] = null;
    map[ 'messagesDelay' ] = 'message.delay';
    map[ 'messagesFadeDelay' ] = 'message.fadeDelay';
    map[ 'enableRandomMessage' ] = 'message.random';
    map[ 'messageClass' ] = 'message.cssClass';

    map[ 'messagesScrollSpeed' ] = 'message.scroll.speed';
    map[ 'messagesScrollDelay' ] = 'message.scroll.delay';
    map[ 'enableMessageScroll' ] = 'message.scroll.enable';

    map[ 'fontFamily' ] = 'message.font.family';
    map[ 'fontSize' ] = 'message.font.size';
    map[ 'fontColor' ] = 'message.font.color';
    map[ 'fontShadow' ] = 'message.font.shadow';

    map[ 'aFontFamily' ] = 'message.aFont.family';
    map[ 'aFontSize' ] = 'message.aFont.size';
    map[ 'aFontColor' ] = 'message.aFont.color';
    map[ 'aFontDecoration' ] = 'message.aFont.decoration';
    map[ 'aFontShadow' ] = 'message.aFont.shadow';

    map[ 'aHoverFontFamily' ] = 'message.aFont.hover.family';
    map[ 'aHoverFontSize' ] = 'message.aFont.hover.size';
    map[ 'aHoverFontColor' ] = 'message.aFont.hover.color';
    map[ 'aHoverFontDecoration' ] = 'message.aFont.hover.decoration';
    map[ 'aHoverFontShadow' ] = 'message.aFont.hover.shadow';

    // Randoms
    map[ 'enableCookie' ] = 'cookie.enabled';
    map[ 'googleAPIKey' ] = null;
    map[ 'leftHtml' ] = 'leftHtml';
    map[ 'rightHtml' ] = 'rightHtml';

    // Social
    map[ 'socialClass' ] = 'social.cssClass';
    map[ 'social.text' ] = 'social.text';
    map[ 'social.fontFamily' ] = 'social.font.family';
    map[ 'social.fontSize' ] = 'social.font.size';
    map[ 'social.fontColor' ] = 'social.font.color';
    map[ 'social.fontShadow' ] = 'social.font.shadow';
    map[ 'social.profiles' ] = 'social.profiles';

    // Rss
    map[ 'rss.googleAPIKey' ] = null;
    map[ 'rss.enabled' ] = 'rss.enabled';
    map[ 'rss.url' ] = 'rss.url';
    map[ 'rss.maxResults' ] = 'rss.maxResults';
    map[ 'rss.linkText' ] = 'rss.linkText';
    map[ 'rss.linkTarget' ] = 'rss.linkTarget';

    // Twitter
    map[ 'twitter.enabled' ] = 'twitter.enabled';
    map[ 'twitter.user' ] = 'twitter.user';
    map[ 'twitter.maxTweets' ] = 'twitter.maxTweets';
    return map;
  },
  fixes: function(){
    var f = { };
    
    f[ 'position.bar' ] = function(value) {
      if (typeof value === 'string' && value == 'fixed') {
        console.info('VALUE CORRECTED: ', { 'option': 'position.bar', 'oldValue': 'fixed', 'newValue': 'top', 'info': 'Updated this value to better reflect what it actually does. It makes more sense to call this "top" now that there is the "bottom" variant available as well.' });
        return 'top';
      } else {
        return value;
      }
    };

    f[ 'display.rtl' ] = function(value) {
      var newValue = (typeof value === 'string' && value == 'right');
      console.info('VALUE CORRECTED: ', { 'option': 'display.rtl', 'oldValue': 'right', 'newValue': newValue, 'info': 'Changed the non-working "messagesScrollDirection" option to rather be a global RTL setting called "display.rtl".' });
      return newValue;
    };
    
    return f;
  }
};

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