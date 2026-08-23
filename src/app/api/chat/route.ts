import { NextRequest } from 'next/server';
import { llmChat, llmChatStream, isLLMConfigured } from '@/lib/llm';
import type { SBPACK, SBPACKEvidence } from '@root/types/sbpack';
import { ALL_MOCK_SBPACKS } from '@root/mock-data';

// 从所有 SBPACK 中查找 evidence
function findEvidence(evidenceId: string): SBPACKEvidence | null {
  for (const pack of ALL_MOCK_SBPACKS) {
    const ev = pack.evidences.find((e) => e.id === evidenceId);
    if (ev) return ev;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, context, test } = body as {
    messages: { role: string; content: string }[];
    context?: {
      bookId?: string;
      mountedNodeIds?: string[];
      thinkingDepth?: 'standard' | 'deep';
    };
    test?: boolean;
  };

  // 测试连接模式
  if (test) {
    try {
      const reply = await llmChat([{ role: 'user', content: '请回复"连接成功"四个字' }], { maxTokens: 50 });
      return Response.json({ success: true, reply });
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (!messages?.length) {
    return Response.json({ error: '缺少消息' }, { status: 400 });
  }

  // 检查 LLM 配置
  const hasLLM = isLLMConfigured();

  // 构建系统提示
  const systemParts: string[] = [
    '你是"知行"AI 助手，一个基于知识蒸馏的智能问答系统。',
    '你的回答应当精准、有深度，并且尽可能引用用户提供的知识库中的原文依据。',
  ];

  // 注入 SBPACK 上下文
  if (context?.bookId) {
    const pack = ALL_MOCK_SBPACKS.find(p => p.bookId === context.bookId);
    if (pack) {
      systemParts.push(`\n## 当前绑定的知识书籍：《${pack.bookTitle}》— ${pack.author}`);
      if (pack.description) systemParts.push(`简介：${pack.description}`);

      // 注入挂载的节点
      if (context.mountedNodeIds?.length) {
        const mounted = pack.nodes.filter(n => context.mountedNodeIds!.includes(n.id));
        if (mounted.length) {
          systemParts.push('\n## 已挂载的知识节点：');
          for (const node of mounted) {
            systemParts.push(`- **${node.title}**（${node.type === 'skill' ? '原始技能' : '知识点'}，维度：${node.dimension}）：${node.summary}`);
            // 注入关联的 evidence
            const evs = pack.evidences.filter(e => e.nodeId === node.id);
            for (const ev of evs) {
              systemParts.push(`  - 原句依据："${ev.quote}"${ev.location ? `（${ev.location}）` : ''}`);
            }
          }
        }
      } else {
        // 没有挂载节点，注入全部节点摘要
        systemParts.push('\n## 本书知识概览：');
        for (const node of pack.nodes) {
          systemParts.push(`- ${node.title}（${node.type}）：${node.summary.slice(0, 80)}…`);
        }
      }

      systemParts.push('\n## 回答要求：');
      systemParts.push('1. 基于上述知识库内容回答用户问题');
      systemParts.push('2. 回答中引用原句依据时，请使用 [依据: "原文内容"] 的格式标注');
      systemParts.push('3. 如果知识库中没有相关信息，可以基于通用知识回答，但需说明');
    }
  }

  if (context?.thinkingDepth === 'deep') {
    systemParts.push('\n## 深度思考模式：请使用 Chain-of-Thought 逐步推理，展示你的思考过程。回答应当更详细、更深入。');
  }

  const systemPrompt = systemParts.join('\n');

  // 构建消息列表
  const llmMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  // 流式响应
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!hasLLM) {
          // 无 LLM 配置时使用 Mock 回复
          const mockReply = generateMockChatReply(messages[messages.length - 1].content, context);
          const chunks = mockReply.match(/.{1,20}/g) || [mockReply];
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            await new Promise(r => setTimeout(r, 30 + Math.random() * 40));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        // 真实 LLM 流式调用
        const llmStream = await llmChatStream(llmMessages);
        const reader = llmStream.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          // 直接转发 LLM 的 SSE 数据
          controller.enqueue(encoder.encode(text));
        }

        controller.close();
      } catch (err: any) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ error: err.message })}\n\n`
        ));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ── Mock 回复（无 LLM 时的降级方案）──
function generateMockChatReply(
  question: string,
  context?: { bookId?: string; mountedNodeIds?: string[]; thinkingDepth?: string }
): string {
  const pack = context?.bookId ? ALL_MOCK_SBPACKS.find(p => p.bookId === context.bookId) : null;
  const mountedNodes = pack?.nodes.filter(n => context?.mountedNodeIds?.includes(n.id)) ?? [];
  const depth = context?.thinkingDepth;

  const prefix = depth === 'deep' ? '**[深度思考模式 — CoT 推理链]**\n\n' : '';
  const bookRef = pack ? `基于《${pack.bookTitle}》的知识体系` : '基于通用知识';

  if (mountedNodes.length > 0) {
    const nodeRefs = mountedNodes.map(n => `**${n.title}**`).join('、');
    const evidenceBlock = mountedNodes.slice(0, 2).map(n => {
      const ev = pack?.evidences.find(e => e.nodeId === n.id);
      return ev ? `> [依据: "${ev.quote}"]` : '';
    }).filter(Boolean).join('\n');

    return `${prefix}关于你的问题，${bookRef}，结合你挂载的 ${nodeRefs} 等知识点，我的分析如下：

${mountedNodes.map((n, i) => `${i + 1}. **${n.title}**：${n.summary.slice(0, 100)}…`).join('\n')}

${evidenceBlock}

${depth === 'deep' ? '**深层推理：**\n让我展开分析这个问题的底层逻辑……\n\n（提示：当前为 Mock 模式。请在设置中配置 API Key 以获得真实的 LLM 推理能力。）' : '（提示：当前为 Mock 模式，请在侧边栏底部的设置中配置 LLM API Key）'}`;
  }

  return `${prefix}${bookRef}来回答这个问题。${pack ? `《${pack.bookTitle}》涵盖了 ${pack.nodes.length} 个核心知识点。` : ''}

建议你在左侧选择知识书籍并挂载相关知识点，这样我能给出更有针对性的回答。

（提示：当前为 Mock 模式，请在侧边栏底部的设置中配置 LLM API Key）`;
}
