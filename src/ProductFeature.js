import parseProductVersionString from './parseProductVersionString';
import { parseBrowserVersionString } from './browsers';
import { getBrowserNotes } from './notes';
import BrowserSupport from './BrowserSupport';

export default class ProductFeature {

	constructor(key, spec, lookupBrowserFeature) {
		this.notes = spec.notes;
		this.humanReadableName = spec.humanReadableName;
		this.key = key;
		
		if (spec.supported) {
			this.requiredSupport = new BrowserSupport(spec.supported, lookupBrowserFeature);
		}

		if (spec.partiallySupported) {
			this.partialSupport = new BrowserSupport(spec.partiallySupported, lookupBrowserFeature);
		}
	}

	getNotes(name, version) {
		return getBrowserNotes(this.notes, name, version);
	}

	getBrowserSupport(name, version, pluginRequirementGenerator) {
		let notes = this.getNotes(name, version);

		let support = { support: "unknown" };

		if (this.requiredSupport) {
			support = this.requiredSupport.getBrowserSupport(name, version, pluginRequirementGenerator);
		}

		if (support.support != 'supported' && this.partialSupport) {
			let partialSupport = this.partialSupport.getBrowserSupport(name, version, pluginRequirementGenerator);

			if (partialSupport.support == 'supported') {
				support = partialSupport;
				support.support = 'partial';
			}
		}

		if (!support.conditions) {
			support.conditions = [];
		}

		// add in our notes to the final conditions
		support.conditions = support.conditions.concat(notes);
		return support;
	}
}