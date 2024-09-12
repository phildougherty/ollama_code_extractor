const simpleGit = require('simple-git');
const fs = require('fs-extra');
const path = require('path');

async function saveCodeToGit(repoPath, files) {
  const git = simpleGit(repoPath);
  
  // Check if the directory is a git repository
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error(`The specified path is not a git repository: ${repoPath}`);
  }

  // Create a new branch
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const branchName = `code-extractor-${timestamp}`;
  await git.checkoutLocalBranch(branchName);

  // Write files
  for (const file of files) {
    const filePath = path.join(repoPath, file.filename);
    await fs.writeFile(filePath, file.content);
    await git.add(filePath);
  }

  // Commit changes
  await git.commit('Add generated code from Code Extractor');

  console.log(`Created new branch: ${branchName}`);
}

module.exports = { saveCodeToGit };
