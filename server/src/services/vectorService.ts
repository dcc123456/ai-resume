// src/services/vectorService.ts
import { ChromaClient } from 'chromadb';
import config from '../config';

let collection: any = null;
let client: any = null;

async function initChroma(): Promise<void> {
  if (client) return;
  try {
    client = new ChromaClient({ path: config.chroma.url });
    collection = await client.getOrCreateCollection({ name: 'resume_vectors' });
  } catch (err: any) {
    console.warn('Chroma 初始化失败（非致命），向量功能已禁用:', err.message);
    client = null;
    collection = null;
  }
}

async function getEmbedding(text: string): Promise<number[]> {
  const { getLLM } = await import('../llm');
  const llm = getLLM();
  try {
    const response = await fetch(`${llm.getBaseUrl()}/embeddings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${llm.getApiKey()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    });
    if (!response.ok) throw new Error('Embedding API 失败');
    const data: any = await response.json();
    return data.data[0].embedding;
  } catch {
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    const vec = new Array(1536).fill(0);
    for (let i = 0; i < hash.length && i < vec.length; i++) vec[i] = parseInt(hash[i], 16) / 15;
    return vec;
  }
}

export async function addResumeVector(userId: number, resumeText: string, resumeId: number): Promise<void> {
  await initChroma();
  if (!collection) return;
  try {
    const embedding = await getEmbedding(resumeText);
    await collection.upsert({
      ids: [`user_${userId}_resume`],
      embeddings: [embedding],
      metadatas: [{ userId: String(userId), resumeId: String(resumeId) }],
      documents: [resumeText],
    });
  } catch (err: any) { console.warn('向量存储失败:', err.message); }
}

export async function findDuplicateResume(userId: number, resumeText: string, threshold = 0.95): Promise<string | null> {
  await initChroma();
  if (!collection) return null;
  try {
    const embedding = await getEmbedding(resumeText);
    const results = await collection.query({ queryEmbeddings: [embedding], nResults: 1, where: { userId: String(userId) } });
    if (results.distances[0] && results.distances[0][0] < (1 - threshold)) return results.ids[0][0];
  } catch (err: any) { console.warn('Chroma 查询失败:', err.message); }
  return null;
}

export async function deleteResumeVector(userId: number): Promise<void> {
  await initChroma();
  if (!collection) return;
  try { await collection.delete({ where: { userId: String(userId) } }); } catch (err: any) { console.warn('Chroma 删除失败:', err.message); }
}
