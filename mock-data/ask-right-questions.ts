import type { SBPACK } from '../types/sbpack';

export const askRightQuestions: SBPACK = {
  bookId: 'ask-001',
  bookTitle: '学会提问',
  coverUrl: '/covers/ask-right-questions.jpg',
  author: '尼尔·布朗 / 斯图尔特·基利',
  description: '批判性思维入门经典，教你如何识别论证中的逻辑漏洞、区分事实与观点、提出关键问题来评估任何主张的可靠性。',
  distilledAt: '2026-08-20T10:00:00Z',

  nodes: [
    {
      id: 'ask-k1',
      title: '批判性思维基础',
      type: 'knowledge',
      summary: '批判性思维不是挑刺，而是一套系统的思考框架：识别论题和结论、检查理由是否充分、发现隐含假设、评估证据质量。',
      dimension: '哲思',
      weight: 5,
    },
    {
      id: 'ask-k2',
      title: '识别论证结构',
      type: 'skill',
      summary: '任何论证都由论题(What)、结论(Conclusion)、理由(Reason)三部分组成。快速拆解他人论述的第一步就是找到这三要素。',
      dimension: '决策',
      weight: 5,
    },
    {
      id: 'ask-k3',
      title: '发现隐含假设',
      type: 'skill',
      summary: '论证中最危险的部分往往是没说出口的假设。价值观假设和描述性假设是两种核心类型，识别它们能暴露论证的真正弱点。',
      dimension: '决策',
      weight: 5,
    },
    {
      id: 'ask-k4',
      title: '评估证据质量',
      type: 'knowledge',
      summary: '并非所有证据都等价。要区分：个人经历vs系统研究、典型案例vs统计数据、类比论证的适用边界、因果关系vs相关关系。',
      dimension: '决策',
      weight: 4,
    },
    {
      id: 'ask-k5',
      title: '识别逻辑谬误',
      type: 'skill',
      summary: '常见谬误包括：人身攻击、诉诸权威、滑坡论证、虚假两难、循环论证、转移话题。识别这些是防御性思考的基础。',
      dimension: '哲思',
      weight: 5,
    },
    {
      id: 'ask-k6',
      title: '提出关键问题',
      type: 'skill',
      summary: '面对任何主张，应系统追问：论题是什么？结论是什么？理由是什么？哪些词语意思不明确？有没有隐含假设？推理中有没有谬误？',
      dimension: '决策',
      weight: 4,
    },
    {
      id: 'ask-k7',
      title: '区分事实与观点',
      type: 'knowledge',
      summary: '事实可以被验证，观点则包含价值判断。很多论述混淆两者来增强说服力。学会区分是独立思考的第一步。',
      dimension: '哲思',
      weight: 4,
    },
    {
      id: 'ask-k8',
      title: '多元视角思考',
      type: 'skill',
      summary: '对同一问题，尝试站在不同利益相关者的角度思考。这能帮你发现自己立场的盲点，形成更全面的判断。',
      dimension: '成长',
      weight: 4,
    },
  ],

  evidences: [
    { id: 'ask-e1', quote: '一个人的论证就像一座冰山——露出水面的只是结论，水面下的理由和假设才是主体。', nodeId: 'ask-k2', location: '第二章' },
    { id: 'ask-e2', quote: '最需要警惕的不是明显的错误，而是那些看起来理所当然的前提。', nodeId: 'ask-k3', location: '第三章' },
    { id: 'ask-e3', quote: '统计数据不会说谎，但统计者会。', nodeId: 'ask-k4', location: '第五章' },
    { id: 'ask-e4', quote: '当有人说"大家都这么做"时，恰恰是最需要追问"为什么"的时候。', nodeId: 'ask-k5', location: '第六章' },
    { id: 'ask-e5', quote: '批判性思维的目标不是赢得辩论，而是做出更好的判断。', nodeId: 'ask-k1', location: '第一章' },
  ],

  relationships: [
    { source: 'ask-k2', target: 'ask-k3', relationType: '深入分析' },
    { source: 'ask-k3', target: 'ask-k5', relationType: '发现弱点' },
    { source: 'ask-k4', target: 'ask-k7', relationType: '证据评估' },
    { source: 'ask-k6', target: 'ask-k2', relationType: '系统追问' },
    { source: 'ask-k5', target: 'ask-k8', relationType: '认知升级' },
  ],
};
