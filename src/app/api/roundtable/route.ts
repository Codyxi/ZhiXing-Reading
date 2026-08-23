import { NextRequest } from 'next/server';
import { llmChat, isLLMConfigured } from '@/lib/llm';
import { ROUNDTABLE_SEATS } from '@root/mock-data/roundtable-seats';
import { ALL_MOCK_SBPACKS } from '@root/mock-data';
import type { AgentResponse } from '@root/types/sbpack';

// ── 每个席位的 LLM System Prompt ──
function buildSeatPrompt(seatId: string, question: string): string {
  const seat = ROUNDTABLE_SEATS.find(s => s.id === seatId);
  if (!seat) return '';

  // 收集该席位关联的 SBPACK 知识
  const linkedKnowledge: string[] = [];
  for (const bookId of seat.linkedBookIds) {
    const pack = ALL_MOCK_SBPACKS.find(p => p.bookId === bookId);
    if (pack) {
      linkedKnowledge.push(`\n### 《${pack.bookTitle}》— ${pack.author}`);
      for (const node of pack.nodes) {
        if (node.dimension === seat.dimension || pack.nodes.indexOf(node) < 4) {
          linkedKnowledge.push(`- **${node.title}**（${node.type}）：${node.summary}`);
          const evs = pack.evidences.filter(e => e.nodeId === node.id);
          for (const ev of evs.slice(0, 1)) {
            linkedKnowledge.push(`  原句依据："${ev.quote}"`);
          }
        }
      }
    }
  }

  return `你是"${seat.persona}"，坐镇"知行"圆桌会议的【${seat.name}】席位。

你的思维维度是：${seat.dimension}
你的职责：${seat.description}

## 你关联的知识库：
${linkedKnowledge.length ? linkedKnowledge.join('\n') : '（暂无关联书籍）'}

## 圆桌议题：
"${question}"

## 回答要求：
1. 以${seat.persona}的口吻和思维风格回答
2. 必须从"${seat.dimension}"的维度给出独特视角
3. 引用关联知识库中的原句依据来支撑你的观点
4. 回答 200-400 字，精炼有深度
5. 使用 Markdown 格式，用 **粗体** 标注关键观点
6. 直接给出观点，不要说"作为XX席位"之类的开场白`;
}

// ── 综合结论 Prompt ──
function buildConclusionPrompt(question: string, responses: AgentResponse[]): string {
  const responseBlocks = responses.map(r =>
    `### ${r.dimension}席 · ${r.persona}\n${r.content}`
  ).join('\n\n---\n\n');

  return `你是圆桌会议的主持人，负责综合各位智囊的观点，生成最终的会议纪要。

## 议题：
"${question}"

## 各席位发言：
${responseBlocks}

## 请生成"圆桌会议纪要"，格式要求：
1. 用 ## 标题标注"圆桌会议纪要"
2. 列出"多维共识"（3-5 条各位智囊的共同观点）
3. 列出"分歧与张力"（不同观点之间的碰撞）
4. 给出"行动建议"（按优先级排序的 3-5 条具体建议）
5. 用 > 引用格式附上一句金句总结
6. 总字数 300-500 字`;
}

