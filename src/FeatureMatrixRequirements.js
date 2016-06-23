import $ from 'jquery';
import ProductFeature from './ProductFeature';
import BrowserSupportList from './BrowserSupportList';
import browserFeatureProviders from './featureProviders';
import { parseBrowserName, browsers } from './browsers';
import { getBrowserNotes } from './notes';

export default class FeatureMatrixRequirements {
	constructor(requirements) {
		this.requirements = requirements;
		this.features = [];
		this.numLookups = 0;
		this.lookupsCompleted = 0;
		this.browsers = {};

		if (requirements.forcePartialSupport) {
			this.forcePartialList = new BrowserSupportList(null, requirements.forcePartialSupport);
		}

		if (requirements.forceUnsupported) {
			this.forceUnsupportedList = new BrowserSupportList(null, requirements.forceUnsupported);
		}

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

	getBrowserNotesFromSupport(name, version, supportLevel) {
		if (!this.requirements.notes) {
			return [];
		}

		if (supportLevel == 'supported') {
			return getBrowserNotes(this.requirements.notes.supported, name, version);
		} else if (supportLevel == 'partial') {
			return getBrowserNotes(this.requirements.notes.partiallySupported, name, version);
		} else if (supportLevel == 'unsupported') {
			return getBrowserNotes(this.requirements.notes.unsupported, name, version);
		} else {
			return getBrowserNotes(this.requirements.notes.unknown, name, version);
		}
	}

	getBrowserSupport(browser, pluginRequirementGenerator) {
		var support = [];
		var maxVersion = this.browsers[browser];
		var minVersion = browsers[browser].minVersion || 1;

		for (var i = minVersion; i <= maxVersion; ++i) {
			var versionSupport = {
				name: browsers[browser].shortName,
				version: "" + i,
				icon: browsers[browser].icon,
				nextVersion: "" + (i + 1),
				isOldest: (i == minVersion),
				isNewest: (i == maxVersion),
				features: []
			};

			this.features.forEach((feature) => {
				let column = null;

				if (this.forceUnsupportedList && this.forceUnsupportedList.check(browser, i)) {
					column = {
						name: feature.humanReadableName,
						support: { support: 'unsupported', conditions: feature.getNotes() }
					};
				} else {
					column = {
						name: feature.humanReadableName,
						support: feature.getBrowserSupport(browser, i, pluginRequirementGenerator)
					};
				}

				// what have I done
				if (column.support.support == 'supported' && this.forcePartialList && this.forcePartialList.check(browser, i)) {
					column.support.support = 'partial';
				}

				column.support.conditions = column.support.conditions.concat(this.getBrowserNotesFromSupport(browser, i, column.support.support));

				versionSupport.features.push(column);
			});

			support.push(versionSupport);
		}

		return support;
	}
}