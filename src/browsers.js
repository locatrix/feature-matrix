import parseProductVersionString from './parseProductVersionString';

export const browsers = {
	'chrome': {
		'icon': 'https://www.browserfeatures.io/images/chrome/chrome_128x128.png',
		'name': 'Google Chrome',
		'shortName': 'Chrome',
		'matches': [
			/^chrome$/i,
		],
		'minVersion': 5
	},
	'ie': {
		'icon': 'https://www.browserfeatures.io/images/internet-explorer/internet-explorer_128x128.png',
		'name': 'Internet Explorer',
		'shortName': 'IE',
		'matches': [
			/^ie$/i
		],
		'minVersion': 6
	},
	'edge': {
		'icon': 'https://www.browserfeatures.io/images/edge/edge_128x128.png',
		'name': 'Microsoft Edge',
		'shortName': 'Edge',
		'matches': [
			/^edge$/i,
		],
		'minVersion': 12
	},
	'firefox': {
		'icon': 'https://www.browserfeatures.io/images/firefox/firefox_128x128.png',
		'name': 'Mozilla Firefox',
		'shortName': 'Firefox',
		'matches': [
			/^ff$/i,
			/^firefox$/i,
		],
		'minVersion': 2
	},
	'safari': {
		'icon': 'https://www.browserfeatures.io/images/safari/safari_128x128.png',
		'name': 'Safari',
		'shortName': 'Safari',
		'matches': [
			/^safari$/i,
		],
		'minVersion': 1
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
