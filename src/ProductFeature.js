export default class ProductFeature {

	constructor(key, spec, lookupBrowserFeature) {
		this.supportedBrowsers = {};
		this.unsupportedBrowsers = {};
		this.humanReadableName = spec.humanReadableName;
		this.key = key;

		if (spec.requiredBrowserFeatures) {
			spec.requiredBrowserFeatures.forEach((browserFeature) => {
				var provider = browserFeature.split(':')[0];
				var browserFeatureName = browserFeature.substring(browserFeature.indexOf(':') + 1);

				lookupBrowserFeature(provider, browserFeatureName, (support) => {
					for (var key in support) {
						if (!support.hasOwnProperty(key)) {
							continue;
						}

						if (support[key].supported) {
							this.supportedBrowsers[key] = support[key];
						} else {
							this.unsupportedBrowsers[key] = true;
						}
					}
				});
			});
		}
	}

	getBrowserSupport(name, version) {
		// are we blacklisted? if so, we *really* don't support this browser

		// are we whitelisted? if so, we do support this browser

		// do all of our browser features work in this browser?
		// if so, we do support this browser
		// if there is a feature that would work in a newer version of this browser
		// or the feature flat-out isn't supported, we don't support this browser
		if (this.supportedBrowsers[name] && version >= this.supportedBrowsers[name].since) {
			return { support: 'supported' };
		} else if (this.unsupportedBrowsers[name] || (this.supportedBrowsers[name] && version < this.supportedBrowsers[name].since)) {
			return { support: 'unsupported' };
		}

		// do we require plugins which are supported in this browser?
		// if so, we do support this browser but only conditionally on the
		// presence of said plugin

		// if we've gotten to this point, we have no clue about this browser,
		// so we can't say whether we do or don't support it
		return { support: 'unknown' };
	}
}