import xhr from 'xhr';
import { parseBrowserName } from '../browsers';

export default function caniuseProvider(featureName, onComplete) {
	console.log('caniuse looking up', featureName);

	xhr({
		uri: 'https://cdn.rawgit.com/Fyrd/caniuse/master/features-json/' + featureName + '.json',
		useXDR: true
	}, function (err, resp, body) {
		if (err) {
			onComplete({ statusCode: err.statusCode, error: err.body});
		} else {
			var data = JSON.parse(body);

			// normalise the caniuse browser information into something 
			// we can deal with
			var res = {};

			for (const key of Object.keys(data.stats)) {
				const parsed = parseBrowserName(key);

				if (!parsed) {
					continue;
				}

				if (res[parsed]) {
					throw new Error('duplicate browser was parsed');
				}

				const browserInfo = data.stats[key];
				let supported = false;
				let minVersion = Number.MAX_VALUE;
				let maxVersion = Number.MIN_VALUE;

				for (const versionStr of Object.keys(browserInfo)) {
					const value = browserInfo[versionStr];

					if (value[0] != 'y' && value[0] != 'a') {
						continue; // not supported
					}

					// either fully or partially supported, we treat both as
					// being supported and rely on users to add blacklist
					// entries for the times where this assumption isn't ok
					supported = true;
					const version = parseFloat(versionStr);
					if (isNaN(version)) {
						continue;
					}

					minVersion = Math.min(version, minVersion);
					maxVersion = Math.max(version, maxVersion);
				}

				res[parsed] = { supported: supported };

				if (supported) {
					res[parsed].since = minVersion;
				}
			}

			onComplete(null, res);
		}
	});
}
