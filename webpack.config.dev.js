const path = require("path")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: path.join(__dirname, "src/FeatureMatrix.js"),

    output: {
        filename: "FeatureMatrix.js",
        libraryTarget: 'umd',
        library: 'FeatureMatrix',
        path: path.join(__dirname, "dist")
    },

    module: {
        rules: [
            {
                include: /\.(js|jsx)$/,
                use: [
                    { loader: "babel-loader" }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    "css-loader",
                    "postcss-loader",
                    "sass-loader"
                ]
            }
        ]
    },

    resolve: {
		modules: ["src", "node_modules"],
		extensions: [".json", ".js", ".jsx"]
	},

    plugins: [
        new MiniCssExtractPlugin({
            filename: 'FeatureMatrix.css',
        })
    ]
}
