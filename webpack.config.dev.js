var path = require("path");
var webpack = require('webpack');
var entries = [];
var devtool = 'source-map';

module.exports = {
    devtool: 'source-map',
    entry: path.join(__dirname, "src/FeatureMatrix.js"),

    output: {
        filename: "FeatureMatrix.js",
        libraryTarget: 'umd',
        library: 'FeatureMatrix',
        path: path.join(__dirname, "dist")
    },

    module: {
        loaders: [
            {
                include: /\.(js|jsx)$/,
                loaders: ["babel"],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
		modulesDirectories: [
			"src",
			"node_modules"
		],
		extensions: ["", ".json", ".js", ".jsx"]
	},
};
