// ── LLM 配置与调用模块 ──
// 支持任意 OpenAI 兼容 API（OpenAI / DeepSeek / Moonshot / 智谱 / 硅基流动 / Ollama 等）

import fs from 'fs';
import path from 'path';

// ── 配置类型 ──
export interface LLMConfig {
  /** API 基础 URL，如 https://api.openai.com/v1 */
  baseUrl: string;
  /** API Key */
  apiKey: string;
  /** 模型名称，如 gpt-4o / deepseek-chat */
  model: string;
  /** 温度参数 */
  temperature?: number;
  /** 最大 token 数 */
  maxTokens?: number;
}

// ── 配置文件路径 ──
const CONFIG_PATH = path.join(process.cwd(), '.llm-config.json');

/** 默认配置 */
const DEFAULT_CONFIG: LLMConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4096,
};

/** 读取配置 */
export function getLLMConfig(): LLMConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const saved = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...saved };
    }
  } catch {}
  return { ...DEFAULT_CONFIG };
}

/** 保存配置 */
export function saveLLMConfig(config: Partial<LLMConfig>): LLMConfig {
  const current = getLLMConfig();
  const merged = { ...current, ...config };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

/** 检查是否已配置 LLM */
export function isLLMConfigured(): boolean {
  const config = getLLMConfig();
  return !!(config.apiKey && config.baseUrl && config.model);
}

// ── Chat Completion 调用 ──
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

interface ChatCompletionResponse {
  choices: ChatCompletionChoice[];
}

/**
 * 非流式调用 LLM
 */
export async function llmChat(
  messages: ChatMessage[],
  options?: Partial<LLMConfig>
): Promise<string> {
  const config = { ...getLLMConfig(), ...options };

  if (!config.apiKey) {
    throw new Error('未配置 API Key，请在设置中配置 LLM 连接');
  }

  const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 4096,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API 错误 (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  return data.choices?.[0]?.message?.content ?? '';
}

/**
 * 流式调用 LLM — 返回 ReadableStream（SSE 格式）
 */
export async function llmChatStream(
  messages: ChatMessage[],
  options?: Partial<LLMConfig>
): Promise<ReadableStream<Uint8Array>> {
  const config = { ...getLLMConfig(), ...options };

  if (!config.apiKey) {
    throw new Error('未配置 API Key，请在设置中配置 LLM 连接');
  }

  const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API 错误 (${response.status}): ${errText.slice(0, 200)}`);
  }

  // 将 OpenAI SSE 流转换为我们前端需要的格式
  const encoder = new TextEncoder();
  const reader = response.body?.getReader();
  if (!reader) throw new Error('无法读取 LLM 响应流');

  return new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ content })}\n\n`
                ));
              }
            } catch {}
          }
        }
      } catch (err: any) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ error: err.message })}\n\n`
        ));
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
