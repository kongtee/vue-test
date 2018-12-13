const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('============================start===============================');
console.log(__dirname);

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}
module.exports = {
    entry: {
        app: './index.js',
        vendor: ['vue', 'vue-router', 'vuex']
    },
    output: {
        filename: 'static/js/[name]-[chunkHash:5].js',
        path: resolve('../server/www'),
        publicPath: '/'
    },

    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@Common': path.resolve(__dirname, './../common'),
            '@Assets': path.resolve(__dirname, './../assets'),
            '@Views': path.resolve(__dirname, './../views')
        }
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            outputPath: 'static/images/'
                        }
                    }
                ]
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: resolve('../server/view/index_index.html'),
            template: './index.html',
            title: 'vue-test',
            inject: true,
            favicon: './assets/favicon.ico'
        })
    ]
};
