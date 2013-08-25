define(function() {
	return function(g,ready) {
		if (!/^https?:\/\/www.kongregate.com\//.test(document.referrer)) { return; }
		console.log('Loading kongregate...');
		kongregateAPI.loadAPI(kongregateLoaded);
		function kongregateLoaded() {
			console.log('Loaded kongregate API...');
			g.kongregate = kongregateAPI.getAPI();
			g.on('finished',onLevelFinished);
			ready();
		}
		function onLevelFinished(finish) {
			console.log('Submit finish-time to Kongregate...');
			g.kongregate.stats.submit('finishtime_'+finish.level,finish.time);
		}

		return ready;
	};
});