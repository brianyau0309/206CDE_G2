const path = require("path")

module.exports = {
  entry: {
    'client': [path.resolve(__dirname, 'src/client/App.jsx')],
    'staff': [path.resolve(__dirname, 'src/staff/App.jsx')],
    'kitchen': [path.resolve(__dirname, 'src/kitchen/App.jsx')]
  },
  output: {
    path: path.resolve(__dirname, 'static/js'),
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [{
      test: /\.jsx$/,
      use: [{ loader: 'babel-loader',
              options: { presets: ['@babel/preset-react'] }
           }]
    }]
  },
  devtool: 'source-map'
}
