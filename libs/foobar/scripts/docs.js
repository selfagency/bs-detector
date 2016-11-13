$( document ).ready( function() {
  // Highlight code
  $( 'pre.code' ).highlight( {source:0, zebra:1, indent:'space', list:'ol'} );

  $.foobar( {
    "leftHtml" : "{{include:#socialshare}}",
    "display": { "backgroundColor": "#6c9e00", "button": { "spacer": false } },
    "position": { "social": "hidden" },
    "width": {
      "left": "550px",
      "center": "*",
      "right": "0px"
    },
    "messages": [ // The messages to display in the bar. If only 1 message it will be displayed permanently otherwise the messagesDelay value is used to cycle through the array.
      "foobar - a notification bar that doesn't suck!!",
      "You can display multiple messages with <a href='#some-link'>links!</a>",
      "Let visitors know about new blog posts, news and anything else you can think of!",
      "You can also display long messages and the bar will automatically scroll them into view before switching to the next message!",
      "With over 60 options the sky is the limit...",
      "<span style='color:#800'>This message is red. WARNING WARNING!</span>"
    ]
  } );

  $('.demo-open').click(function(e){
    e.preventDefault();
    $.foobar('open');
  });

  $('.demo-close').click(function(e){
    e.preventDefault();
    $.foobar('close');
  });

  $('.demo-toggle').click(function(e){
    e.preventDefault();
    $.foobar('toggle');
  });

  $( '.demo-destroy' ).click(function(e){
    e.preventDefault();
    $.foobar( 'destroy' );
  });

  $( '.demo-create' ).click(function(e){
    e.preventDefault();
    $.foobar( 'This is a new foobar created using the default options.' );
  });
  
  $( '.demo-top' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( 'option', {
      "position": { "bar" : "top" },
      "messages": ["This foobar is positioned at the top of the page"]
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  } );

  $( '.demo-bottom' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( 'option', {
      "position": { "bar" : "bottom" },
      "messages": ["This foobar is positioned at the bottom of the page"]
    } );
    $( '.in-action' ).addClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  } );

  $( '.demo-inline' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "position" : {
        "bar": "inline"
      },
      "display": {
        "backgroundColor" : "#800"
      },
      "messages": ["This foobar is inline. It will scroll out of view"]
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'absolute'} );
    $( 'html, body' ).animate( {scrollTop:0}, 'slow' );
  } );

  $( '.demo-expanded' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "type": "expanded",
        "backgroundColor" : "#4141b2"
      },
      "messages": ["This foobar is in an expanded (or open) state when the page loads"]
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-collapsed' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "type": "collapsed",
        "backgroundColor" : "#088"
      },
      "messages": ["This foobar is in a collapsed state when the page loads"]
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-delay' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "type": "delayed",
        "delay": 2000,
        "backgroundColor" : "#880"
      },
      "messages": ["This foobar is only shown 2 seconds after the page loads"]
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    alert( 'Wait 2 seconds...' );
  } );

  $( '.demo-onscroll' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "type": "onscroll",
        "delay": 2000,
        "backgroundColor" : "#808"
      },
      "messages": ["This foobar is only shown 2 seconds after the page is scrolled"]
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    alert( 'Scroll the page and wait 2 seconds...' );
  } );

  $( '.demo-rss' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "backgroundColor" : "#424242"
      },
      "messages": ["Check out my RSS feed..."],
      "googleAPIKey": "ABQIAAAAWQfxE_ARsBpyZX6Nw5lIjBRGBTFdlkaF2_VaRwZe9El1psia0BSdIhY19VttHlkxFoyUrIAQA9vByA", // Your Google API key, that is needed in order to pull RSS feed results
      "rss":{
        "enabled": true, // If messages can be populated using an RSS feed
        "url": "http://feeds.feedburner.com/themergency?format=xml", // The URL to the RSS feed
        "maxResults":5 //The maximum number of RSS feed resuls to display as messages
      }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-shuffle' ).toggle( function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "position" : {
        "button": "left",
        "social": "right"
      },
      "display": {
        "backgroundColor" : "#888"
      },
      "messages": ["The social and close area have been switched!"],
      "social": {
        "profiles": [
          {
            "name": "delicious",
            "url": "#foobar-delicious",
            "image": "images/social/delicious.png"
          },
          {
            "name": "facebook",
            "url": "#foobar-facebook",
            "image": "images/social/facebook.png"
          },
          {
            "name": "twitter",
            "url": "#foobar-twitter",
            "image": "images/social/twitter.png"
          }
        ]
      }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  }, function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "position" : {
        "button": "right",
        "social": "left"
      },
      "display": {
        "backgroundColor" : "#888"
      },
      "messages": ["The social and close area have been switched!"],
      "social": {
        "profiles": [
          {
            "name": "delicious",
            "url": "#foobar-delicious",
            "image": "images/social/delicious.png"
          },
          {
            "name": "facebook",
            "url": "#foobar-facebook",
            "image": "images/social/facebook.png"
          },
          {
            "name": "twitter",
            "url": "#foobar-twitter",
            "image": "images/social/twitter.png"
          }
        ]
      }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  }, function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "position" : {
        "button": "left",
        "social": "left"
      },
      "display": {
        "backgroundColor" : "#888"
      },
      "messages": ["The social and close area have been switched!"],
      "social": {
        "profiles": [
          {
            "name": "delicious",
            "url": "#foobar-delicious",
            "image": "images/social/delicious.png"
          },
          {
            "name": "facebook",
            "url": "#foobar-facebook",
            "image": "images/social/facebook.png"
          },
          {
            "name": "twitter",
            "url": "#foobar-twitter",
            "image": "images/social/twitter.png"
          }
        ]
      }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  }, function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "position" : {
        "button": "right",
        "social": "right"
      },
      "display": {
        "backgroundColor" : "#888"
      },
      "messages": ["The social and close area have been switched!"],
      "social": {
        "profiles": [
          {
            "name": "delicious",
            "url": "#foobar-delicious",
            "image": "images/social/delicious.png"
          },
          {
            "name": "facebook",
            "url": "#foobar-facebook",
            "image": "images/social/facebook.png"
          },
          {
            "name": "twitter",
            "url": "#foobar-twitter",
            "image": "images/social/twitter.png"
          }
        ]
      }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-themes' ).toggle( function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "theme": "long-arrow",
        "backgroundColor" : "Brown"
      },
      "messages": ["Check out the different arrows! (long-arrow)", "The message navigation arrows are changed with the theme as well.", "Hover over the messages to see the navigation arrows."],
      "message": { "navigation": true }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  }, function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "theme": "small-white-arrow",
        "backgroundColor" : "FireBrick"
      },
      "messages": ["Check out the different arrows! (small-white-arrow)", "The message navigation arrows are changed with the theme as well.", "Hover over the messages to see the navigation arrows."],
      "message": { "navigation": true }
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  }, function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $( this ).addClass( 'demo-current' );
    $.foobar( {
      "display": {
        "theme": "triangle-arrow",
        "backgroundColor" : "Crimson"
      },
      "messages": ["These are the default arrows! (triangle-arrow)", "The message navigation arrows are changed with the theme as well.", "Hover over the messages to see the navigation arrows."],
      "message": { "navigation": true }
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-long-message' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "backgroundColor" : "#424242"
      },
      "messages" : ["This is a very long message which will most likely not be fully displayed within your browser unless you are running a very high resolution. Foobar will automatically scroll this message into view to allow full reading of it's contents."],
      "message" : {
        "scroll" : {
          "speed" : 50,
          "delay" : 3000
        }
      }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-toggle-rtl' ).click( function( e ) {
    e.preventDefault();
    $.foobar( 'option', 'display.rtl', !$.foobar( 'option', 'display.rtl' ) );
  });
  
  $( '.demo-disable-scroll' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "backgroundColor" : "#424242"
      },
      "messages" : ["This is a very long message which will be cut off in most browsers unless you are running a very high resolution. Normally foobar would scroll this text into view however seeing as that feature has been disabled this may never be read :("],
      "message" : {
        "scroll" : {
          "enabled" : false
        }
      }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-bounce' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "type": "collapsed",
        "backgroundColor" : "#880",
        "speed" : 400,
        "easing" : "easeOutBounce"
      },
      "messages": ["This foobar bounces when displayed"]
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-custom-html' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "theme": "small-white-arrow",
        "backgroundColor" : "#888"
      },
      "height" : { "bar" : 80 },
      "messages": ["<span style='color:#D00'>WARNING! custom HTML, WARNING!</span>",
        "<a href='http://bit.ly/getfoobar' title='Buy it now from CodeCanyon!'><img src='images/foobar-590x75.jpg' alt='Buy the FooBar now' /></a>",
        "We can put any HTML here : <input type='text' value='hello' /> <input type='checkbox' />",
        "Or even show flash : <iframe width='300' height='75' src='http://www.youtube.com/embed/BriU4G33Hd0?rel=0' frameborder='0' allowfullscreen></iframe>"]
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  } );

  $( '.demo-social-sharing' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "height" : { "bar" : 80 },
      "social" : {
        "customHtml" : "<iframe src=\"http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fcodecanyon.net%2Fitem%2Ffoobar-a-jquery-notification-bar%2F241318%3Fthemergency&amp;send=false&amp;layout=button_count&amp;width=100&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21\" scrolling=\"no\" frameborder=\"0\" style=\"border:none; overflow:hidden; width:100px; height:21px;\" allowTransparency=\"true\"></iframe><iframe allowtransparency=\"true\" frameborder=\"0\" scrolling=\"no\"        src=\"http://platform.twitter.com/widgets/tweet_button.html?via=themergency&count=horizontal\"         style=\"width:130px; height:50px;\"></iframe><g:plusone size=\"medium\" href=\"http://codecanyon.net/item/foobar-a-jquery-notification-bar/241318\" count=\"true\"></g:plusone>"
      }
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  } );

  $( '.demo-borders' ).toggle( function( ) {

    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "messages": ["No shadow"],
      "display": {
        "shadow": false,
        "border" : "solid 3px #fff"
      }
    } );
    $( '.in-action' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  }, function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "messages": ["No border"],
      "display": {
        "shadow": true,
        "border" : "none"
      }
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  }, function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "messages": ["No border or shadow"],
      "display": {
        "shadow": false,
        "border" : "none"
      }
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  }, function() {
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "messages": ["Border and shadow"],
      "display": {
        "shadow": true,
        "border" : "solid 3px #fff"
      }
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  } );

  $( '.demo-twitter' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "backgroundColor" : "IndianRed"
      },
      "messages": ["Check out my tweets..."],
      "googleAPIKey": "ABQIAAAAWQfxE_ARsBpyZX6Nw5lIjBRGBTFdlkaF2_VaRwZe9El1psia0BSdIhY19VttHlkxFoyUrIAQA9vByA",
      "twitter": {
        "enabled": true,
        "user": "themergency",
        "maxTweets": 5
      }
    } );
    $( this ).addClass( 'demo-current' );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
  } );

  $( '.demo-random' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "type": "expanded",
        "backgroundColor" : "#4141b2"
      },
      "messages": ["Message 1", "Message 2", "Message 3", "Message 4", "Message 5", "Message 6", "Message 7", "Message 8"],
      "message" : {
        "random" : true
      }
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  } );

  $( '.demo-navigation' ).click( function( e ) {
    e.preventDefault();
    $( '.demo-current' ).removeClass( 'demo-current' );
    $.foobar( {
      "display": {
        "type": "expanded",
        "backgroundColor" : "#898989"
      },
      "messages": ["Message 1", "Message 2", "Message 3", "Message 4", "Message 5", "Message 6", "Message 7", "Message 8"],
      "message" : {
        "navigation" : true
      }
    } );
    $( '.in-action' ).removeClass( 'bottom' ).css( {'position':'fixed'} );
    $( this ).addClass( 'demo-current' );
  } );

  $( ".modal" ).facebox();

} );