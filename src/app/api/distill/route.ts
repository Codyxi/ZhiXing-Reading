import { NextRequest } from 'next/server';
import { llmChat, llmChatStream, isLLMConfigured } from '@/lib/llm';
import type { SBPACK } from '@root/types/sbpack';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// ── Mock 蒸馏（无 LLM 时的降级方案）──
function mockDistill(text: string, title?: string, author?: string): SBPACK {
  const bookId = `distilled-${generateId()}`;
  const bookTitle = title ?? text.slice(0, 30).replace(/[\n\r]/g, '').trim() || '未命名文档';
  const lines = text.split('\n').filter(l => l.trim().length > 4 && l.trim().length < 40);
  const phrases = [...new Set(lines.map(l => l.replace(/^[#\-*•\d.>\s]+/, '').trim()))].slice(0, 8);
  const sentences = text.replace(/\n+/g, ' ').split(/[。！？.!?]/).map(s => s.trim()).filter(s => s.length > 10 && s.length < 200);
  const dimensions = ['财富', '决策', '事业', '关系', '创作', '身心', '成长', '哲思'];
  const types: ('knowledge' | 'skill')[] = ['knowledge', 'skill'];

  const nodes = phrases.map((phrase, i) => ({
    id: `${bookId}-k${i + 1}`,
    title: phrase,
    type: types[i % 2],
    summary: sentences[i] ?? `关于"${phrase}"的核心知识要点。`,
    dimension: dimensions[i % dimensions.length],
    weight: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
  }));

  const evidences = sentences.slice(0, Math.min(8, sentences.length)).map((sentence, i) => ({
    id: `${bookId}-e${i + 1}`,
    quote: sentence,
    nodeId: nodes[Math.min(i, nodes.length - 1)]?.id ?? `${bookId}-k1`,
    location: `段落 ${i + 1}`,
  }));

  const relationships: SBPACK['relationships'] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    relationships.push({
      source: nodes[i].id,
      target: nodes[i + 1].id,
      relationType: ['递进关系', '因果关联', '互补视角', '对比反思', '应用延伸'][i % 5],
    });
  }

  return {
    bookId, bookTitle,
    coverUrl: `/covers/${bookId}.jpg`,
    author: author ?? '未知作者',
    description: text.slice(0, 200) + (text.length > 200 ? '…' : ''),
    distilledAt: new Date().toISOString(),
    nodes, evidences, relationships,
  };
}

// ── LLM 蒸馏 Prompt ──
const DISTILL_SYSTEM_PROMPT = `你是一个知识蒸馏专家。你的任务是将用户提供的文本蒸馏为结构化的知识资产包（SBPACK）。

请严格按以下 JSON 格式输出，不要输出任何其他内容：
{
  "bookId": "随机生成的唯一ID",
  "bookTitle": "书名/文档标题",
  "coverUrl": "/covers/default.jpg",
  "author": "作者",
  "description": "100字以内的简介",
  "distilledAt": "${new Date().toISOString()}",
  "nodes": [
    {
      "id": "唯一ID",
      "title": "知识点名称（简洁精炼）",
      "type": "knowledge 或 skill",
      "summary": "50-150字的知识概要",
      "dimension": "维度标签：财富/决策/事业/关系/创作/身心/成长/哲思 之一",
      "weight": 1到5的数字
    }
  ],
  "evidences": [
    {
      "id": "唯一ID",
      "quote": "原文中的关键句子（逐字引用）",
      "nodeId": "关联的知识节点ID",
      "location": "来源位置"
    }
  ],
  "relationships": [
    {
      "source": "节点ID",
      "target": "节点ID",
      "relationType": "关系类型描述"
    }
  ]
}

要求：
1. 提取 6-10 个核心知识点，混合 knowledge 和 skill 类型
2. 每个知识点至少关联 1 条原句依据（evidence）
3. 构建 5-10 条节点间关系
4. summary 应当精炼而有深度，不是简单复述原文
5. 所有 ID 使用英文短横线格式`;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { mode, text, title, author, json } = body as {
    mode: 'text' | 'json';
    text?: string;
    title?: string;
    author?: string;
    json?: string;
  };

  try {
    if (mode === 'json' && json) {
      const parsed = JSON.parse(json) as SBPACK;
      if (!parsed.bookId || !parsed.bookTitle || !parsed.nodes) {
        return Response.json({ error: 'JSON 格式不符合 SBPACK 协议' }, { status: 400 });
      }
      parsed.distilledAt = parsed.distilledAt ?? new Date().toISOString();
      return Response.json({ success: true, pack: parsed });
    }

    if (mode === 'text' && text) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

          // Step 1
          send({ step: 'analyzing', message: '正在分析文本结构…' });
          await new Promise(r => setTimeout(r, 600));

          // Step 2
          send({ step: 'extracting', message: isLLMConfigured() ? '正在调用 LLM 蒸馏知识…' : '正在提取核心知识点（Mock 模式）…' });
          await new Promise(r => setTimeout(r, 400));

          try {
            let pack: SBPACK;

            if (isLLMConfigured()) {
              // 真实 LLM 蒸馏
              send({ step: 'evidence', message: 'LLM 正在标注原句依据…' });

              const userPrompt = `请蒸馏以下文本为 SBPACK 知识资产包。${title ? `\n书名：${title}` : ''}${author ? `\n作者：${author}` : ''}\n\n文本内容：\n${text.slice(0, 8000)}`;

              const reply = await llmChat([
                { role: 'system', content: DISTILL_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
              ], { temperature: 0.3, maxTokens: 8192 });

              // 解析 JSON
              const jsonMatch = reply.match(/\{[\s\S]*\}/);
              if (!jsonMatch) throw new Error('LLM 返回的内容无法解析为 JSON');

              pack = JSON.parse(jsonMatch[0]) as SBPACK;
              pack.bookId = pack.bookId || `distilled-${generateId()}`;
              pack.distilledAt = new Date().toISOString();

              // 确保每个 evidence 的 nodeId 存在
              const nodeIds = new Set(pack.nodes.map(n => n.id));
              pack.evidences = pack.evidences.filter(e => nodeIds.has(e.nodeId));
              pack.relationships = pack.relationships.filter(r => nodeIds.has(r.source) && nodeIds.has(r.target));

            } else {
              // Mock 蒸馏
              send({ step: 'evidence', message: '正在标注原句依据…' });
              await new Promise(r => setTimeout(r, 500));
              pack = mockDistill(text, title, author);
            }

            send({ step: 'relationships', message: '正在构建知识关系网络…' });
            await new Promise(r => setTimeout(r, 300));

            send({
              step: 'done',
              message: `蒸馏完成！提取了 ${pack.nodes.length} 个知识点、${pack.evidences.length} 条依据、${pack.relationships.length} 条关系。${isLLMConfigured() ? '' : '（Mock 模式 — 配置 LLM API Key 后可获得更高质量的蒸馏结果）'}`,
              pack,
            });

          } catch (err: any) {
            send({ step: 'error', message: `蒸馏失败：${err.message}` });
          }

          controller.close();
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
      });
    }

    return Response.json({ error: '无效的请求参数' }, { status: 400 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? '蒸馏失败' }, { status: 500 });
  }
}
