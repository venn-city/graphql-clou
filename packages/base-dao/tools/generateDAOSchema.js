const fs = require('fs-extra');
const path = require('path');
const generateDAOClasses = require('./generateDAOClasses');
const generateOpenCrudSchema = require('./generateOpenCrudSchema');
const generateIndex = require('./generateIndex');

async function generateDAOSchema(dataModelPath, generatedFolderPath, { cwd = process.cwd() } = {}) {
  if (!dataModelPath) {
    throw new Error('dataModelPath is required');
  }
  if (!generatedFolderPath) {
    throw new Error('generatedFolderPath is required');
  }
  const absoluteGeneratedFolderPath = path.resolve(cwd, generatedFolderPath);
  const absoluteDataModelPath = path.resolve(cwd, dataModelPath);
  const dataModel = fs.readFileSync(absoluteDataModelPath, 'utf8');
  const daoClasses = generateDAOClasses(dataModel);
  const openCrudSchema = await generateOpenCrudSchema(dataModel);
  const index = generateIndex(Object.keys(daoClasses));

  fs.ensureDirSync(absoluteGeneratedFolderPath);
  Object.keys(daoClasses).forEach(daoClassName => {
    const daoClassText = daoClasses[daoClassName];
    fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, `${daoClassName}.ts`), daoClassText, 'utf8');
  });
  fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, 'openCrudSchema.ts'), openCrudSchema, 'utf8');
  fs.writeFileSync(path.resolve(absoluteGeneratedFolderPath, 'index.ts'), index, 'utf8');
}

module.exports = generateDAOSchema;
