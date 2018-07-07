const VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const WebpackDeleteAfterEmit = require('webpack-delete-after-emit');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {DefinePlugin, NormalModuleReplacementPlugin} = require('webpack');
const Path = require('path');
const Filehound = require('filehound');
const themes = Filehound
                .create()
                .path('node_modules/bootswatch/dist')
                .directory()
                .findSync()
                .map(dirname=>dirname.replace(/.*\//,''));

module.exports = themes.map(theme=>({
    mode: 'none',
    entry: './src/index.js',
    output: {
        path: Path.resolve(__dirname,'docs',theme),
        filename: 'bundle.js'
    },
    module:{
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: ['env']
                }
            }]
        },{
            test: /\.css/,
            use: [{
                loader: MiniCssExtractPlugin.loader
            }, {
                loader: 'css-loader',
                options: {
                    minimize: true
                }
            }]
        }, {
            test: /\.vue$/,
            use: [{
                loader: 'vue-loader'
            }]
        }]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'bundle.css'
        }),
        new HtmlWebpackPlugin({
            title: 'VueWiki',
            filename: 'index.html',
            inlineSource: '\.(js|css)$',
            template: 'src/index.html'
        }),
        new HtmlWebpackInlineSourcePlugin(),
        new VueLoaderPlugin(),
        new NormalModuleReplacementPlugin(
            /AsyncLoad\.js/,
            function (resource) {
                resource.request = resource.request.replace(/AsyncLoad/,"AsyncLoad-disabled");
            }
        ),
        new WebpackDeleteAfterEmit({
            globs: ['bundle.*']
        }),
        new DefinePlugin({
            THEME: JSON.stringify(theme)
        }),
        new CopyWebpackPlugin([
            { from: 'docs/*.md', to: '[name].[ext]' },
            { from: 'README.md', to: 'index.md' }
        ])
    ]
}));