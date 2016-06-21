import assert from 'assert';
import { expect } from 'chai';
import parseBrowserString from '../src/parseBrowserString';

describe('parseBrowserString', () => {
	let validCases = {
		"IE": {
			browser: 'IE',
			versions: {
				min: 0,
				max: Number.MAX_VALUE
			}
		},
		"IE6": {
			browser: 'IE',
			versions: {
				min: 6,
				max: 6
			}
		},
		"IE 6": {
			browser: 'IE',
			versions: {
				min: 6,
				max: 6
			}
		},
		"IE6-8": {
			browser: 'IE',
			versions: {
				min: 6,
				max: 8
			}
		},
		" IE 6 - 8 ": {
			browser: 'IE',
			versions: {
				min: 6,
				max: 8
			}
		},
		"IE <9": {
			browser: 'IE',
			versions: {
				min: 0,
				max: 8
			}
		},
		"IE <11": {
			browser: 'IE',
			versions: {
				min: 0,
				max: 10
			}
		},
		"IE > 8": {
			browser: 'IE',
			versions: {
				min: 9,
				max: Number.MAX_VALUE
			}
		},
		"IE 8+": {
			browser: 'IE',
			versions: {
				min: 8,
				max: Number.MAX_VALUE
			}
		},
		"IE 8 + ": {
			browser: 'IE',
			versions: {
				min: 8,
				max: Number.MAX_VALUE
			}
		},
		"IE10+": {
			browser: 'IE',
			versions: {
				min: 10,
				max: Number.MAX_VALUE
			}
		},
		"Chrome 42+": {
			browser: 'Chrome',
			versions: {
				min: 42,
				max: Number.MAX_VALUE
			}
		},
		"Firefox": {
			browser: 'Firefox',
			versions: {
				min: 0,
				max: Number.MAX_VALUE
			}
		}
	};

	let invalidCases = [
		"6",
		"-IE6",
		"IE6>"
	];

	Object.keys(validCases).forEach((key) => {
		it('should parse "' + key + '"', function () { assert.deepEqual(parseBrowserString(key), validCases[key]) });
	});

	invalidCases.forEach((key) => {
		it('should not parse "' + key + '"', function () { assert.equal(parseBrowserString(key), null) });
	});
});