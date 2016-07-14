export function pivot(columns, numRows) {
	var rows = [];

	for (var i = 0; i < numRows; ++i) {
		var feature = columns[0].features[i].name;
		var featureSupport = [];

		columns.forEach(function (column) {
			let support = JSON.parse(JSON.stringify(column.features[i].support))

			if (column.isYourColumn) {
				support.isYours = true;
			}

			featureSupport.push(support);
		});

		rows.push({
			feature: feature,
			support: featureSupport
		});
	}

	return rows;
}

function columnsAreMajorVersion(columns) {
	let first = columns[0];
	let last = columns[columns.length - 1];

	if (Math.floor(+first.version) != Math.floor(+last.version)) {
		return false;
	}

	// we know that our columns all share a major version, but if the previous or next
	// columns also share that major version then we aren't *exclusively* that major version
	if (first.prevVersion != undefined && Math.floor(first.prevVersion) == Math.floor(+first.version)) {
		return false;
	} else if (last.nextVersion != undefined && Math.floor(last.nextVersion) == Math.floor(+last.version)) {
		return false;
	} else {
		return true;
	}
}

function combineColumnsIntoGroup(columns) {
	if (columns.length == 1) {
		return columns[0];
	} else if (columnsAreMajorVersion(columns)) {
		return {
            name: columns[0].name,
            version: '' + Math.floor(columns[0].version) + '.x',
            icon: columns[0].icon,
            features: columns[0].features
        };
	} else if (columns.length == 2 && !columns[columns.length - 1].isNewest) {
        var versions = columns.map(function (c) { return c.version; }).join(", ");

        return {
            name: columns[0].name,
            version: versions,
            icon: columns[0].icon,
            features: columns[0].features
        };
	} else if (columns.length == 2 && columns[columns.length - 1].isNewest) {
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

		if (columns[0].isOldest && columns[0].version == "1") {
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