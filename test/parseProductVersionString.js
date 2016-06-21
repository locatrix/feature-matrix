import assert from 'assert';
import { expect } from 'chai';
import parseProductVersionString from '../src/parseProductVersionString';

describe('parseProductVersionString', () => {
	let validCases = {
		"IE": {
			product: 'IE',
			versions: {
				min: 0,
				max: Number.MAX_VALUE
			}
		},
		"IE6": {
			product: 'IE',
			versions: {
				min: 6,
				max: 6
			}
		},
		"IE 6": {
			product: 'IE',
			versions: {
				min: 6,
				max: 6
			}
		},
		"IE6-8": {
			product: 'IE',
			versions: {
				min: 6,
				max: 8
			}
		},
		" IE 6 - 8 ": {
			product: 'IE',
			versions: {
				min: 6,
				max: 8
			}
		},
		"IE <9": {
			product: 'IE',
			versions: {
				min: 0,
				max: 8
			}
		},
		"IE <11": {
			product: 'IE',
			versions: {
				min: 0,
				max: 10
			}
		},
		"IE > 8": {
			product: 'IE',
			versions: {
				min: 9,
				max: Number.MAX_VALUE
			}
		},
		"IE 8+": {
			product: 'IE',
			versions: {
				min: 8,
				max: Number.MAX_VALUE
			}
		},
		"IE 8 + ": {
			product: 'IE',
			versions: {
				min: 8,
				max: Number.MAX_VALUE
			}
		},
		"IE10+": {
			product: 'IE',
			versions: {
				min: 10,
				max: Number.MAX_VALUE
			}
		},
		"Chrome 42+": {
			product: 'Chrome',
			versions: {
				min: 42,
				max: Number.MAX_VALUE
			}
		},
		"Firefox": {
			product: 'Firefox',
			versions: {
				min: 0,
				max: Number.MAX_VALUE
			}
		},
		"Flash 9+": {
			product: 'Flash',
			versions: {
				min: 9,
				max: Number.MAX_VALUE
			}
		},
	};

	let invalidCases = [
		"6",
		"-IE6",
		"IE6>"
	];

	Object.keys(validCases).forEach((key) => {
		it('should parse "' + key + '"', function () { assert.deepEqual(parseProductVersionString(key), validCases[key]) });
	});

	invalidCases.forEach((key) => {
		it('should not parse "' + key + '"', function () { assert.equal(parseProductVersionString(key), null) });
	});
});