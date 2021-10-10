const path = require('path');
const webpack = require('webpack')
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
    mode: 'development',
    entry: './assets/js/app.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'public/build'),
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            __VUE_OPTIONS_API__: false,
            __VUE_PROD_DEVTOOLS__: true,
        })
    ],
    devtool: 'source-map'
};