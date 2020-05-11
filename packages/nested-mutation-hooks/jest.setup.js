process.env.CLS_ENABLED = true;
process.env.IS_TEST = true;
// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config({ path: `${process.cwd()}/../../.env` });

const sequelizeModel = require('@venncity/sequelize-model');

jest.setTimeout(10000);

afterAll(async () => {
  await sequelizeModel.sq.sequelize.close();
});
