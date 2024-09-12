function extractCodeFromResponse(response) {
  try {
    const jsonResponse = JSON.parse(response);
    if (jsonResponse.files && Array.isArray(jsonResponse.files)) {
      return jsonResponse.files;
    }
  } catch (error) {
    console.error('Error parsing JSON response:', error.message);
  }
  return [];
}

module.exports = { extractCodeFromResponse };
