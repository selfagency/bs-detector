chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		// ----------------------------------------------------------

		var links = [
			'21stcenturywire.com',
			'activistpost.com',
			'addictinginfo.org',
			'americannews.com',
			'americannewsx.com',
			'amplifyingglass.com',
			'beforeitsnews.com',
			'bigamericannews.com',
			'bigpzone.com',
			'bipartisanreport.com',
			'bluenationreview.com',
			'breitbart.com',
			'christwire.org',
			'chronicle.su',
			'civictribune.com',
			'clickhole.com',
			'coasttocoastam.com',
			'consciouslifenews.com',
			'conservativeoutfitters.com',
			'countdowntozerotime.com',
			'counterpsyops.com',
			'creambmp.com',
			'dailybuzzlive.com',
			'dailycurrant.com',
			'dailynewsbin.com',
			'dailystormer.com',
			'davidduke.com',
			'davidwolfe.com',
			'dcclothesline.com',
			'dcgazette.com',
			'derfmagazine.com',
			'disclose.tv',
			'drudgereport.com.co',
			'duffleblog.com',
			'duhprogressive.com',
			'empirenews.com',
			'empiresports.co',
			'enduringvision.com',
			'fprnradio.com',
			'geoengineeringwatch.org',
			'globalresearch.ca',
			'gomerblog.com',
			'govtslaves.info',
			'gulagbound.com',
			'hangthebankers.com',
			'humansarefree.com',
			'huzlers.com',
			'ifyouonlynews.com',
			'infowars.com',
			'intellihub.com',
			'itaglive.com',
			'jonesreport.com',
			'lewrockwell.com',
			'liberalamerica.org',
			'libertymovementradio.com',
			'libertytalk.fm',
			'libertyvideos.org',
			'mediamass.net',
			'megynkelly.us',
			'msnbc.co',
			'msnbc.website',
			'nahadaily.com',
			'nationalreport.net',
			'naturalnews.com',
			'news-hound.com',
			'newsbiscuit.com',
			'newslo.com',
			'newsmutiny.com',
			'newswire-24.com',
			'nodisinfo.com',
			'nowtheendbegins.com',
			'occupydemocrats.com',
			'other98.com',
			'pakalertpress.com',
			'politicalblindspot.com',
			'politicalears.com',
			'politicalo.com',
			'politicsusa.com',
			'prisonplanet.com',
			'prisonplanet.tv',
			'private-eye.co.uk',
			'realfarmacy.com',
			'realnewsrightnow.com',
			'redflagnews.com',
			'rense.com',
			'rilenews.com',
			'rockcitytimes.com',
			'sprotspickle.com',
			'theblaze.com',
			'thedailysheeple.com',
			'thefreethoughtproject.com',
			'thelapine.ca',
			'thenewsnerd.com',
			'theonion.com',
			'therightstuff.biz',
			'therundownlive.com',
			'thespoof.com',
			'theuspatriot.com',
			'truthfrequencyradio.com',
			'unconfirmedsources.com',
			'usuncut.com',
			'veteranstoday.com',
			'wakingupwisconsin.com',
			'weeklyworldnews.com',
			'wideawakeamerica.com',
			'winningdemocrats.com',
			'witscience.org',
			'wnd.com',
			'worldnewsdailyreport.com',
			'worldtruth.tv'
		];

		function linkWarning() {
			var aTags = $('a');
			$.each(aTags, function(index, tag) {
				var url = $(tag).attr('href');
				if (url) {
					var cleanUrl = url.toLowerCase;
					$(this).attr('href', cleanUrl);
				};
			});
			$.each(links, function(index, url) {
				var badLink = 'a[href*="' + url + '"]';
				$(badLink).each(function() {
					$(this).addClass('hint--error hint--large hint--bottom');
					$(this).attr('aria-label', 'This website is considered a questionable source.');
				});
			});
		};
		linkWarning();

		$(window).scroll(function() {
			linkWarning();
		});
	}
	}, 10);
});
