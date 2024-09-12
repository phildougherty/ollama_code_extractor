const fs = require('fs-extra');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

async function isFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

function parseImports(content, filePath) {
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  const imports = [];

  traverse(ast, {
    ImportDeclaration({ node }) {
      imports.push(node.source.value);
    },
    CallExpression({ node }) {
      if (node.callee.name === 'require') {
        imports.push(node.arguments[0].value);
      }
    },
  });

  return imports.map(imp => {
    if (imp.startsWith('.')) {
      return path.resolve(path.dirname(filePath), imp);
    }
    return null;
  }).filter(Boolean);
}

async function resolveFilePath(basePath, projectRoot, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const paths = [
    basePath,
    path.join(projectRoot, basePath),
    path.join(projectRoot, 'src', basePath),
    path.join(projectRoot, 'components', basePath),
    path.join(projectRoot, 'contexts', basePath),
  ];

  for (const p of paths) {
    // Check if the file exists as is
    if (await isFile(p)) {
      return p;
    }

    // Try adding extensions
    for (const ext of extensions) {
      const pathWithExt = `${p}${ext}`;
      if (await isFile(pathWithExt)) {
        return pathWithExt;
      }
    }

    // Check for index files in directories
    for (const ext of extensions) {
      const indexPath = path.join(p, `index${ext}`);
      if (await isFile(indexPath)) {
        return indexPath;
      }
    }
  }

  return null;
}

async function getDependencies(filePath, baseDir, projectRoot) {
  const visited = new Set();
  const dependencies = new Set();

  async function traverse(currentPath) {
    if (visited.has(currentPath)) return;
    visited.add(currentPath);

    let resolvedPath = await resolveFilePath(currentPath, projectRoot);

    if (!resolvedPath) {
      console.warn(`File not found: ${currentPath}`);
      return;
    }

    try {
      const content = await fs.readFile(resolvedPath, 'utf-8');
      dependencies.add(path.relative(baseDir, resolvedPath));

      const imports = parseImports(content, resolvedPath);
      for (const imp of imports) {
        await traverse(imp);
      }
    } catch (error) {
      console.error(`Error processing file ${resolvedPath}:`, error.message);
    }
  }

  await traverse(filePath);
  return Array.from(dependencies);
}

module.exports = { getDependencies };
