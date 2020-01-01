const fs = require('fs-extra');
const path = require('path');
const generateDaoClasses = require('./generateDaoClasses');
const generateOpenCrudSchemaTypes = require('./generateOpenCrudSchemaTypes');
const generateIndex = require('./generateIndex');

async function generateDAOSchema({
  dataModelPath = 'src/schema/datamodel.graphql',
  generatedFolderPath = 'src/schema/generated',
  cwd = process.cwd()
} = {}) {
  const absoluteGeneratedFolderPath = path.resolve(cwd, generatedFolderPath);
  const absoluteDataModelPath = path.resolve(cwd, dataModelPath);
  const dataModel = fs.readFileSync(absoluteDataModelPath, 'utf8');
  const daoClasses = await generateDaoClasses(dataModel);
  const openCrudSchemaTypes = await generateOpenCrudSchemaTypes(dataModel);
  const index = await generateIndex(Object.keys(daoClasses));

  fs.ensureDirSync(absoluteGeneratedFolderPath);
  Object.keys(daoClasses).forEach(daoClassName => {
    const daoClassText = daoClasses[daoClassName];
    fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, `${daoClassName}.ts`), daoClassText, 'utf8');
  });
  fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, 'openCrudSchema.d.ts'), openCrudSchemaTypes, 'utf8');
  fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, 'index.ts'), index, 'utf8');
}

module.exports = generateDAOSchema;
