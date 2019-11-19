module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*)(-test).js?(x)'],
  testEnvironment: 'node',
  coverageReporters: ['json-summary', 'json', 'lcov', 'text', 'clover'],
  coveragePathIgnorePatterns: ['src./test/.', 'test/.', '.jest.js'],
  reporters: ['default', 'jest-junit']
};
