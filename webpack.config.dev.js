var path = require("path");
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
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
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!sass-loader")
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

    plugins: [
        new ExtractTextPlugin("[name].css")
    ]
};
