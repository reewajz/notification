const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

/*
|--------------------------------------------------------------------------
| Application-specific Meta Configuration
|--------------------------------------------------------------------------
|
| This part of the build configuration is a layer of abstraction in
| order to reduce complexity for frequent configuration changes.
|
*/

const CONFIG = {
    // Define the entry files, which is usually one
    // file per Lambda handler.
    entryFiles: {
        // entry file for each lambda will go here
        'notification-api': './src/api/lambda/notification-api.ts',
        'notification-converter': './src/notification-converter/lambda/notification-converter.ts',
        'notification-aggregator': './src/notification-converter/lambda/notification-aggregator.ts',
        'notification-dispatcher': './src/notification-dispatcher/lambda/email-dispatcher.ts',
        'bounce-handler': './src/bounce-handler/Lambda/bounce-handler.ts',
    },

    // This is where the distribution bundle will be stored at.
    outputPath: path.join(__dirname, 'dist'),

    // If set to `true`, minification and optimization will be applied.
    production: process.argv.includes('--production'),

    // Those modules will not be bundled ("ignored") and would need to be
    // available on the target system during runtime, if used.
    externalPackages: ['aws-sdk', 'aws-lambda', 'highlight.js', 'sqlite3'],

    // List modules which should be replaced with an empty mock
    // during compile time, e.g. optional modules or drivers.
    // By default, an empty function is used as mock.
    mockedModules: normalizeMocks([
        'pg/lib/native/client',
        // 'mime-types', // See [1] below
        'driver/koa',
        'pg/lib/native/client',
        {
            pattern: 'MongoDriver.js',
            mock: `module.exports = {MongoDriver: function () {}};`
        },
        {
            // TypeORM CLI
            pattern: 'cli-highlight',
            mock: `module.exports = function (s) { return s;}`
        }
    ]),

    // Dedupe the following modules from the bundle, using the most latest version.
    // Use with care. Webpack will report if any modules are duplicated in the bundle.
    dedupeModules: [
        'qs',
        'cookie',
        '@itonics/core',
        '@itonics/edge',
        'uuid',
        'qs',
        'cookie',
        'ansi-regex',
        'ansi-styles',
        'chalk',
        'strip-ansi',
        'debug',
        'is-fullwidth-code-point',
        'isarray',
        'ms',
        'readable-stream',
        'sax',
        'string-width',
        'string_decoder',
        'is-buffer',
        'bluebird',
        'dotenv',
        'uuid',
        'xml2js',
        'xmlbuilder',
        'mkdirp'
    ]
};

/*
|--------------------------------------------------------------------------
| Webpack Configuration
|--------------------------------------------------------------------------
|
| The second part of this file is a flexible Webpack configuration and
| should not be subject to frequent changes.
|
*/

module.exports = {
    entry: CONFIG.entryFiles,
    mode: CONFIG.production ? 'production' : 'development',
    target: 'node',

    // Fail out on the first error instead of tolerating it.
    bail: true,

    output: {
        libraryTarget: 'commonjs',
        path: CONFIG.outputPath,
        filename: '[name].js'
    },

    resolve: {
        extensions: ['.js', '.json', '.ts'],

        // Dedupe modules by using the version in the node_modules root
        alias: CONFIG.dedupeModules.reduce((aliasConfig, moduleName) => {
            aliasConfig[moduleName] = path.resolve(__dirname, `node_modules/${moduleName}`);
            return aliasConfig;
        }, {})
    },

    // Define modules which should not be bundled
    externals: [buildRegExp(CONFIG.externalPackages, true)],
    module: {
        rules: [
            // Transpile TS files
            { test: /\.ts(x?)$/, loader: 'ts-loader' },

            // Return the content of TXT files as string
            { test: /\.txt$/i, use: 'raw-loader' },

            // Mock modules which are too heavy and/or unused
            {
                test: buildRegExp(CONFIG.mockedModules.map((mock) => mock.pattern)),
                use: [
                    {
                        loader: path.join(__dirname, '.bin/mock-loader.js'),
                        options: {
                            mocks: CONFIG.mockedModules,
                            strictMatch: false
                        }
                    }
                ]
            }
        ]
    },

    plugins: [
        new webpack.ProgressPlugin(),
        new DuplicatePackageCheckerPlugin({
            verbose: true,
            emitError: true
        }),
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
    ],

    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                }
            })
        ]
    },

    stats: {
        warningsFilter: (w) => w !== 'CriticalDependenciesWarning'
    }
};

/*
|--------------------------------------------------------------------------
| Helper Methods
|--------------------------------------------------------------------------
*/

function buildRegExp(packageNames, strict = false) {
    if (strict) return new RegExp(`^(${packageNames.join('|')})$`, 'i');
    return new RegExp(`(${packageNames.join('|')})`, 'i');
}

function normalizeMocks(mocks) {
    return mocks.map((mock) => {
        if (typeof mock === 'object') {
            return mock;
        }

        return { pattern: mock, mock: 'EMPTY_FUNCTION' };
    });
}
