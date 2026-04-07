// src/llm/baseProvider.ts
export interface LLMResponse {
  content?: string;
  parsed?: any;
  raw?: string;
  usage: { total_tokens: number };
}

export interface ChatOptions {
  responseFormat?: 'text' | 'json';
  temperature?: number;
  maxRetries?: number;
}

export interface APIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export abstract class BaseLLMProvider {
  protected name: string;
  protected model: string;
  protected apiKey: string;
  protected baseUrl: string;

  constructor(name: string, model: string, apiKey: string, baseUrl: string) {
    this.name = name;
    this.model = model;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // 公共访问器，允许外部获取配置信息
  getApiKey(): string { return this.apiKey; }
  getBaseUrl(): string { return this.baseUrl; }

  abstract _callAPI(messages: APIMessage[], options: { temperature: number; responseFormat: string }): Promise<{ content: string; usage: { total_tokens: number } }>;

  async chat(systemPrompt: string, userMessage: string, options: ChatOptions = {}): Promise<LLMResponse> {
    const { responseFormat = 'text', temperature = 0.3, maxRetries = 3 } = options;
    const messages: APIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this._callAPI(messages, { temperature, responseFormat });
        if (responseFormat === 'json') {
          const parsed = JSON.parse(response.content);
          return { parsed, raw: response.content, usage: response.usage };
        }
        return { content: response.content, usage: response.usage };
      } catch (err) {
        lastError = err as Error;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    throw lastError;
  }
}
