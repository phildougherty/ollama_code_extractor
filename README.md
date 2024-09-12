# Code Extractor

Code Extractor is a Node.js tool that uses Ollama's language models to generate, analyze, or modify code based on input files and prompts. It can process the model's response and save the resulting code files to the filesystem.

## Features

- Use any Ollama-compatible language model
- Input one or more files as context for the model
- Provide additional text prompts
- Automatically extract and save generated code files
- Structured JSON responses for consistent output

## Prerequisites

- Node.js (v12 or later recommended)
- npm (usually comes with Node.js)
- Ollama installed and running on your machine

## Installation

1. Clone this repository:

```
git clone https://github.com/yourusername/code-extractor.git
cd code-extractor
```

2. Install dependencies:
```
npm install
```

3. 3. (Optional) Create a `.env` file in the project root and specify your preferred Ollama model:
OLLAMA_MODEL=codellama

Run
Copy Code

## Usage

Run the script using npm with various options:
npm start [--model model_name] [--file filepath1 [--file filepath2 ...]] [prompt]

Run
Copy Code

Options:
- `--model`: Specify the Ollama model to use (optional, defaults to the one in .env or 'llama2')
- `--file`: Specify one or more input files (optional, can be used multiple times)
- `prompt`: Additional text prompt (optional)

### Examples

1. Using a specific model and a text prompt:
npm start --model codellama "Create a JavaScript function to sort an array of objects by a specific property"

Copy Code

2. Using input files:
npm start --file /path/to/file1.py --file /path/to/file2.js "Analyze these files and suggest improvements"

Run
Copy Code

3. Combining model, files, and prompt:
npm start --model codellama --file /path/to/file1.py --file /path/to/file2.js "Refactor these files to improve performance"

Copy Code

4. Using just files without an additional prompt:
npm start --file /path/to/file1.py --file /path/to/file2.js

Run
Copy Code

## Output

Generated code files will be saved in the `output` directory within the project folder. The filenames are determined by the model's response.

## Project Structure
code-extractor/
├── src/
│ ├── index.js # Main script
│ ├── codeExtractor.js # Code extraction logic
│ ├── ollama.js # Ollama API interaction
│ └── fileSystem.js # File I/O operations
├── package.json
├── .env # (Optional) Environment variables
└── README.md

Run
Copy Code

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

