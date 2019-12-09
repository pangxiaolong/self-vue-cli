const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const env = process.env.NODE_ENV.trim();
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        app: './src/main.js' //基本入口
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'js/[name].js'
    },
    resolve: { //配置模块如何解析
        alias: { //创建 import 或 require 的别名
            "@": path.join(__dirname, '..', 'src')
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    env !== 'production'
                        ? 'vue-style-loader'
                        : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        // importLoaders为 1 时 @import引入的css不会添加兼容写法
                        options: { importLoaders: 2 }
                    },
                    'postcss-loader'
                ]
            },
            {
                enforce: 'pre',
                test: /\.(js|vue)$/,
                loader: 'eslint-loader',
                options: {
                    formatter: require('eslint-formatter-pretty')
                },
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                use: 'vue-loader'
            },
            {
                test: /\.js?$/,
                use: 'babel-loader',
                exclude: file => (
                    /node_modules/.test(file) &&
                    !/\.vue\.js/.test(file)
                )
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000
                        }
                    }
                ]
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        // 清除 dist 文件
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        // CSS 提取
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/chunk[name][hash:7].css',
            ignoreOrder: true
        })
    ]
}