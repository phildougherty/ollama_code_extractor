const fs = require('fs-extra');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

async function isFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
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

async function getDependencies(filePath, baseDir) {
  const visited = new Set();
  const dependencies = new Set();

  async function traverse(currentPath) {
    if (visited.has(currentPath)) return;
    visited.add(currentPath);

    let resolvedPath = currentPath;
    if (!path.extname(resolvedPath)) {
      const extensions = ['.js', '.jsx', '.ts', '.tsx'];
      for (const ext of extensions) {
        const withExt = `${resolvedPath}${ext}`;
        if (await fs.pathExists(withExt)) {
          resolvedPath = withExt;
          break;
        }
      }
    }

    if (!(await fs.pathExists(resolvedPath))) {
      console.warn(`File not found: ${resolvedPath}`);
      return;
    }

    if (!(await isFile(resolvedPath))) {
      console.warn(`Not a file: ${resolvedPath}`);
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
