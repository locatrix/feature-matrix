import BrowserSupportList from './BrowserSupportList';

export const plugins = {
	'flash': {
		'humanReadableName': 'Flash Player',

		// using a '*' blacklist puts this into whitelist only mode, where everything
		// is blacklisted and only the given browsers in the whitelist are compatible
		'browserSupport': new BrowserSupportList('*', [
			'IE 6+',
			'Chrome 5+',
			'Firefox',
			'Edge',
			'Safari'
		]),

		'matches': [
			/^Flash$/gi,
		],
	}
};

export function parsePluginName(name) {
	// look through our plugins listing and use the first one that has
	// a match on our name
	for (var key in plugins) {
		if (!plugins.hasOwnProperty(key)) {
			continue;
		}

		for (var i = 0; i < plugins[key].matches.length; ++i) {
			if (plugins[key].matches[i].test(name)) {
				return key;
			}
		}
	}

	return null;
}
