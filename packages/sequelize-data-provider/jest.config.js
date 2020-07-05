// eslint-disable-next-line import/no-extraneous-dependencies
const { createJestConfig } = require('@venncity/jest-config-server');

module.exports = createJestConfig({
  setupFilesAfterEnv: ['./jest.setup.js']
});
