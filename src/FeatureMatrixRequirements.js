import $ from 'jquery';
import ProductFeature from './ProductFeature';
import BrowserSupportList from './BrowserSupportList';
import browserFeatureProviders from './featureProviders';
import parseCaniuseBrowserVersion from './parseCaniuseBrowserVersion';
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
			url: 'http://cdn.rawgit.com/Fyrd/caniuse/master/sample-data.json',
			error: (xhr, textStatus, errorThrown) => {
				throw new Error('failed to lookup browsers');
			},
			success: (data) => {
				if (data.error) {
					throw new Error('failed to lookup browsers');
				} else {
					Object.keys(data.stats).forEach((browser) => {
						var parsed = parseBrowserName(browser);
						if (!parsed) {
							return;
						}

						var versions = [];

						Object.keys(data.stats[browser]).forEach((version) => {
							parseCaniuseBrowserVersion('' + version, (v) => {
								if (versions.indexOf(v) == -1) {
									versions.push(v);
								}
							});
						});

						versions.sort((a, b) => a - b);
						this.browsers[parsed] = versions;
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
		var versions = this.browsers[browser];
		var minVersion = browsers[browser].minVersion || versions[0];
		var maxVersion = versions[versions.length - 1];

		versions.forEach((version, i) => {
			if (version < minVersion) {
				return;
			}

			var versionSupport = {
				name: browsers[browser].shortName,
				version: "" + version,
				icon: browsers[browser].icon,
				prevVersion: versions[i - 1],
				nextVersion: versions[i + 1],
				isOldest: (version == minVersion),
				isNewest: (version == maxVersion),
				features: []
			};

			this.features.forEach((feature) => {
				let column = null;

				if (this.forceUnsupportedList && this.forceUnsupportedList.check(browser, version)) {
					column = {
						name: feature.humanReadableName,
						support: { support: 'unsupported', conditions: feature.getNotes() }
					};
				} else {
					column = {
						name: feature.humanReadableName,
						support: feature.getBrowserSupport(browser, version, pluginRequirementGenerator)
					};
				}

				// what have I done
				if (column.support.support == 'supported' && this.forcePartialList && this.forcePartialList.check(browser, version)) {
					column.support.support = 'partial';
				}

				column.support.conditions = column.support.conditions.concat(this.getBrowserNotesFromSupport(browser, version, column.support.support));

				versionSupport.features.push(column);
			});

			support.push(versionSupport);
		});

		return support;
	}
}