export function pivot(columns, numRows) {
	var rows = [];

	for (var i = 0; i < numRows; ++i) {
		var feature = columns[0].features[i].name;
		var featureSupport = [];

		columns.forEach(function (column) {
			featureSupport.push(column.features[i].support);
		});

		rows.push({
			feature: feature,
			support: featureSupport
		});
	}

	return rows;
}

function combineColumnsIntoGroup(columns) {
	if (columns.length == 1) {
		return columns[0];
	}  else if (columns.length == 2 && columns[columns.length -1].isNewest) {
		// special case for only two columns if they're the two most recent versions
		// (instead of X,Y we show X+)
		return {
			name: columns[0].name,
			version: columns[0].version + "+",
			icon: columns[0].icon,
			features: columns[0].features
		};
	} else {
		var version = columns[0].version + " - " + columns[columns.length - 1].version;

		if (columns[0].isOldest) {
			version = "< " + columns[columns.length - 1].nextVersion;
		}

		if (columns[columns.length - 1].isNewest) {
			version = columns[0].version + "+";
		}

		return {
			name: columns[0].name,
			version: version,
			icon: columns[0].icon,
			features: columns[0].features
		};
	}
}

function columnsAreGroupable(a, b) {
	if (a.name != b.name || a.features.length != b.features.length) {
		return false;
	}

	// HACK: quick and dirty way to deeply compare objects but is very
	//       dependent on the order of serialization
	return JSON.stringify(a.features) == JSON.stringify(b.features);
}

// takes columns of IE6, IE7, IE8, IE9, etc and groups them into columns
// of IE6-IE8, IE9 (etc) based on whether those columns all have the same
// compatibility
export function groupColumns(columns) {
	let grouped = [];
	let currGroup = null;

	columns.forEach(function (column) {
		if (currGroup == null) {
			currGroup = [ column ];
		} else if (columnsAreGroupable(currGroup[currGroup.length - 1], column)) {
			// this column has the same compatibility/browser as the previous
			// one so add it in
			currGroup.push(column);
		} else {
			// this is different, push the current group into our list and
			// create a new group
			grouped.push(combineColumnsIntoGroup(currGroup));
			currGroup = [ column ];
		}
	});

	if (currGroup != null && currGroup.length > 0) {
		grouped.push(combineColumnsIntoGroup(currGroup));
	}

	return grouped;
}