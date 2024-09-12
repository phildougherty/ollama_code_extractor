const chalk = require('chalk');
const hljs = require('highlight.js');

function extractCodeFromResponse(response) {
  // First, try to parse as JSON
  try {
    const jsonResponse = JSON.parse(response);
    if (jsonResponse.files && Array.isArray(jsonResponse.files)) {
      return outputExtractedFiles(jsonResponse.files);
    }
  } catch (error) {
    // If it's not JSON, continue with text processing
  }

  // Split the response into sections based on file indicators
  const fileSections = response.split(/(?=\*\*[\w.-]+\*\*\s*```[\w-]*)/g);
  
  const extractedFiles = fileSections.map(section => {
    const fileNameMatch = section.match(/\*\*([\w.-]+)\*\*/);
    const codeMatch = section.match(/```([\w-]*)\n([\s\S]*?)```/);
    
    if (fileNameMatch && codeMatch) {
      return {
        filename: fileNameMatch[1],
        language: codeMatch[1] || 'plaintext',
        content: codeMatch[2].trim()
      };
    }
    return null;
  }).filter(Boolean);

  if (extractedFiles.length > 0) {
    return outputExtractedFiles(extractedFiles);
  }

  // If no files were extracted, create a single file with the entire response
  return outputExtractedFiles([{
    filename: 'response.txt',
    language: 'plaintext',
    content: response.trim()
  }]);
}

function outputExtractedFiles(files) {
  console.log(chalk.cyan('\nExtracted files:'));
  files.forEach(file => {
    console.log(chalk.green(`\nFile: ${file.filename}`));
    const highlightedCode = hljs.highlight(file.content, { language: file.language }).value;
    console.log(highlightedCode);
  });
  return files;
}

module.exports = { extractCodeFromResponse };
