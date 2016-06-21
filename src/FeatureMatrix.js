import browserFeatureProviders from './featureProviders';
import { browsers } from './browsers';
import FeatureMatrixRequirements from './FeatureMatrixRequirements';
import { pivot, groupColumns } from './columns';

var plugins = {
	'Flash': {
		'blacklist': [
			'Mobile Safari',
			'Opera Mini',
			'Android Chrome'
		],
		'whitelist': [
			'IE',
			'Chrome',
			'Firefox',
			'Safari',
			'Opera',
			'Edge'
		]
	}
};

// can't use export default syntax due to UMD library shenanigans with webpack,
// we set module.exports at the bottom of the file instead.
class FeatureMatrix {
	constructor(mountpoint, requirements) {
		this.mountpoint = $(mountpoint);
		this.requirements = requirements;

		requirements.onLoad((r) => {
			this.render();
		});
	}

	render() {
		let table = $("<table>");
		let columns = [];

		Object.keys(browsers).forEach((browser) => {
			columns = columns.concat(this.requirements.getBrowserSupport(browser));
		});

		columns = groupColumns(columns);

		let rows = pivot(columns, this.requirements.features.length);

		let header = $("<thead>");
		header.append("<th>Feature</th>");

		columns.forEach(col => header.append("<th>" + col.name + " " + col.version + "</th>"));

		table.append(header);

		let body = $("<tbody>");

		rows.forEach((row) => {
			let tr = $("<tr>");
			tr.append("<td>" + row.feature + "</td>");

			row.support.forEach((s) => {
				switch (s.support) {
					case 'supported':
						tr.append("<td>Y</td>");
						break;

					case 'unsupported':
						tr.append("<td>X</td>");
						break;

					default:
						tr.append("<td>?</td>");
						break;
				}
			});

			body.append(tr);
		});

		table.append(body);

		this.mountpoint.append(table);
	}

	static loadRequirements(requirements, onComplete) {
		if (typeof requirements == 'string' || requirements instanceof String) {
			// load from URL
			$.ajax({
				url: requirements,
				error: (xhr, textStatus, errorThrown) => {
					onComplete({ status: textStatus, error: errorThrown });
				},
				success: (data) => {
					onComplete(null, new FeatureMatrixRequirements(data));
				}
			});
		} else {
			// already got some JSON
			onComplete(null, new FeatureMatrixRequirements(requirements));
		}
	}
}

module.exports = FeatureMatrix;
