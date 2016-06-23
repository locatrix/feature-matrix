import { parseBrowserVersionString } from './browsers';

export function getBrowserNotes(notesObj, name, version) {
	let notes = [];

	if (notesObj && (typeof notesObj === 'string' || notesObj instanceof String)) {
		// single note that applies to everything
		notes.push(notesObj);
	} else if (notesObj) {
		// we have an object where the keys are browser versions (or a catch-all '*')
		// and the values are our notes
		for (let key of Object.keys(notesObj)) {
			if (key == '*') {
				// catch-all note
				notes.push(notesObj[key]);
			} else {
				let parsed = parseBrowserVersionString(key);

				if (parsed.product == name && version >= parsed.versions.min && version <= parsed.versions.max) {
					notes.push(notesObj[key]);
				}
			}
		}
	}

	return notes;
}