const { createJestConfig } = require('@venncity/jest-config-server');

module.exports = createJestConfig({
  setupFilesAfterEnv: ['./jest.setup.js']
});
