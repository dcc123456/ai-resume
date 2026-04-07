// src/llm/minimaxProvider.ts
import { BaseLLMProvider, APIMessage } from './baseProvider';

export class MiniMaxProvider extends BaseLLMProvider {
  constructor(apiKey: string, model = 'minimax-m2.7', baseUrl = 'https://api.minimax.chat/v1') {
    super('minimax', model, apiKey, baseUrl);
  }

  async _callAPI(messages: APIMessage[], options: { temperature: number; responseFormat: string }): Promise<{ content: string; usage: { total_tokens: number } }> {
    const body: any = { model: this.model, messages, temperature: options.temperature };
    if (options.responseFormat === 'json') body.response_format = { type: 'json_object' };
    const response = await fetch(`${this.baseUrl}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`MiniMax API 错误 (${response.status}): ${text}`);
    }
    const data: any = await response.json();
    return { content: data.choices[0].message.content, usage: data.usage || { total_tokens: 0 } };
  }
}
