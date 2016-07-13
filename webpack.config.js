const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');

const parts = require('./libs/parts');
const pkg = require('./package.json');

const TARGET = process.env.npm_lifecycle_event;

const PATHS = {
  app: path.join(__dirname, 'app'),
  style: [
    // path.join(__dirname, 'node_modules', 'purecss'),
    path.join(__dirname, 'app', 'public', 'styles', 'style.css')
  ],
  fonts: path.join(__dirname, 'app', 'public', 'fonts'),
  build: path.join(__dirname, 'build')
};

process.env.BABEL_ENV = TARGET;

const common = merge(
  {
    entry: {
      // Entry accepts a path or an object of entries
      // We'll be using the latter form given it's 
      // convenient with more complex configs
      style: PATHS.style,
      // fonts: PATHS.fonts,
      app: PATHS.app
    },
    output: {
      path: PATHS.build,
      filename: '[name].js'
    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Is Your Website Better Than Doom?',
        template: require('html-webpack-template'),
        appMountId: 'app',
        inject: false
      })
    ]
  },
  parts.loadJSX(PATHS.app),
  parts.lintJSX(PATHS.app)
);

var config;

//Detect how npm is run and branch based onthat switch 
switch(TARGET) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          // This is used for require.ensure. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
      },
      parts.clean(PATHS.build),
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      parts.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg.dependencies)
        // automatically load all the dependencies 
      }),
      parts.minify(),
      parts.extractCSS(PATHS.style),
      parts.extractFonts(PATHS.fonts)//,
      // parts.purifyCSS([PATHS.app])
    );
    break;
  default:
    config = merge(
      common, 
      {
        devtool: 'eval-source-map'
      },
      parts.setupCSS(PATHS.style),
      parts.setupFonts(PATHS.fonts),
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: 2000
      })
    );
}


// leanpub-start-remove
// module.exports = validate(config);
// leanpub-end-remove

// run validator in quiet mode to avoid output in stats
module.exports = validate(config, {
  quiet: true
});