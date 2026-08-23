import type { SBPACK } from '../types/sbpack';

export const buffettLetters: SBPACK = {
  bookId: 'buffett-001',
  bookTitle: '巴菲特致股东的信',
  coverUrl: '/covers/buffett-letters.jpg',
  author: '沃伦·巴菲特',
  description: '巴菲特历年致伯克希尔股东信的精华合集，涵盖投资哲学、企业治理、价值评估、市场心理等核心思想，是价值投资的圣经级读物。',
  distilledAt: '2026-08-16T10:00:00Z',

  nodes: [
    {
      id: 'buf-k1',
      title: '价值投资核心原则',
      type: 'skill',
      summary: '以低于内在价值的价格买入优秀企业。内在价值是一家企业在其存续期间所能产生的现金流量的折现值。安全边际是保护伞。',
      dimension: '财富',
      weight: 5,
    },
    {
      id: 'buf-k2',
      title: '能力圈思维',
      type: 'skill',
      summary: '知道自己不知道什么，比知道什么更重要。永远只在自己的能力圈内做投资决策。不懂不做，看似简单却极难坚持。',
      dimension: '决策',
      weight: 5,
    },
    {
      id: 'buf-k3',
      title: '护城河分析',
      type: 'skill',
      summary: '竞争优势就像城堡的护城河。持久的竞争优势包括：品牌力、转换成本、网络效应、成本优势、规模经济。护城河越宽越深越好。',
      dimension: '财富',
      weight: 5,
    },
    {
      id: 'buf-k4',
      title: '长期持有哲学',
      type: 'knowledge',
      summary: '如果你不愿意持有一只股票十年，那就不要持有它十分钟。好公司的价值会随时间增长，频繁交易只会增加成本和犯错概率。',
      dimension: '财富',
      weight: 5,
    },
    {
      id: 'buf-k5',
      title: '管理层评估',
      type: 'skill',
      summary: '投资就是投人。好的管理层应当：诚实坦率、理性决策、热爱事业而非仅仅热爱金钱。看他们如何配置资本比看财报数字更重要。',
      dimension: '决策',
      weight: 4,
    },
    {
      id: 'buf-k6',
      title: '市场先生寓言',
      type: 'knowledge',
      summary: '市场先生每天都会来报价，有时乐观有时悲观。他的报价是你的仆人而非主人。利用他的情绪波动，而非被他的情绪影响。',
      dimension: '哲思',
      weight: 5,
    },
    {
      id: 'buf-k7',
      title: '复利的力量',
      type: 'knowledge',
      summary: '复利是世界第八大奇迹。年化20%的收益，10年后是6.2倍，20年后是38.3倍。关键是不要中断复利——避免大额亏损。',
      dimension: '财富',
      weight: 4,
    },
    {
      id: 'buf-k8',
      title: '逆向投资思维',
      type: 'skill',
      summary: '别人贪婪时恐惧，别人恐惧时贪婪。真正的机会往往出现在市场恐慌时刻。但逆向不是为了不同而不同，而是基于独立判断。',
      dimension: '决策',
      weight: 5,
    },
  ],

  evidences: [
    { id: 'buf-e1', quote: '价格是你付出的，价值是你得到的。', nodeId: 'buf-k1', location: '1984年致股东信' },
    { id: 'buf-e2', quote: '对于大多数投资者而言，重要的不是他们知道多少，而是他们如何诚实地面对自己不知道的。', nodeId: 'buf-k2', location: '1996年致股东信' },
    { id: 'buf-e3', quote: '只有退潮时，你才知道谁在裸泳。', nodeId: 'buf-k6', location: '1994年致股东信' },
    { id: 'buf-e4', quote: '如果你发现自己在一条漏水的船上，换一条船可能比修补漏洞更有成效。', nodeId: 'buf-k3', location: '1985年致股东信' },
    { id: 'buf-e5', quote: '投资的第一条规则是不要亏钱，第二条规则是不要忘记第一条。', nodeId: 'buf-k7', location: '综合' },
  ],

  relationships: [
    { source: 'buf-k1', target: 'buf-k3', relationType: '选股基础' },
    { source: 'buf-k2', target: 'buf-k5', relationType: '决策边界' },
    { source: 'buf-k4', target: 'buf-k7', relationType: '时间价值' },
    { source: 'buf-k6', target: 'buf-k8', relationType: '逆向逻辑' },
    { source: 'buf-k3', target: 'buf-k4', relationType: '价值持有' },
  ],
};
