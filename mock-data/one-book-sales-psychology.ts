import type { SBPACK } from '../types/sbpack';

export const oneBookSalesPsychology: SBPACK = {
  bookId: 'sales-001',
  bookTitle: '一本书读懂销售心理学',
  coverUrl: '/covers/sales-psychology.jpg',
  author: '李维',
  description: '将心理学原理系统应用于销售全流程，从客户心理洞察、需求挖掘到成交逼单，提供可直接使用的销售心理策略。',
  distilledAt: '2026-08-19T10:00:00Z',

  nodes: [
    {
      id: 'sal-k1',
      title: '客户心理画像',
      type: 'skill',
      summary: '不同类型客户有不同心理需求：理性型重数据、感性型重故事、主导型重效率、随和型重关系。快速识别客户类型是精准销售的前提。',
      dimension: '关系',
      weight: 5,
    },
    {
      id: 'sal-k2',
      title: '需求挖掘提问术',
      type: 'skill',
      summary: 'SPIN提问法：Situation(现状)→Problem(问题)→Implication(影响)→Need-payoff(需求回报)。通过层层递进的提问让客户自己意识到需求。',
      dimension: '关系',
      weight: 5,
    },
    {
      id: 'sal-k3',
      title: '信任建立五步法',
      type: 'skill',
      summary: '建立信任的路径：专业形象→共同话题→真诚倾听→提供价值→适度暴露弱点。完美反而让人警惕，适度的真实感更可信。',
      dimension: '关系',
      weight: 4,
    },
    {
      id: 'sal-k4',
      title: '价格锚定效应',
      type: 'knowledge',
      summary: '人们对"值不值"的判断依赖于锚点。先展示高价方案再展示目标方案，客户会觉得目标方案"划算"。但锚点必须合理可信。',
      dimension: '财富',
      weight: 4,
    },
    {
      id: 'sal-k5',
      title: '成交信号识别',
      type: 'skill',
      summary: '客户准备成交时会释放信号：反复询问细节、讨论使用场景、询问售后、表情放松、主动砍价而非拒绝。识别信号才能把握时机。',
      dimension: '事业',
      weight: 4,
    },
    {
      id: 'sal-k6',
      title: '异议处理框架',
      type: 'skill',
      summary: '面对异议的标准流程：倾听→认同感受→澄清→回应→确认。永远不要直接反驳客户异议，而是先认可再引导。',
      dimension: '关系',
      weight: 5,
    },
    {
      id: 'sal-k7',
      title: '损失厌恶应用',
      type: 'knowledge',
      summary: '人对损失的敏感度是收益的2倍。"不买会错过什么"比"买了会得到什么"更有驱动力。限时优惠、限量供应都是这一原理的应用。',
      dimension: '财富',
      weight: 4,
    },
  ],

  evidences: [
    { id: 'sal-e1', quote: '销售的本质不是说服，而是帮助客户发现他自己的需求。', nodeId: 'sal-k2', location: '第三章' },
    { id: 'sal-e2', quote: '客户不会因为你说了什么而信任你，而是因为你做了什么。', nodeId: 'sal-k3', location: '第四章' },
    { id: 'sal-e3', quote: '没有卖不出去的产品，只有不够了解客户的销售。', nodeId: 'sal-k1', location: '第二章' },
    { id: 'sal-e4', quote: '当客户开始问"如果我买了…"时，他已经做好了购买决定。', nodeId: 'sal-k5', location: '第七章' },
  ],

  relationships: [
    { source: 'sal-k1', target: 'sal-k2', relationType: '精准匹配' },
    { source: 'sal-k3', target: 'sal-k6', relationType: '信任基础' },
    { source: 'sal-k4', target: 'sal-k7', relationType: '心理驱动' },
    { source: 'sal-k2', target: 'sal-k5', relationType: '需求到成交' },
  ],
};
