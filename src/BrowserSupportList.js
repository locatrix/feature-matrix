import { parseBrowserName, browsers } from './browsers';
import parseProductVersionString from './parseProductVersionString';

export default class BrowserSupportList {
	constructor(blacklist, whitelist) {
		if (blacklist == '*' && whitelist == '*') {
			throw new Error("can't blacklist and whitelist everything at the same time");
		}

		if (blacklist == '*') {
			this.blacklistAll = true;
		} else {
			this.blacklistAll = false;

			if (blacklist) {
				this.blacklist = {};

				for (let entry of blacklist) {
					let parsed = parseProductVersionString(entry);

					if (!parsed) {
						throw new Error('unable to parse browser product/version string');
					}

					parsed.product = parseBrowserName(parsed.product);

					if (!parsed.product) {
						throw new Error('browser ' + entry + ' is unknown');
					}

					if (this.blacklist[parsed.product]) {
						throw new Error("can't have multiple blacklist entries for the same product");
					}

					this.blacklist[parsed.product] = parsed.versions;
				}
			}
		}

		if (whitelist == '*') {
			this.whitelistAll = true;
		} else {
			this.whitelistAll = false;

			if (whitelist) {
				this.whitelist = {};

				for (let entry of whitelist) {
					var parsed = parseProductVersionString(entry);

					if (!parsed) {
						throw new Error('unable to parse browser product/version string');
					}

					parsed.product = parseBrowserName(parsed.product);

					if (!parsed.product) {
						throw new Error('browser ' + entry + ' is unknown');
					}

					if (this.whitelist[parsed.product]) {
						throw new Error("can't have multiple whitelist entries for the same product");
					}

					this.whitelist[parsed.product] = parsed.versions;
				}
			}
		}
	}

	check(name, version) {
		let unknownRes = null;

		if (this.blacklistAll) {
			unknownRes = false;
		}

		if (this.whitelistAll) {
			unknownRes = true;
		}

		if (this.blacklist && this.blacklist[name]) {
			if (version >= this.blacklist[name].min && version <= this.blacklist[name].max) {
				return false;
			}
		}

		if (this.whitelist && this.whitelist[name]) {
			if (version >= this.whitelist[name].min && version <= this.whitelist[name].max) {
				return true;
			}
		}

		return unknownRes;
	}
}
