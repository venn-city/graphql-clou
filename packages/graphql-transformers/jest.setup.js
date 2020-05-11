process.env.CLS_ENABLED = true;
process.env.IS_TEST = true;
jest.setTimeout(10000);

const sequelizeModel = require('@venncity/sequelize-model');

afterAll(async () => {
  await sequelizeModel.sq.sequelize.close();
});
