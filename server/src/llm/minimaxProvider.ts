// src/llm/minimaxProvider.ts
import { BaseLLMProvider, APIMessage } from './baseProvider';

export class MiniMaxProvider extends BaseLLMProvider {
  constructor(apiKey: string, model = 'minimax-m2.7', baseUrl = 'https://api.minimax.chat/v1') {
    super('minimax', model, apiKey, baseUrl);
    console.log(`[LLM] MiniMax Provider 初始化: 模型=${model}, baseUrl=${baseUrl}`);
  }

  async _callAPI(messages: APIMessage[], options: { temperature: number; responseFormat: string }): Promise<{ content: string; usage: { total_tokens: number } }> {
    const body: any = { model: this.model, messages, temperature: options.temperature };
    if (options.responseFormat === 'json') body.response_format = { type: 'json_object' };
    
    console.log(`[LLM] MiniMax API 请求:`, {
      model: this.model,
      messageCount: messages.length,
      temperature: options.temperature,
      responseFormat: options.responseFormat,
      firstMessage: messages[0]?.content?.substring(0, 100),
    });
    
    const startTime = Date.now();
    const response = await fetch(`${this.baseUrl}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const elapsed = Date.now() - startTime;
    
    console.log(`[LLM] MiniMax API 响应状态: ${response.status}, 耗时: ${elapsed}ms`);
    
    if (!response.ok) {
      const text = await response.text();
      console.error(`[LLM] MiniMax API 错误: ${response.status}`, text);
      throw new Error(`MiniMax API 错误 (${response.status}): ${text}`);
    }
    
    const data: any = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    
    if (!rawContent || rawContent.trim() === '') {
      console.error('[LLM] MiniMax 返回空内容:', JSON.stringify(data));
      throw new Error('MiniMax API 返回了空内容，请重试');
    }
    
    const content = rawContent;
    const usage = data.usage || { total_tokens: 0 };
    
    console.log(`[LLM] MiniMax API 成功:`, {
      contentLength: content.length,
      contentPreview: content.substring(0, 100),
      usage: usage,
    });
    
    return { content, usage };
  }
}
