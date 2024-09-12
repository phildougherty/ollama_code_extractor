require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const { extractCodeFromResponse } = require('./codeExtractor');
const { saveCodeToGit } = require('./gitManager');
const { getChatCompletion } = require('./ollama');

async function readFileContent(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let model = process.env.OLLAMA_MODEL || 'llama2';
  let files = [];
  let prompt = '';
  let gitRepo = process.cwd();

  // Parse command-line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model' && i + 1 < args.length) {
      model = args[++i];
    } else if (args[i] === '--file' && i + 1 < args.length) {
      files.push(args[++i]);
    } else if (args[i] === '--git-repo' && i + 1 < args.length) {
      gitRepo = args[++i];
    } else {
      prompt += ' ' + args[i];
    }
  }

  prompt = prompt.trim();

  if (files.length > 0) {
    let fileContents = '';
    for (const file of files) {
      const content = await readFileContent(file);
      if (content) {
        fileContents += `File: ${path.basename(file)}\n\n${content}\n\n`;
      }
    }
    prompt = `The following files are provided as context:\n\n${fileContents}\n${prompt || 'Please analyze the provided files and suggest improvements or answer any questions about them.'}`;
  } else if (!prompt) {
    prompt = "Write a Python function to calculate the factorial of a number.";
  }

  const structuredPrompt = `
Please provide your response in the following JSON format:
{
  "files": [
    {
      "filename": "example.py",
      "content": "# Your code here"
    }
  ],
  "explanation": "Brief explanation of the code or analysis"
}
Now, here's the task: ${prompt}
  `;

  try {
    const chatResponse = await getChatCompletion(model, structuredPrompt);
    const extractedFiles = extractCodeFromResponse(chatResponse);
    
    if (extractedFiles.length > 0) {
      await saveCodeToGit(gitRepo, extractedFiles);
      console.log(`Code committed to a new branch in the git repository: ${gitRepo}`);
    } else {
      console.log("No code found in the chat response.");
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
