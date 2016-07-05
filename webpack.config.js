var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  // entry: [
  //   // 'webpack-hot-middleware/client',
  //   './app/index.es6'
  // ],
  // output: {
  //   path: path.join(__dirname, 'dist'),
  //   filename: 'bundle.js',
  //   publicPath: '/static/'
  // },
  // devServer: {
  //   // contentBase: './public',
  //   historyApiFallback: true
  // },

  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    `./app/index.es6`
  ],
  output: {
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  // resolve: {
  //   modulesDirectories: [cwd, 'node_modules'],
  //   extensions: ['', '.js', '.jsx', '.json']
  // },
  devServer: {
    contentBase: './public',
    hot: true,
    historyApiFallback: true,
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.es6$/,
        exclude: /node_modules/,
        loader: 'react-hot!babel',
        include: __dirname
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: ['style', 'css', 'sass']
      },
      // {
      //   test: /\.svg$/,
      //   loader: 'file',
      //   include: PATHS.assets
      // },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: 'style!css'
      },
      // {
      //   test: [/fontawesome-webfont\.svg/, /fontawesome-webfont\.eot/, /fontawesome-webfont\.ttf/, /fontawesome-webfont\.woff/, /fontawesome-webfont\.woff2/],
      //   loader: 'file?name=fonts/[name].[ext]',
      //   include: /node_modules/
      // }
    ]
  }
}

// const PATHS = {
//   app: path.join(__dirname, 'app'),
//   public: path.resolve(__dirname, 'public'),
//   assets: path.join(__dirname, 'app/assets')
// };

// const config = {
//   entry: {
//     app: './app/js/app.bundle.es6'
//   },
//   output: {
//     path: PATHS.public,
//     publicPath: '/',
//     filename: 'bundle.js'
//   },
//   devServer: {
//     contentBase: './public',
//     historyApiFallback: true
//   },
//   devtool: 'eval-source-map',
//   noInfo: true,
//   module: {
//     loaders: [
//       {
//         test: /\.es6?$/,
//         exclude: /node_modules/,
//         loader: 'babel'
//       },
//       {
//         test: /\.scss$/,
//         loaders: ['style', 'css', 'sass']
//       },
//       {
//         test: /\.svg$/,
//         loader: 'file',
//         include: PATHS.assets
//       },
//       {
//         test: /\.css$/,
//         loader: 'style!css'
//       }, 
//       {
//         test: /\.html$/,
//         loader: 'ngtemplate?relativeTo=' + PATHS.app + '/!html'
//       },
//       {
//         test: [/fontawesome-webfont\.svg/, /fontawesome-webfont\.eot/, /fontawesome-webfont\.ttf/, /fontawesome-webfont\.woff/, /fontawesome-webfont\.woff2/],
//         loader: 'file?name=fonts/[name].[ext]',
//         include: /node_modules/
//       }
//     ]
//   },
//   plugins: [
//     new webpack.ProvidePlugin({
//       $: 'jquery',
//       jQuery: 'jquery'
//     })
//   ]
// };

// module.exports = config;