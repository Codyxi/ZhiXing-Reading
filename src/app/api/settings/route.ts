import { NextRequest } from 'next/server';
import { getLLMConfig, saveLLMConfig, isLLMConfigured } from '@/lib/llm';

/** GET: 读取当前配置（隐藏 API Key 中间部分） */
export async function GET() {
  const config = getLLMConfig();
  return Response.json({
    configured: isLLMConfigured(),
    baseUrl: config.baseUrl,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    // 只返回 key 的前 8 位和后 4 位
    apiKeyPreview: config.apiKey
      ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`
      : '',
    hasApiKey: !!config.apiKey,
  });
}

/** POST: 保存配置 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // 如果用户提交了新的 apiKey，用新的；否则保留旧的
  const updates: Record<string, any> = {};
  if (body.baseUrl !== undefined) updates.baseUrl = body.baseUrl;
  if (body.model !== undefined) updates.model = body.model;
  if (body.temperature !== undefined) updates.temperature = parseFloat(body.temperature);
  if (body.maxTokens !== undefined) updates.maxTokens = parseInt(body.maxTokens);
  if (body.apiKey !== undefined && body.apiKey !== '') updates.apiKey = body.apiKey;

  const saved = saveLLMConfig(updates);

  return Response.json({
    success: true,
    configured: isLLMConfigured(),
    baseUrl: saved.baseUrl,
    model: saved.model,
  });
}
