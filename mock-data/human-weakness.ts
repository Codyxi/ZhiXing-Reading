import type { SBPACK } from '../types/sbpack';

export const humanWeakness: SBPACK = {
  bookId: 'weakness-001',
  bookTitle: '人性的弱点全集',
  coverUrl: '/covers/human-weakness.jpg',
  author: '戴尔·卡耐基',
  description: '人际关系领域的奠基之作，系统阐述了如何赢得他人好感、如何说服他人、如何改变他人而不引起反感等核心社交技能。',
  distilledAt: '2026-08-17T10:00:00Z',

  nodes: [
    {
      id: 'hw-k1',
      title: '真诚地关心他人',
      type: 'skill',
      summary: '人际关系的第一原则：你要别人怎样待你，你就先怎样待别人。但更重要的是，这种关心必须是真诚的——人能本能地分辨真假。',
      dimension: '关系',
      weight: 5,
    },
    {
      id: 'hw-k2',
      title: '记住他人的名字',
      type: 'skill',
      summary: '名字是人听到的最甜蜜的声音。记住并正确使用他人的名字，是最简单也最被忽视的尊重方式。这是建立个人联结的快捷键。',
      dimension: '关系',
      weight: 3,
    },
    {
      id: 'hw-k3',
      title: '做一个好的倾听者',
      type: 'skill',
      summary: '鼓励他人谈论他们自己，做一个专注的倾听者。人们对自己的兴趣远大于对你的话题。让对方感到被重视，你就赢得了好感。',
      dimension: '关系',
      weight: 5,
    },
    {
      id: 'hw-k4',
      title: '避免批评与指责',
      type: 'knowledge',
      summary: '批评是无用的，因为它使人处于防御状态，并竭力为自己辩护。批评是危险的，因为它伤害一个人的自尊心，激起怨恨。',
      dimension: '关系',
      weight: 5,
    },
    {
      id: 'hw-k5',
      title: '激发他人需求',
      type: 'skill',
      summary: '说服别人的唯一方法是：谈论他所想要的，并告诉他如何去得到。站在对方角度看问题，激发对方内心的需求。',
      dimension: '关系',
      weight: 5,
    },
    {
      id: 'hw-k6',
      title: '赞美的力量',
      type: 'skill',
      summary: '真诚的赞美是人人渴望的精神食粮。赞美要具体、要真诚、要在人前赞美。但虚假的奉承比不赞美更糟糕。',
      dimension: '关系',
      weight: 4,
    },
    {
      id: 'hw-k7',
      title: '让对方感到重要',
      type: 'knowledge',
      summary: '每个人内心深处都有一种"重要感"的需求。满足这种需求，你就拥有了打开任何人心门的钥匙。让别人觉得他比你更重要。',
      dimension: '关系',
      weight: 4,
    },
    {
      id: 'hw-k8',
      title: '不争论的智慧',
      type: 'skill',
      summary: '你不可能在争论中获胜——即使你赢了，对方也不会认同你。避免争论、尊重对方观点、从对方角度思考，这才是真正的智慧。',
      dimension: '哲思',
      weight: 5,
    },
  ],

  evidences: [
    { id: 'hw-e1', quote: '如果你想要别人喜欢你，就要真诚地关注别人。', nodeId: 'hw-k1', location: '第一章' },
    { id: 'hw-e2', quote: '一滴蜜比一加仑胆汁能捉到更多苍蝇。', nodeId: 'hw-k4', location: '第一章' },
    { id: 'hw-e3', quote: '天底下只有一种方法可以影响他人，那就是谈论他所要的，并告诉他如何去得到。', nodeId: 'hw-k5', location: '第四章' },
    { id: 'hw-e4', quote: '人们真正需要的是被重视的感觉，而不是被喂饱的感觉。', nodeId: 'hw-k7', location: '第五章' },
    { id: 'hw-e5', quote: '能进便宜的人才付得起做自己的代价。', nodeId: 'hw-k8', location: '第三章' },
  ],

  relationships: [
    { source: 'hw-k1', target: 'hw-k3', relationType: '基础能力' },
    { source: 'hw-k3', target: 'hw-k7', relationType: '尊重传递' },
    { source: 'hw-k4', target: 'hw-k8', relationType: '避免冲突' },
    { source: 'hw-k5', target: 'hw-k6', relationType: '激励组合' },
    { source: 'hw-k6', target: 'hw-k2', relationType: '个人化关注' },
  ],
};
