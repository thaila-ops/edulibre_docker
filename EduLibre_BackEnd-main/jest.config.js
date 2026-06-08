module.exports = {
  verbose: true,
  testEnvironment: 'node',

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
};