const generateDAOClass = require('./generateDAO');

describe('tools', () => {
  test('should generate DAO class to be match to snapshot', () => {
    const daoString = generateDAOClass('survey');

    expect(daoString).toMatchSnapshot();
  });
});
