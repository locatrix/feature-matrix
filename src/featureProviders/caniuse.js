import $ from 'jquery';
import { parseBrowserName } from '../browsers';

export default function caniuseProvider(featureName, onComplete) {
	console.log('caniuse looking up', featureName);

	$.ajax({
		url: 'http://api.browserfeatures.io/v1/feature/' + featureName,
		error: function (xhr, textStatus, errorThrown) {
			onComplete({ status: textStatus, error: errorThrown });
		},
		success: function (data) {
			if (data.error) {
				onComplete(data);
			} else {
				// normalise the caniuse browser information into something 
				// we can deal with
				var res = {};

				for (var key in data.browsers) {
					if (!data.browsers.hasOwnProperty(key)) {
						continue;
					}

					var parsed = parseBrowserName(key);

					if (!parsed) {
						continue;
					}

					var info = data.browsers[key];

					res[parsed] = {
						supported: info.supported,
						since: info.since
					};
				}

				onComplete(null, res);
			}
		}
	});
}
