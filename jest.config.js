// eslint-disable-next-line import/no-extraneous-dependencies
const { createJestConfig } = require('@venncity/jest-config-server');

const jestConfig = createJestConfig({
  setupFilesAfterEnv: ['./jest.setup.js']
});
jestConfig.transformIgnorePatterns = ['/node_modules/(?!sequelize)'];
module.exports = jestConfig;
