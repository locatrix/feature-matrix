import $ from 'jquery';
import browserFeatureProviders from './featureProviders';
import { browsers } from './browsers';
import FeatureMatrixRequirements from './FeatureMatrixRequirements';
import { pivot, groupColumns } from './columns';

// can't use export default syntax due to UMD library shenanigans with webpack,
// we set module.exports at the bottom of the file instead.
class FeatureMatrix {
	// hello fancy ES6 syntax for specifying default options
	// https://gist.github.com/ericelliott/f3c2a53a1d4100539f71
	constructor(mountpoint, requirements, {
		supportedText = '\u2714',
		unsupportedText = '-',
		unknownText = '?',
		featureColumnLabel = 'Feature',
		pluginRequirementGenerator = (plugin, version) => `Requires the installation of ${plugin} ${version}` 
	} = {}) {
		this.mountpoint = $(mountpoint);
		Object.assign(this, { 
			requirements, supportedText, unsupportedText, unknownText, 
			featureColumnLabel, pluginRequirementGenerator 
		});

		requirements.onLoad((r) => {
			this.render();
		});
	}

	render() {
		let table = $("<table>");
		let columns = [];

		Object.keys(browsers).forEach((browser) => {
			let cols = this.requirements.getBrowserSupport(browser, this.pluginRequirementGenerator);
			columns = columns.concat(cols);
		});

		columns = groupColumns(columns);

		let rows = pivot(columns, this.requirements.features.length);

		let header = $("<thead>");
		header.append("<th>" + this.featureColumnLabel + "</th>");

		columns.forEach(col => header.append("<th>" + col.name + " " + col.version + "</th>"));

		table.append(header);

		let body = $("<tbody>");

		// first pass to pull out any conditions and map them to superscript numbers
		let conditions = {};
		let conditionsInOrder = [];
		let nextCondition = 1;
		rows.forEach((row) => {
			row.support.forEach((s) => {
				if (s.support == 'conditional') {
					if (s.conditions) {
						s.conditions.forEach((c) => {
							if (!conditions[c]) {
								conditions[c] = nextCondition++;
								conditionsInOrder.push(c);
							}
						});
					}
				}
			});
		});

		rows.forEach((row) => {
			let tr = $("<tr>");
			tr.append("<td>" + row.feature + "</td>");

			row.support.forEach((s) => {
				switch (s.support) {
					case 'supported':
						tr.append("<td>" + this.supportedText + "</td>");
						break;

					case 'unsupported':
						tr.append("<td>" + this.unsupportedText + "</td>");
						break;

					case 'conditional': {
						let superscripts = [];
						if (s.conditions) {
							s.conditions.forEach((c) => {
								superscripts.push('' + conditions[c]);
							});
						} else {
							superscripts.push('*');
						}

						tr.append("<td>" + this.supportedText + "<sup>" + superscripts.join('') + "</sup></td>");
						break;
					}

					default:
						tr.append("<td>" + this.unknownText + "</td>");
						break;
				}
			});

			body.append(tr);
		});

		table.append(body);

		this.mountpoint.append(table);

		// add superscript values
		let conditionsList = $('<div class="conditions">');

		for (let [i, c] of conditionsInOrder.entries()) {
			conditionsList.append($("<p><sup>[" + (i + 1) + "]</sup> " + c + "</li>"));
		}

		this.mountpoint.append(conditionsList);
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
