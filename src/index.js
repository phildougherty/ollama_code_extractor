require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { extractCodeFromResponse } = require('./codeExtractor');
const { saveCodeToGit } = require('./gitManager');
const { getChatCompletion } = require('./ollama');
const { getDependencies } = require('./dependencyAnalyzer');
const { optimizeAllFiles } = require('./optimizeAllFiles');
const { checkBranchChanges } = require('./checkBranchChanges');


async function isGitRepository(dir) {
  try {
    const git = simpleGit(dir);
    return await git.checkIsRepo();
  } catch (error) {
    return false;
  }
}

async function isFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
    return false;
  }
}

async function readFileContent(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('model', {
      alias: 'm',
      type: 'string',
      description: 'Specify the Ollama model to use',
      default: process.env.OLLAMA_MODEL || 'llama3.1:8b'
    })
    .option('file', {
      alias: 'f',
      type: 'string',
      description: 'Specify a single file to analyze along with its dependencies'
    })
    .option('git-repo', {
      alias: 'g',
      type: 'string',
      description: 'Specify the path to the git repository',
      default: process.cwd()
    })
    .option('prompt', {
      alias: 'p',
      type: 'string',
      description: 'Additional text prompt for the model'
    })
    .option('optimize-all', {
      alias: 'a',
      type: 'boolean',
      description: 'Optimize all source files in the repository'
    })
    .option('check-changes', {
      alias: 'c',
      type: 'boolean',
      description: 'Check for changes in optimization branches after processing'
    })
    .help('h')
    .alias('h', 'help')
    .epilog('For more information, visit https://github.com/yourusername/code-optimize-extractor')
    .argv;

  let { model, file: singleFile, gitRepo, prompt, optimizeAll, checkChanges } = argv;

  // Check if the specified directory is a git repository
  const git = simpleGit(gitRepo);
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    console.error(`Error: The specified path is not a git repository: ${gitRepo}`);
    console.error('Please run this command from within a git repository or specify a valid git repository using --git-repo');
    process.exit(1);
  }

  // Check if the specified directory is a git repository
  if (!(await isGitRepository(gitRepo))) {
    console.error(`Error: The specified path is not a git repository: ${gitRepo}`);
    console.error('Please run this command from within a git repository or specify a valid git repository using --git-repo');
    process.exit(1);
  }

  if (optimizeAll) {
    console.log('Starting optimization process for all files...');
    await optimizeAllFiles(gitRepo, model);
    
    if (checkChanges) {
      console.log('\nChecking for changes in optimization branches...');
      await checkBranchChanges(gitRepo);
    }
  } else if (singleFile) {
    singleFile = path.resolve(gitRepo, singleFile);
    if (!(await isFile(singleFile))) {
      console.error(`Error: ${singleFile} is not a file or doesn't exist.`);
      return;
    }

    console.log(`Analyzing dependencies for ${singleFile}...`);
    const baseDir = path.dirname(singleFile);
    try {
      const dependencies = await getDependencies(singleFile, baseDir, gitRepo);
      const files = dependencies.map(dep => path.join(baseDir, dep));
      console.log(`Found ${files.length} dependent files.`);

      let fileContents = '';
      for (const file of files) {
        console.log(`Reading file: ${file}`);
        const content = await readFileContent(file);
        if (content) {
          fileContents += `File: ${path.relative(gitRepo, file)}\n\n${content}\n\n`;
        }
      }

      console.log('Preparing prompt for the model...');
      const modelPrompt = `
Analyze the following code and provide a complete, production-ready implementation that addresses any issues, implements missing features, and optimizes the code. Focus on generating high-quality, functional code with minimal explanations.

${fileContents}

Task: ${prompt || 'Complete the implementation and optimize the code'}

Respond with full file contents, using the format:
**filename.ext**
\`\`\`language
// code here
\`\`\`

For multiple files, repeat this format for each file.
`;

      console.log('Sending request to Ollama API...');
      const chatResponse = await getChatCompletion(model, modelPrompt);
      console.log('Received response from Ollama API.');
      
      const extractedFiles = extractCodeFromResponse(chatResponse);
      
      if (extractedFiles.length > 0) {
        console.log(`Extracted ${extractedFiles.length} file(s) from the response.`);
        await saveCodeToGit(gitRepo, extractedFiles);
        console.log(`Code analysis committed to a new branch in the git repository: ${gitRepo}`);
        
        if (checkChanges) {
          console.log('\nChecking for changes in the created branch...');
          await checkBranchChanges(gitRepo);
        }
      } else {
        console.log("No actionable insights found in the chat response.");
      }
    } catch (error) {
      console.error('Error analyzing dependencies:', error.message);
    }
  } else {
    console.error('Error: Please specify either --file or --optimize-all');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
