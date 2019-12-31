const { upperFirst } = require('lodash');
const dedent = require('dedent');

function generateIndex(daoClassNames = []) {
  const index = daoClassNames.reduce((prev, className) => {
    const classNameUpperFirstLetter = upperFirst(className);
    return `${prev}
    export { default as ${classNameUpperFirstLetter}DAO } from './${className}';`;
  }, `export * from './openCrudSchema';`);
  return dedent(index);
}

module.exports = generateIndex;
