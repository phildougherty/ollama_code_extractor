I apologize for the confusion. Here's the README.md content without the escape characters, ready to be used directly:

# Code Optimize Extractor

Code Optimize Extractor is a powerful CLI tool that leverages Ollama's language models to analyze, optimize, and complete code implementations. It extracts code from existing files, sends it to an AI model for improvement, and commits the optimized code to a new branch in your git repository.

## Features

- Analyze and optimize code using Ollama's AI models
- Extract code and its dependencies from specified files
- Generate complete, production-ready code implementations
- Automatically commit optimized code to a new git branch
- Syntax-highlighted output of extracted and optimized code

## Prerequisites

- Node.js (v14 or later recommended)
- npm (usually comes with Node.js)
- Git
- Ollama installed and running on your machine

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/code-optimize-extractor.git
   cd code-optimize-extractor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Make the CLI tool globally accessible:
   ```
   npm link
   ```

## Usage

Run the tool from within a git repository:

```
code-optimize-extractor [options]
```

Options:
- `--model`, `-m`: Specify the Ollama model to use (default: llama3.1:8b)
- `--file`, `-f`: Specify a single file to analyze along with its dependencies
- `--git-repo`, `-g`: Specify the path to the git repository (default: current working directory)
- `--prompt`, `-p`: Additional text prompt for the model

Examples:

1. Optimize a specific file:
   ```
   code-optimize-extractor --file ./src/main.js "Optimize this file for performance"
   ```

2. Use a different Ollama model:
   ```
   code-optimize-extractor --model codellama --file ./app.js "Refactor this code"
   ```

3. Specify a different git repository:
   ```
   code-optimize-extractor --git-repo /path/to/repo --file ./src/app.js "Implement missing features"
   ```

## How It Works

1. The tool checks if the specified directory is a git repository.
2. It analyzes the specified file and its dependencies.
3. The code is sent to the Ollama API along with the optimization prompt.
4. The API returns optimized code implementations.
5. The tool extracts the code from the API response and displays it with syntax highlighting.
6. The optimized code is committed to a new branch in the git repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
