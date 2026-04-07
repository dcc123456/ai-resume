// resume-ai/server/src/llm/index.js
const config = require('../config');
const { MiniMaxProvider } = require('./minimaxProvider');

function createLLMProvider() {
  const { provider, apiKey, baseUrl, model } = config.llm;
  switch (provider) {
    case 'minimax': return new MiniMaxProvider(apiKey, model, baseUrl);
    default: throw new Error(`不支持的 LLM Provider: ${provider}`);
  }
}

let providerInstance = null;
function getLLM() {
  if (!providerInstance) providerInstance = createLLMProvider();
  return providerInstance;
}

module.exports = { getLLM, createLLMProvider };
