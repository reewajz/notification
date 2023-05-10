const path = require('path');

module.exports = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    setupFiles: ['dotenv/config'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '\\.txt$': 'jest-raw-loader',
        '\\.html$': 'jest-raw-loader'
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
    testEnvironment: 'node',
    moduleNameMapper: {
        // This is causing a lot of side effects when running test in watch mode,
        // such as MaxListenersExceededWarning, or open sockets at the end of
        // the test run.
        'aws-xray-sdk': path.join(
            __dirname,
            './node_modules/@itonics/lambda/dist/testing/Mocks/noop.js'
        )
    },
    testResultsProcessor: 'jest-sonar-reporter',
    collectCoverage: !process.argv.includes('--watch'),
    collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**', '!src/legacy/*']
};
