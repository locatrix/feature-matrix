import parseProductVersionString from './parseProductVersionString';
import { parsePluginName, plugins } from './plugins';
import BrowserSupportList from './BrowserSupportList';

export default class ProductFeature {

	constructor(key, spec, lookupBrowserFeature) {
		this.supportedBrowsers = {};
		this.unsupportedBrowsers = {};
		this.requiredPlugins = {};
		this.humanReadableName = spec.humanReadableName;
		this.key = key;
		this.supportList = new BrowserSupportList(spec.blacklist, spec.whitelist);

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

		if (spec.requiredBrowserPlugins) {
			spec.requiredBrowserPlugins.forEach((browserPlugin) => {
				var parsed = parseProductVersionString(browserPlugin);

				if (!parsed) {
					throw new Error('unable to parse plugin product/version string');
				}

				parsed.product = parsePluginName(parsed.product);

				if (!parsed.product) {
					throw new Error('plugin ' + browserPlugin + ' is unknown');
				}

				this.requiredPlugins[parsed.product] = parsed.versions;
			});
		}
	}

	getBrowserSupport(name, version, pluginRequirementGenerator) {
		// check the blacklist/whitelist for explicit support indicators.
		// if we have those we can uncondionally support/not support the browser.
		const explicitSupport = this.supportList.check(name, version);
		if (explicitSupport != null) {
			return { support: (explicitSupport ? 'supported' : 'unsupported') };
		}

		// do all of our browser features work in this browser?
		// if so, we do support this browser
		// if there is a feature that would work in a newer version of this browser
		// or the feature flat-out isn't supported, we don't support this browser
		if (this.supportedBrowsers[name] && version >= this.supportedBrowsers[name].since) {
			return { support: 'supported' };
		} else if (this.unsupportedBrowsers[name] || (this.supportedBrowsers[name] && version < this.supportedBrowsers[name].since)) {
			return { support: 'unsupported' };
		}

		// do all of our required plugins (if any) support this browser?
		// if so, we do support this browser but only conditionally on the
		// presence of said plugins
		if (Object.keys(this.requiredPlugins).length > 0) {
			let supportedPlugins = [];

			for (let pluginName of Object.keys(this.requiredPlugins)) {
				let pluginInfo = plugins[pluginName];

				if (pluginInfo.browserSupport.check(name, version)) {
					supportedPlugins.push({
						name: pluginInfo.humanReadableName,
						requiredVersion: '' + this.requiredPlugins[pluginName].min + '+'
					});
				} else {
					// this plugin doesn't support the browser, and we require
					// 100% of required plugins to have support
					return { support: 'unsupported' };
				}
			}

			return { support: 'conditional', conditions: supportedPlugins.map(p => pluginRequirementGenerator(p.name, p.requiredVersion))}
		}

		// do we required plugins which are explicitly not supported in this browser?
		// if so, we don't support this browser

		// if we've gotten to this point, we have no clue about this browser,
		// so we return the unknown support option. (which can change based
		// on whether we're using blacklisting/whitelisting)
		return { support: 'unknown' };
	}
}