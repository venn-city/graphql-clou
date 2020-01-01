const fs = require('fs-extra');
const path = require('path');
const generateDaoClasses = require('./generateDaoClasses');
const generateOpenCrudSchema = require('./generateOpenCrudSchema');
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
  const openCrudSchema = await generateOpenCrudSchema(dataModel);
  const index = await generateIndex(Object.keys(daoClasses));

  fs.ensureDirSync(absoluteGeneratedFolderPath);
  Object.keys(daoClasses).forEach(daoClassName => {
    const daoClassText = daoClasses[daoClassName];
    fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, `${daoClassName}.ts`), daoClassText, 'utf8');
  });
  fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, 'openCrudSchema.d.ts'), openCrudSchema, 'utf8');
  fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, 'index.ts'), index, 'utf8');
}

module.exports = generateDAOSchema;
