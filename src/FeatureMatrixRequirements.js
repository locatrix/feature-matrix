import $ from 'jquery';
import ProductFeature from './ProductFeature';
import browserFeatureProviders from './featureProviders';
import { parseBrowserName, browsers } from './browsers';

export default class FeatureMatrixRequirements {
	constructor(requirements) {
		this.requirements = requirements;
		this.features = [];
		this.numLookups = 0;
		this.lookupsCompleted = 0;
		this.browsers = {};

		++this.numLookups;
		$.ajax({
			url: 'http://api.browserfeatures.io/v1/browser/stable',
			error: (xhr, textStatus, errorThrown) => {
				throw new Error('failed to lookup browsers');
			},
			success: (data) => {
				if (data.error) {
					throw new Error('failed to lookup browsers');
				} else {
					Object.keys(data.browsers).forEach((browser) => {
						var parsed = parseBrowserName(browser);
						if (!parsed) {
							return;
						}

						this.browsers[parsed] = data.browsers[browser];
					});

					this.lookupCompleted();
				}
			}
		});

		for (var key in requirements.features) {
			if (!requirements.features.hasOwnProperty(key)) {
				continue;
			}

			this.features.push(new ProductFeature(key, requirements.features[key], (provider, name, onComplete) => {
				++this.numLookups;

				browserFeatureProviders[provider](name, (err, res) => {
					if (err) {
						throw err;
					} else {
						onComplete(res);
						this.lookupCompleted();
					}
				})
			}));
		}
	}

	lookupCompleted() {
		++this.lookupsCompleted;

		if (this.numLookups == this.lookupsCompleted) {
			this.lookupsComplete();
		}
	}

	onLoad(handler) {
		if (this.numLookups == this.lookupsCompleted) {
			handler(this);
		} else {
			this.onLoaded = handler;
		}
	}

	lookupsComplete () {
		if (this.onLoaded) {
			this.onLoaded(this);
			delete this.onLoaded;
		}
	}

	getBrowserSupport(browser) {
		var support = [];
		var maxVersion = this.browsers[browser];
		var minVersion = browsers[browser].minVersion || 1;

		for (var i = minVersion; i <= maxVersion; ++i) {
			var versionSupport = {
				name: browser,
				version: "" + i,
				nextVersion: "" + (i + 1),
				isOldest: (i == minVersion),
				isNewest: (i == maxVersion),
				features: []
			};

			this.features.forEach(function (feature) {
				versionSupport.features.push({
					name: feature.humanReadableName,
					support: feature.getBrowserSupport(browser, i)
				})
			});

			support.push(versionSupport);
		}

		return support;
	}
}