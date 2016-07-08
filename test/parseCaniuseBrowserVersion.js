import assert from 'assert';
import { expect } from 'chai';
import parseCaniuseBrowserVersion from '../src/parseCaniuseBrowserVersion';

describe('parseCaniuseBrowserVersion', () => {
	let cases = {
		"9.1-9.5": [9.1, 9.2, 9.3, 9.4, 9.5],
		"10.4-10.4": [10.4],
		"10-12": [10, 11, 12],
		"3": [3],
		"TP": [],
		"4.4.3-4.4.5": [4.4],
		"3.2":  [3.2]
	};

	Object.keys(cases).forEach((key) => {
		it('should parse "' + key + '" to the versions [' + cases[key].join(", ") + ']', function () { 
			let versions = [];
			parseCaniuseBrowserVersion(key, (ver) => versions.push(ver));

			assert.deepEqual(cases[key], versions) 
		});
	});
});
