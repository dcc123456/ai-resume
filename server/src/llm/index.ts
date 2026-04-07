// src/llm/index.ts
import config from '../config';
import { MiniMaxProvider } from './minimaxProvider';
import { BaseLLMProvider } from './baseProvider';

function createLLMProvider(): BaseLLMProvider {
  const { provider, apiKey, baseUrl, model } = config.llm;
  switch (provider) {
    case 'minimax': return new MiniMaxProvider(apiKey, model, baseUrl);
    default: throw new Error(`不支持的 LLM Provider: ${provider}`);
  }
}

let providerInstance: BaseLLMProvider | null = null;

export function getLLM(): BaseLLMProvider {
  if (!providerInstance) providerInstance = createLLMProvider();
  return providerInstance;
}

export { createLLMProvider };
