import parseProductVersionString from './parseProductVersionString';

export const browsers = {
	'chrome': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_128x128.png',
		'name': 'Google Chrome',
		'shortName': 'Chrome',
		'matches': [
			/^chrome$/i,
		],
		'minVersion': 5
	},
	'ie': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_128x128.png',
		'name': 'Internet Explorer',
		'shortName': 'IE',
		'matches': [
			/^ie$/i
		],
		'minVersion': 6
	},
	'edge': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_128x128.png',
		'name': 'Microsoft Edge',
		'shortName': 'Edge',
		'matches': [
			/^edge$/i,
		],
		'minVersion': 12
	},
	'firefox': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_128x128.png',
		'name': 'Mozilla Firefox',
		'shortName': 'Firefox',
		'matches': [
			/^ff$/i,
			/^firefox$/i,
		],
		'minVersion': 2
	},
	'safari': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_128x128.png',
		'name': 'Safari',
		'shortName': 'Safari',
		'matches': [
			/^safari$/i,
		]
	},
	'opera': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_128x128.png',
		'name': 'Opera',
		'shortName': 'Opera',
		'matches': [
			/^opera$/i,
		]
	},
	'ios': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_128x128.png',
		'name': 'iOS Safari',
		'shortName': 'iOS',
		'matches': [
			/^ios_saf$/i,
			/^mobile safari$/i
		]
	},
	'android-browser': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/android/android_128x128.png',
		'name': 'Android Browser',
		'shortName': 'Android Browser',
		'matches': [
			/^android$/i,
		]
	},
	'android-chrome': {
		'icon': 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_128x128.png',
		'name': 'Android Chrome',
		'shortName': 'Android Chrome',
		'matches': [
			/^and_chr$/i,
		]
	}
};

export function parseBrowserName(name) {
	// look through our browsers listing and use the first one that has
	// a match on our name
	for (let key of Object.keys(browsers)) {
		for (let match of browsers[key].matches) {
			if (match.test(name)) {
				return key;
			}
		}
	}

	return null;
}

export function parseBrowserVersionString(str) {
	let parsed = parseProductVersionString(str);

	if (!parsed) {
		throw new Error('unable to parse browser product/version string');
	}

	parsed.product = parseBrowserName(parsed.product);

	if (!parsed.product) {
		throw new Error('browser ' + str + ' is unknown');
	}

	return parsed;
}
