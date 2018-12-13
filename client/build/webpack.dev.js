const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BaseConfig = require('./webpack.base.js');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

module.exports = merge(BaseConfig, {
    devtool: '#eval-source-map',
    mode: 'development',

    plugins: [
        new CleanWebpackPlugin([ './server/www' ], {
            root: path.join(__dirname, '../../'),
            verbose: true  // Write logs to console.
        }),
        new HtmlWebpackPlugin({
            filename: resolve('../server/www/index.html'),
            template: './index.html',
            title: 'vue-test',
            inject: true
        })
    ]
});
