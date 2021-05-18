const path = require('path');
const webpack = require('webpack')
const CopywebpackPlugin = require('copy-webpack-plugin');


const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
  pages: {
    login: {
      entry: 'src/pages/login/main.js',
      title: '设备运维平台登录'
    },
    index: {
      entry: 'src/pages/home/main.js',
      title: '橙魔方设备运维平台'
    },
  },
  devServer: {
    proxy: {
      '/apiPathLogin': {
        target: 'http://10.10.254.178:6624/', // 10.10.254.131:30687 --k8s
        changeOrigin: true,
        ws: true,
        pathRewrite: {'^/apiPathLogin': ''}
      },
      '/apiPath': {
        target: 'http://10.10.254.178:6624/',// 10.10.254.178:6624 -lcp //http://10.10.254.158:6624/--tt
        changeOrigin: true,
        ws: true,
        pathRewrite: {'^/apiPath': ''}
      },
      '/attach-server': {
        target: 'http://10.10.254.138:8888/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {'^/attach-server': ''}
      },
      '/mapBaidu': {
        target: 'http://api.map.baidu.com/geocoder',
        changeOrigin: true,
        pathRewrite: { '^/mapBaidu': '' }
      },
    },
    //host: 'localhost',
    port: 8082,
    open: true,
    openPage: 'login.html'
  },
  configureWebpack: {
    output: {
      sourcePrefix: ''
    },
    amd: {
        toUrlUndefined: true
    },
    node: {
        fs: 'empty'
    },
    resolve: {
      alias: {
          cesium: path.resolve(__dirname, cesiumSource)
      }
    },
    plugins: [
      new CopywebpackPlugin([ { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' } ]),
      new CopywebpackPlugin([ { from: path.join(cesiumSource, 'Assets'), to: 'Assets' } ]),
      new CopywebpackPlugin([ { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' } ]),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify('')
      })
    ],
  }
};
