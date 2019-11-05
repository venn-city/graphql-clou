const sq = require('./sequelizeInit');

describe('sequelizeInit', () => {
  test('sequelize should be initialized properly with models for all test schema entities', async () => {
    const governments = await sq.Government.findAll();
    expect(governments).toHaveLength(0);

    const ministers = await sq.Minister.findAll();
    expect(ministers).toHaveLength(0);

    const ministries = await sq.Ministry.findAll();
    expect(ministries).toHaveLength(0);

    const votes = await sq.Vote.findAll();
    expect(votes).toHaveLength(0);
  });
});
