const fs = require('fs-extra');
const path = require('path');

async function saveCodeToFile(fileName, code) {
  const outputDir = path.join(__dirname, '..', 'output');
  await fs.ensureDir(outputDir);
  const filePath = path.join(outputDir, fileName);
  await fs.writeFile(filePath, code);
}

module.exports = { saveCodeToFile };
