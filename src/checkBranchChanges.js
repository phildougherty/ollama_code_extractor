const simpleGit = require('simple-git');
const path = require('path');

async function checkBranchChanges(repoPath) {
  const git = simpleGit(repoPath);
  
  // Check if the directory is a git repository
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    console.error(`Error: The specified path is not a git repository: ${repoPath}`);
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
  
  // Get all branches
  const branches = await git.branch();
  
  // Filter for optimization branches
  const optimizationBranches = branches.all.filter(branch => branch.startsWith('optimize-'));
  
  console.log('Checking for changes in optimization branches:');
  
  for (const branch of optimizationBranches) {
    try {
      // Get the diff between the current branch and the optimization branch
      const diff = await git.diff([currentBranch, branch]);
      
      if (diff) {
        console.log(`\n${branch}: Changes detected`);
        console.log(diff);
      } else {
        console.log(`\n${branch}: No changes`);
      }
    } catch (error) {
      console.error(`Error checking branch ${branch}:`, error.message);
    }
  }
}

// If this script is run directly (not imported), execute the function
if (require.main === module) {
  const repoPath = process.argv[2] || process.cwd();
  checkBranchChanges(repoPath)
    .catch(error => console.error('Error:', error));
}

module.exports = { checkBranchChanges };  
