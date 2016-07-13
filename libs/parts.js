const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');
const file = require('file-loader');

exports.devServer = function(options) {
  return {
     devServer: {
       // Enable history API fallback so HTML5 history api based routing works. 
       // This is a good default that will come in handy in complicated set ups
       historyApiFallback: true,
      
       //Does not set the Hotmodulereplacementplugin 
       hot: true,
       inline: true,

       stats: 'errors-only',

       host: options.host,
       port: options.port // Defaults to localhost, 8080
     },
     plugins: [
       new webpack.HotModuleReplacementPlugin({
         multiStep: true
       })
     ]
  };
}
/*
mooooooo
pim was here
    _
.__(.)< (MEOW)
 \___)
~~~~~~~~~~~~~~~~~~~
*/

/* css-loader will resolve @import and url statements in our CSS files. 
style-loader deals with require statements in our JavaScript.
A similar approach works with CSS preprocessors, like Sass and Less
, and their loaders. */

exports.setupCSS = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          include: paths
        }
      ]
    }
  }
}

exports.setupFonts = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.ttf$/,
          loader: 'file',
          include: paths
        }
      ]
    }
  }
}

exports.minify = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  };
}

exports.setFreeVariable = function(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  };
}

exports.extractBundle = function(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    //Define an entry point needed for splitting.
    entry: entry,
    plugins: [
      // Extract bundle and manifest fiesl. Manifest is
      // needed for reliable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name, 'manifest']
      })
    ]
  };
}

exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        // Without `root` CleanWebpackPlugin won't point to our
        // project and will fail to work.
        root: process.cwd()
      })
    ]
  };
}

exports.extractCSS = function(paths) {
  return {
    module: {
      loaders: [
        //Extract CSS during build
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css'),
          include: paths
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  };
}

exports.extractFonts = function(paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.ttf$/,
          loader: 'file',
          query: {
            name: 'fonts/[name].[hash].[ext]'
          },
          include: paths
        }
      ]
    }
  };
}

exports.purifyCSS = function(paths) {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        // `paths` is used to point PurifyCSS to files
        // not visible to Webpack. You can pass glob patterns
        // to it
        paths: paths
      }),
    ]
  };
}

exports.loadJSX = function(include) {
  return {
    module: {
      loaders: [
        {
          test: /\.(js|jsx)$/,
          // Enable caching for extra performance
          loaders: ['babel?cacheDirectory'],
          include: include
        }
      ]
    }
  };
}

exports.lintJSX = function(include) {
  return {
    module: {
      preLoaders: [
        {
          test: /\.(js|jsx)$/,
          loaders: ['eslint'],
          include: include
        }
      ]
    }
  };
}

