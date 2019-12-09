var path = require('path');
const config =  require('./config')
const os = require('os');
const merge = require('webpack-merge');
const WebpackBaseConfig = require('./webpack.base.conf');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
let dServe = null;
let hadFinishd = false

const DevWebpackConfig = merge(WebpackBaseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, '..', 'dist'),
    compress: true,
    // // 控制台初始启动信息之外都不显示
    // quiet: true,
    host: config.dev.host,
    port: config.dev.port,
    noInfo: true,
    stats: "errors-only",
    open: config.dev.autoOpenBrowser,
    clientLogLevel: 'none',
    hot: true,
    overlay: config.dev.showsErrFullScreen,
    proxy: config.dev.proxy,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 500,
      poll: 500
    },
    after (app, server) {
      dServe = server
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, '..', 'public/index.html')
    }),
    // webpack编译进度(还可使用 Friendly-errors-webpack-plugin 插件)
    config.dev.terminalProcess === 'bar'
      ? new ProgressBarPlugin({
          complete: '-',
          format: '  build [:bar] :percent (:elapsed seconds)',
          clear: false
        })
      : new webpack.ProgressPlugin(processHandler)
    ,
    // 热更新
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
})

module.exports = DevWebpackConfig

function getIPAdress () {
  let localIPAddress = '';
  let interfaces = os.networkInterfaces();
  for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        localIPAddress = alias.address;
      }
    }
  }
  return localIPAddress
}

// 打印服务启动的地址以及一些提示
function terminalLog (server) {

  let devServer = server.compiler.options.devServer;
  console.log('Use \033[40;33mCtrl+C\033[0m to close it\r\n')
  if (devServer.host === 'localhost') {
    console.log(
      'App running at:\n' +
      '- Local:   \033[40;35mhttp://localhost:' + devServer.port +'/\033[0m\n' +
      '           \033[40;35mhttp://127.0.0.1:' + devServer.port +'/\033[0m\r\n'
    )
  } else if (devServer.host === '0.0.0.0') {
    console.log(
      'App running at:\n' +
      '- Local:   \033[40;35mhttp://localhost:' + devServer.port +'/\033[0m\n' +
      '           \033[40;35mhttp://' + devServer.host + ':' + devServer.port +'/\033[0m\n' +
      '- Network: \033[40;35mhttp://' + getIPAdress() + ':' + devServer.port +'/\033[0m\r\n'
    )
  } else {
    console.log(
      'App running at:\n' +
      '- Network: \033[40;35mhttp://' + devServer.host + ':' + devServer.port +'/\033[0m\r\n'
    )
  }
  console.log('In production mode you need to run\033[40;34m npm run build\033[0m\n')
}

// 打印编译、打包进度（terminalProcess值为default时启用）
let firstInfo = false
function processHandler (percentage, message, ...args) {
  const process = require('process');
  if (percentage <= 0 && !firstInfo) {
    firstInfo = true
    console.log('\033[44;30m Info \033[0m \033[40;34m Compiling...\033[0m\n')
  }
  process.stdout.write(`${percentage.toFixed(2) * 100}% building message:${message}\r`)
  if (percentage >= 1 && hadFinishd) {
    firstInfo = false
    console.log('\n\033[42;30m Done \033[0m \033[40;32m Successful compilation\n')
  }
}

const compiler = webpack(DevWebpackConfig);
compiler.run((err, stats) => {
  if (config.dev.terminalProcess !== 'bar') {
    hadFinishd = true
    console.log('\n\033[42;30m Done \033[0m \033[40;32m Successful compilation in '+ (stats.endTime - stats.startTime) + 'ms \033[0m\n')
  }
  terminalLog(dServe)
})