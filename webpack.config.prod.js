var webpack = require('webpack');
var config = require('./webpack.config.dev');

module.exports = Object.assign(config, {
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin()
    ]
});
