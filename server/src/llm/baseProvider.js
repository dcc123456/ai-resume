// resume-ai/server/src/llm/baseProvider.js
class BaseLLMProvider {
  constructor(name, model, apiKey, baseUrl) {
    this.name = name;
    this.model = model;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }
  async _callAPI(messages, options) {
    throw new Error('子类必须实现 _callAPI 方法');
  }
  async chat(systemPrompt, userMessage, options = {}) {
    const { responseFormat = 'text', temperature = 0.3, maxRetries = 3 } = options;
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this._callAPI(messages, { temperature, responseFormat });
        if (responseFormat === 'json') {
          const parsed = JSON.parse(response.content);
          return { parsed, raw: response.content, usage: response.usage };
        }
        return { content: response.content, usage: response.usage };
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    throw lastError;
  }
}

module.exports = { BaseLLMProvider };
