const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const simpleGit = require('simple-git');
const { getDependencies } = require('./dependencyAnalyzer');

// ... (keep the existing functions)

async function optimizeAllFiles(repoPath, model) {
  const git = simpleGit(repoPath);
  
  // Check if the directory is a git repository
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    console.error(`Error: The specified path is not a git repository: ${repoPath}`);
    console.error('Please run this command from within a git repository or specify a valid git repository using --git-repo');
    return;
  }

  let currentBranch;
  try {
    const branches = await git.branchLocal();
    if (branches.all.length === 0) {
      console.error('Error: No branches found in the repository.');
      console.error('Please create an initial branch (e.g., "main" or "master") before running this command.');
      return;
    }
    currentBranch = branches.current || branches.all[0];
  } catch (error) {
    console.error('Error getting current branch:', error.message);
    return;
  }

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
      await git.checkout(currentBranch).catch(() => console.error(`Failed to switch back to ${currentBranch}`));
    }
  }

  console.log('\nOptimization process completed for all files.');
}

module.exports = { optimizeAllFiles };
