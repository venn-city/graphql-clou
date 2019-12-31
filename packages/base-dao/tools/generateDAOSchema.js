const fs = require('fs-extra');
const path = require('path');
const generateDAOClasses = require('./generateDAOClasses');
const generateOpenCrudSchema = require('./generateOpenCrudSchema');
const generateIndex = require('./generateIndex');

async function generateDAOSchema(dataModelPath, generatedFolder, { cwd = process.cwd() } = {}) {
  const absoluteGeneratedFolder = path.resolve(cwd, generatedFolder);
  const absoluteDataModelPath = path.resolve(cwd, dataModelPath);
  const dataModel = fs.readFileSync(absoluteDataModelPath, 'utf8');
  const daoClasses = generateDAOClasses(dataModel);
  const openCrudSchema = await generateOpenCrudSchema(dataModel);
  const index = generateIndex(Object.keys(daoClasses));

  fs.ensureDirSync(absoluteGeneratedFolder);
  Object.keys(daoClasses).forEach(daoClassName => {
    const daoClassText = daoClasses[daoClassName];
    fs.writeFileSync(path.resolve(absoluteGeneratedFolder, `${daoClassName}.ts`), daoClassText, 'utf8');
  });
  fs.writeFileSync(path.resolve(absoluteGeneratedFolder, 'openCrudSchema.ts'), openCrudSchema, 'utf8');
  fs.writeFileSync(path.resolve(absoluteGeneratedFolder, 'index.ts'), index, 'utf8');
}

module.exports = generateDAOSchema;
