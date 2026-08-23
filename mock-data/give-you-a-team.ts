import type { SBPACK } from '../types/sbpack';

export const giveYouATeam: SBPACK = {
  bookId: 'team-001',
  bookTitle: '给你一个团队，你能怎么管',
  coverUrl: '/covers/give-you-a-team.jpg',
  author: '赵伟',
  description: '从团队组建、目标设定、激励机制到文化建设，系统讲述管理者如何从"做事的人"转型为"带人做事的人"。',
  distilledAt: '2026-08-18T10:00:00Z',

  nodes: [
    {
      id: 'tea-k1',
      title: '管理者角色转型',
      type: 'knowledge',
      summary: '从个人贡献者到管理者的最大障碍不是技能，而是心态。管理者的价值不在于自己做了多少，而在于团队产出了多少。',
      dimension: '事业',
      weight: 5,
    },
    {
      id: 'tea-k2',
      title: '目标对齐与拆解',
      type: 'skill',
      summary: 'OKR式目标对齐：公司目标→部门目标→个人目标，每层都要回答"为什么"。目标不清晰是团队低效的第一大原因。',
      dimension: '事业',
      weight: 5,
    },
    {
      id: 'tea-k3',
      title: '因人而异的激励',
      type: 'skill',
      summary: '马斯洛需求层次在管理中的应用：基层重薪资安全、中层重归属认可、高层重自我实现。一刀切的激励方案注定低效。',
      dimension: '关系',
      weight: 4,
    },
    {
      id: 'tea-k4',
      title: '高效会议方法论',
      type: 'skill',
      summary: '亚马逊的"六页纸"会议：会前阅读→静默阅读→讨论→决策。消灭PPT汇报式会议，让讨论聚焦在决策而非信息传递。',
      dimension: '事业',
      weight: 4,
    },
    {
      id: 'tea-k5',
      title: '冲突管理策略',
      type: 'skill',
      summary: '适度的建设性冲突对团队有益。管理者要区分"对事冲突"和"对人冲突"，前者鼓励后者制止。冲突是创新的催化剂。',
      dimension: '关系',
      weight: 4,
    },
    {
      id: 'tea-k6',
      title: '团队文化建设',
      type: 'knowledge',
      summary: '文化不是墙上的标语，而是"当老板不在时员工怎么做事"。文化通过制度、仪式、故事和榜样来塑造，需要长期坚持。',
      dimension: '成长',
      weight: 5,
    },
    {
      id: 'tea-k7',
      title: '授权与容错',
      type: 'skill',
      summary: '授权不是甩锅。清晰的授权边界+明确的底线+事后的复盘，三者缺一不可。不允许犯错的团队最终会失去主动性。',
      dimension: '事业',
      weight: 4,
    },
    {
      id: 'tea-k8',
      title: '招聘的奥卡姆剃刀',
      type: 'knowledge',
      summary: '选人比培养人更重要。招错一个人的成本是其薪资的3-5倍。面试中要关注候选人的思维模式而非仅看技能匹配。',
      dimension: '决策',
      weight: 4,
    },
  ],

  evidences: [
    { id: 'tea-e1', quote: '管理者的绩效不是自己做了什么，而是团队做了什么。', nodeId: 'tea-k1', location: '第一章' },
    { id: 'tea-e2', quote: '目标不清晰的团队就像没有目的地的船，任何方向的风都是逆风。', nodeId: 'tea-k2', location: '第二章' },
    { id: 'tea-e3', quote: '好的制度让坏人变好，坏的制度让好人变坏。', nodeId: 'tea-k6', location: '第六章' },
    { id: 'tea-e4', quote: '授权的最高境界是：下属觉得成功是他自己的功劳，失败也是他自己的责任。', nodeId: 'tea-k7', location: '第七章' },
  ],

  relationships: [
    { source: 'tea-k1', target: 'tea-k2', relationType: '角色基础' },
    { source: 'tea-k3', target: 'tea-k6', relationType: '文化驱动' },
    { source: 'tea-k4', target: 'tea-k5', relationType: '协作机制' },
    { source: 'tea-k7', target: 'tea-k1', relationType: '管理升级' },
    { source: 'tea-k8', target: 'tea-k3', relationType: '人才基础' },
  ],
};
