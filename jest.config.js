/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  verbose: true,
  clearMocks: true,

  // collectCoverage: true,
  // coverageDirectory: "coverage",

  moduleFileExtensions: ['js'],
  testMatch: ['<rootDir>/test/*.test.js'],
  collectCoverageFrom: [
      '<rootDir>/src/**/*.js'
  ],
};
