const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const simpleGit = require('simple-git');
const { getDependencies } = require('./dependencyAnalyzer');

const EXCLUDED_DIRS = ['node_modules', '.git', 'build', 'dist', 'public'];
const EXCLUDED_FILES = ['.min.js', '.bundle.js'];

async function getAllSourceFiles(dir, extensions = ['.js', '.ts', '.jsx', '.tsx']) {
  let files = [];
  try {
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      try {
        const stat = await fs.lstat(fullPath);

        if (stat.isSymbolicLink()) {
          console.log(`Skipping symlink: ${fullPath}`);
          continue;
        }

        if (stat.isDirectory()) {
          if (!EXCLUDED_DIRS.includes(item)) {
            files = files.concat(await getAllSourceFiles(fullPath, extensions));
          }
        } else if (stat.isFile() && 
                   extensions.includes(path.extname(item)) && 
                   !EXCLUDED_FILES.some(excluded => item.includes(excluded))) {
          files.push(fullPath);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return files;
}

async function optimizeFile(file, repoPath, model) {
  const relativeFilePath = path.relative(repoPath, file);
  console.log(`\nOptimizing file: ${relativeFilePath}`);

  const baseDir = path.dirname(file);
  const dependencies = await getDependencies(file, baseDir, repoPath);
  const relatedFiles = dependencies.map(dep => path.join(baseDir, dep));

  const branchName = `optimize-${relativeFilePath.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  const command = `code-optimize-extractor --model ${model} --file ${file} --git-repo ${repoPath} "Optimize and improve this file, considering its dependencies"`;
  execSync(command, { stdio: 'inherit' });

  return branchName;
}

async function optimizeAllFiles(repoPath, model) {
  const git = simpleGit(repoPath);
  const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);

  const files = await getAllSourceFiles(repoPath);
  console.log(`Found ${files.length} source files to optimize.`);

  for (const file of files) {
    try {
      const branchName = await optimizeFile(file, repoPath, model);
      
      // Check if branch already exists
      const branches = await git.branchLocal();
      if (branches.all.includes(branchName)) {
        console.log(`Branch ${branchName} already exists. Skipping...`);
        continue;
      }

      // Create a new branch and commit changes
      await git.checkout(['-b', branchName]);
      await git.add('.');
      await git.commit(`Optimized ${path.relative(repoPath, file)}`);
      
      console.log(`Created branch: ${branchName}`);
      
      // Switch back to the original branch
      await git.checkout(currentBranch);
    } catch (error) {
      console.error(`Error optimizing ${path.relative(repoPath, file)}:`, error.message);
      // Switch back to the original branch in case of error
      await git.checkout(currentBranch);
    }
  }

  console.log('\nOptimization process completed for all files.');
}

module.exports = { optimizeAllFiles };
