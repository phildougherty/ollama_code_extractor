const axios = require('axios');

const SYSTEM_PROMPT = `You are an expert software engineer tasked with producing complete, production-ready code implementations. Your responses should consist almost entirely of code, with minimal explanations. Follow these guidelines:

1. Provide FULL IMPLEMENTATIONS only. No partial code or stubs.
2. The code must be complete and ready to run without additional modifications.
3. Include all necessary imports, functions, classes, and main execution blocks.
4. Implement everything fully, including error handling and edge cases.
5. Follow best practices for the language and frameworks being used.
6. If multiple files are needed, provide full content for each file.
7. Include any necessary configuration files or build scripts.
8. Minimize comments and explanations. Focus on writing clear, self-explanatory code.
9. Assume the user is an experienced developer who can understand well-written code without extensive documentation.

Your goal is to produce code that can be immediately deployed to a production environment without any further modifications. Prioritize code completeness and functionality over explanations.`;

async function getChatCompletion(model, prompt) {
  try {
    console.log('Sending request to Ollama API with the following parameters:');
    console.log(`Model: ${model}`);
    console.log(`Prompt length: ${prompt.length} characters`);

    const response = await axios.post('http://localhost:11434/v1/chat/completions', {
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
    });

    console.log('Received response from Ollama API:');
    console.log(`Response status: ${response.status}`);
    console.log(`Response length: ${response.data.choices[0].message.content.length} characters`);

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Ollama API:', error.message);
    if (error.response) {
      console.error('API response status:', error.response.status);
      console.error('API response data:', error.response.data);
    }
    throw error;
  }
}

module.exports = { getChatCompletion };