// ── Mock 回复（无 LLM 时的降级方案）──
const MOCK_REPLIES: Record<string, (q: string) => { content: string; citedEvidenceIds: string[] }> = {
  'seat-wealth': (q) => ({
    content: `从现金流角度审视——核心问题是你的财务缓冲是否足够？\n\n**关键三点：**\n1. 至少 6-12 个月储备金\n2. 辞职前先用副业验证收入假设\n3. 区分资产与负债\n\n> 不要让对工作的不满驱动财务决策`,
    citedEvidenceIds: ['rd-e1', 'rd-e4'],
  }),
  'seat-decision': (q) => ({
    content: `用逆向思维——与其问"该不该辞职"，不如问"什么情况下一定后悔"。\n\n**反转检查：**\n- 创业失败最坏后果能承受吗？\n- 不创业三年后会懊悔吗？\n- 是否被"确认偏误"蒙蔽？\n\n> 好决策不是关于勇气，而是概率`,
    citedEvidenceIds: ['inf-e2', 'rd-e8'],
  }),
  'seat-career': (q) => ({
    content: `创业不是"有好产品"，是建立持续捕获价值的系统。\n\n**冷水：** 有首批真实客户吗？\n**火：** 时间窗口不等人，先用 MVP 在 30 天验证\n\n> 最好的创业时机是有收入时开始验证`,
    citedEvidenceIds: ['wolf-e1'],
  }),
  'seat-relationship': (q) => ({
    content: `不只你一个人的事。\n\n**家庭：** 家人支持吗？\n**社交资本：** 行业人脉够吗？\n\n> 不要在情绪最低谷做重大决策`,
    citedEvidenceIds: ['inf-e4', 'rd-e6'],
  }),
  'seat-creation': (q) => ({
    content: `我只关心——你做的东西是否好到让人无法忽视？\n\n**乔布斯法则：** 做一件，做到极致。先做出能引以为傲的原型。\n\n> 最好的产品是去掉所有不必要的东西`,
    citedEvidenceIds: ['wolf-e1'],
  }),
  'seat-body': (q) => ({
    content: `先问自己：\n- 睡眠质量如何？\n- 有运动习惯吗？\n- 是逃离痛苦还是追求愿景？\n\n> 创业者最常见的失败不是资金耗尽，是身心耗尽`,
    citedEvidenceIds: ['wolf-e7'],
  }),
  'seat-growth': (q) => ({
    content: `达利欧原则——痛苦+反思=进步。\n\n**框架：**\n1. 明确第一性原理\n2. 分解为可测试假设\n3. 设定止损线\n\n> 写下决策日记，记录假设与恐惧`,
    citedEvidenceIds: ['rd-e6', 'rd-e8'],
  }),
  'seat-philosophy': (q) => ({
    content: `反脆弱框架——你的计划是脆弱、强韧还是反脆弱的？\n\n**核心：** 做"小赌注、大回报"的不对称投资。\n\n> 正确的问题不是"该不该辞职"，而是"如何设计一个即使失败也能让我更强的实验"`,
    citedEvidenceIds: ['inf-e6', 'rd-e6'],
  }),
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question, selectedSeatIds } = body as { question: string; selectedSeatIds: string[] };

  if (!question || !selectedSeatIds?.length) {
    return Response.json({ error: '缺少问题或未选择席位' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      const responses: AgentResponse[] = [];

      for (const seatId of selectedSeatIds) {
        const seat = ROUNDTABLE_SEATS.find(s => s.id === seatId);
        if (!seat) continue;

        send({ type: 'thinking', seatId, persona: seat.persona, dimension: seat.dimension });
        await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));

        let content: string;
        let citedEvidenceIds: string[] = [];

        try {
          if (isLLMConfigured()) {
            // 真实 LLM 调用
            content = await llmChat([
              { role: 'system', content: buildSeatPrompt(seatId, question) },
              { role: 'user', content: question },
            ], { temperature: 0.8, maxTokens: 2048 });

            // 从关联书籍中提取被引用的 evidence IDs
            for (const bookId of seat.linkedBookIds) {
              const pack = ALL_MOCK_SBPACKS.find(p => p.bookId === bookId);
              if (pack) {
                for (const ev of pack.evidences) {
                  if (content.includes(ev.quote.slice(0, 20))) {
                    citedEvidenceIds.push(ev.id);
                  }
                }
              }
            }
          } else {
            // Mock 回复
            const mock = MOCK_REPLIES[seatId];
            const result = mock ? mock(question) : {
              content: `从${seat.dimension}的角度，这个问题需要谨慎评估。`,
              citedEvidenceIds: [],
            };
            content = result.content;
            citedEvidenceIds = result.citedEvidenceIds;
          }
        } catch (err: any) {
          content = `（${seat.persona}发言失败：${err.message}）`;
        }

        // 流式输出
        const chunks = content.match(/.{1,25}/g) || [content];
        for (const chunk of chunks) {
          send({ type: 'chunk', seatId, chunk });
          await new Promise(r => setTimeout(r, 20 + Math.random() * 40));
        }

        const response: AgentResponse = { seatId, persona: seat.persona, dimension: seat.dimension, content, citedEvidenceIds };
        responses.push(response);
        send({ type: 'complete', seatId, response });
        await new Promise(r => setTimeout(r, 300));
      }

      // 综合结论
      send({ type: 'conclusion_thinking' });
      await new Promise(r => setTimeout(r, 1000));

      let conclusion: string;

      try {
        if (isLLMConfigured()) {
          conclusion = await llmChat([
            { role: 'system', content: buildConclusionPrompt(question, responses) },
            { role: 'user', content: '请生成圆桌会议纪要。' },
          ], { temperature: 0.6, maxTokens: 4096 });
        } else {
          conclusion = `## 圆桌会议纪要\n\n**议题：** ${question}\n\n**与会智囊：** ${responses.map(r => `${r.dimension}席（${r.persona}）`).join('、')}\n\n### 多维共识\n${responses.map((r, i) => `${i + 1}. **${r.dimension}视角**：${r.content.split('\n')[0]}`).join('\n')}\n\n### 行动建议\n1. 先建立财务缓冲\n2. 用 MVP 30 天内验证\n3. 确保身心健康\n\n> "好的决策不是关于勇气，而是关于概率。"\n\n（Mock 模式 — 配置 LLM API Key 后将生成更深度的综合分析）`;
        }
      } catch (err: any) {
        conclusion = `结论生成失败：${err.message}`;
      }

      const conclusionChunks = conclusion.match(/.{1,25}/g) || [conclusion];
      for (const chunk of conclusionChunks) {
        send({ type: 'conclusion_chunk', chunk });
        await new Promise(r => setTimeout(r, 15 + Math.random() * 25));
      }

      send({ type: 'done', conclusion, responses });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}
