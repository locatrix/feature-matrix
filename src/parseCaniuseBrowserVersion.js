
const re = /^([0-9\.]+)\-?([0-9\.]+)?$/

function numDecimals(value) {
	let str = '' + value;
	let decimalIndex = str.indexOf('.');

	if (decimalIndex == -1) {
		return 0;
	} else {	
		return str.length - (decimalIndex + 1)
	}
}

// the callback is called once per parsed version.
// if the version string is something like "9.1-9.3" then it'll be called
// three times, with 9.1, 9.2 and 9.3.if the version string is 10-14, then
// it'll be called with 10, 11, 12, 13 and 14. Versions like 4.4.3 will be
// reduced down to 4.4 by this function.
export default function parseCaniuseBrowserVersion(version, onVersionParsed) {
	let matches = re.exec(version);

	if (!matches) {
		return;
	}

	if (!matches[2]) {
		onVersionParsed(parseFloat(matches[1]));
	} else {
		// need to deal with a range of versions and emit intermediates. we look
		// for the position of the least significant figure in order to get our
		// increment
		let begin = parseFloat(matches[1]);
		let end = parseFloat(matches[2]);

		let decimals = Math.max(numDecimals(begin), numDecimals(end));
		let increment = Math.pow(10, -decimals);
		let invIncrement = Math.pow(10, decimals);

		// rounding shenanigans to make sure that our floating point addition isn't
		// too wrong
		for (let i = begin; i <= end; i += increment) {
			onVersionParsed(Math.round(i * invIncrement) / invIncrement);
		}
	}
}
