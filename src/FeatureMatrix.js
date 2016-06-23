import $ from 'jquery';
import browserFeatureProviders from './featureProviders';
import { browsers } from './browsers';
import FeatureMatrixRequirements from './FeatureMatrixRequirements';
import { pivot, groupColumns } from './columns';

require('./featureMatrix.scss')

function getBrowsers(columns) {
	var browsers = [];

	for (let c of columns) {
		if (browsers.length == 0 || browsers[browsers.length - 1].name != c.name) {
			browsers.push({
				name: c.name,
				icon: c.icon,
				span: 1
			});
		} else {
			browsers[browsers.length - 1].span += 1;
		}
	}

	return browsers;
}

// can't use export default syntax due to UMD library shenanigans with webpack,
// we set module.exports at the bottom of the file instead.
class FeatureMatrix {
	// hello fancy ES6 syntax for specifying default options
	// https://gist.github.com/ericelliott/f3c2a53a1d4100539f71
	constructor(mountpoint, requirements, {
		supportedText = '\u2714',
		partialText = '\u2714',
		unsupportedText = '-',
		unknownText = '?',
		featureColumnLabel = 'Feature',
		pluginRequirementGenerator = (plugin, version) => `Requires the installation of ${plugin} ${version}` 
	} = {}) {
		this.mountpoint = $(mountpoint);
		Object.assign(this, { 
			requirements, supportedText, unsupportedText, unknownText, 
			featureColumnLabel, pluginRequirementGenerator, partialText
		});

		requirements.onLoad((r) => {
			this.render();
		});
	}

	render() {
		this.mountpoint.addClass("feature-matrix");

		let table = $('<table>');
		let columns = [];

		Object.keys(browsers).forEach((browser) => {
			let cols = this.requirements.getBrowserSupport(browser, this.pluginRequirementGenerator);
			columns = columns.concat(cols);
		});

		columns = groupColumns(columns);

		let rows = pivot(columns, this.requirements.features.length);

		let header = $("<thead>");
		let browserHeaderRow = $("<tr>");
		let versionHeaderRow = $("<tr>");

		header.append(browserHeaderRow);
		header.append(versionHeaderRow);

		browserHeaderRow.append('<th rowspan="2" class="feature">' + this.featureColumnLabel + "</th>");

		getBrowsers(columns).forEach((b) => {
			browserHeaderRow.append('<th colspan="' + b.span + '" class="browser"><img src="' + b.icon + '" alt="" /><br />' + b.name + "</th>")
		});

		// the image is purely decorative, so we use an empty alt="" attribute
		columns.forEach(col => versionHeaderRow.append('<th class="version">' + col.version + "</th>"));

		table.append(header);

		let body = $("<tbody>");

		// first pass to pull out any conditions and map them to superscript numbers
		let conditions = {};
		let conditionsInOrder = [];
		let nextCondition = 1;
		rows.forEach((row) => {
			row.support.forEach((s) => {
				if (s.conditions) {
					s.conditions.forEach((c) => {
						if (!conditions[c]) {
							conditions[c] = nextCondition++;
							conditionsInOrder.push(c);
						}
					});
				}
			});
		});

		const getSuperscripts = (supportColumn) => {
			let superscripts = [];
			if (supportColumn.conditions) {
				supportColumn.conditions.forEach((c) => {
					superscripts.push('' + conditions[c]);
				});
			}

			return superscripts;
		};

		const toObj = (arr) => {
			let obj = {};

			for (let item of arr) {
				obj[item] = true;
			}

			return obj;
		};

		// http://stackoverflow.com/questions/34392741/best-way-to-get-intersection-of-keys-of-two-objects
		const intersect = (a, b) => {
			return Object.keys(a).filter({}.hasOwnProperty.bind(b));
		};

		const getCommonSuperscrips = (row) => {
			let intersection = null;

			for (let column of row.support) {
				if (intersection == null) {
					intersection = toObj(getSuperscripts(column));
				} else {
					intersection = toObj(intersect(intersection, toObj(getSuperscripts(column))));
				}
			}

			return intersection;
		};

		const renderSuperscripts = (supportColumn, exclude) => {
			let superscripts = null;

			if (supportColumn instanceof Array) {
				superscripts = supportColumn;
			} else {
				superscripts = getSuperscripts(supportColumn).filter(ss => !exclude[ss]);
			}

			superscripts.sort();

			if (superscripts.length > 0) {
				return "<sup>" + superscripts.join(',') + "</sup>";
			} else {
				return '';
			}
		};

		rows.forEach((row) => {
			let tr = $("<tr>");

			//let common = getCommonSuperscrips(row);
			let common = {};

			tr.append('<td class="feature"><span>' + row.feature + '</span>' + renderSuperscripts(Object.keys(common), {}) + "</td>");

			row.support.forEach((s) => {
				switch (s.support) {
					case 'supported':
						tr.append('<td class="support supported"><span>' + this.supportedText + "</span>" + renderSuperscripts(s, common) + "</td>");
						break;

					case 'partial':
						tr.append('<td class="support partial"><span>' + this.partialText + "</span>" + renderSuperscripts(s, common) + "</td>");
						break;

					case 'unsupported':
						tr.append('<td class="support unsupported"><span>' + this.unsupportedText + "</span>" + renderSuperscripts(s, common) + "</td>");
						break;

					default:
						tr.append('<td class="support unknown"><span>' + this.unknownText + "</span>" + renderSuperscripts(s, common) + "</td>");
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
