const axios = require('axios');

async function getChatCompletion(model, prompt) {
  try {
    const response = await axios.post('http://localhost:11434/v1/chat/completions', {
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Ollama API:', error.message);
    throw error;
  }
}

module.exports = { getChatCompletion };
