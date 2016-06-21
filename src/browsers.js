export const browsers = {
	'chrome': {
		'icon': 'https://www.browserfeatures.io/images/chrome/chrome_128x128.png',
		'name': 'Google Chrome',
		'shortName': 'Chrome',
		'matches': [
			/chrome/gi,
			/google chrome/gi
		]
	},
	'ie': {
		'icon': 'https://www.browserfeatures.io/images/internet-explorer/internet-explorer_128x128.png',
		'name': 'Internet Explorer',
		'shortName': 'IE',
		'matches': [
			/ie/gi,
			/internet explorer/gi
		],
		'minVersion': 6
	},
	'edge': {
		'icon': 'https://www.browserfeatures.io/images/edge/edge_128x128.png',
		'name': 'Microsoft Edge',
		'shortName': 'Edge',
		'matches': [
			/edge/gi,
			/microsoft edge/gi
		],
		'minVersion': 12
	},
	'firefox': {
		'icon': 'https://www.browserfeatures.io/images/firefox/firefox_128x128.png',
		'name': 'Mozilla Firefox',
		'shortName': 'Firefox',
		'matches': [
			/ff/gi,
			/firefox/gi,
			/mozilla firefox/gi
		]
	}
};

export function parseBrowserName(name) {
	// look through our browsers listing and use the first one that has
	// a match on our name
	for (var key in browsers) {
		if (!browsers.hasOwnProperty(key)) {
			continue;
		}

		for (var i = 0; i < browsers[key].matches.length; ++i) {
			if (browsers[key].matches[i].test(name)) {
				return key;
			}
		}
	}

	return null;
}
