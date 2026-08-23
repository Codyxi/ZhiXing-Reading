// ============================================================
// SBPACK — Standard Brain Knowledge Pack Protocol
// 核心类型定义 v1.0
// ============================================================

/** 单个知识点节点 */
export interface SBPACKNode {
  id: string;
  title: string;
  type: 'knowledge' | 'skill';
  summary: string;
  /** 所属维度标签，如 "财富"、"决策"、"事业" */
  dimension?: string;
  /** 重要程度 1-5 */
  weight?: number;
}

/** 原句依据 / Evidence */
export interface SBPACKEvidence {
  id: string;
  quote: string;
  nodeId: string;
  /** 原文页码或章节，可选 */
  location?: string;
}

/** 节点间关系 */
export interface SBPACKRelationship {
  source: string;
  target: string;
  relationType: string;
}

/** 完整 SBPACK 包 */
export interface SBPACK {
  bookId: string;
  bookTitle: string;
  coverUrl: string;
  author: string;
  /** 书籍简介 */
  description?: string;
  /** 蒸馏时间 */
  distilledAt?: string;
  nodes: SBPACKNode[];
  evidences: SBPACKEvidence[];
  relationships: SBPACKRelationship[];
}

// ============================================================
// 智囊团相关类型
// ============================================================

/** 圆桌席位定义 */
export interface RoundtableSeat {
  id: string;
  name: string;
  dimension: string;
  icon: string;
  /** 该席位关联的角色名，如 "巴菲特" */
  persona: string;
  /** 该席位关联的 SBPACK bookId 列表 */
  linkedBookIds: string[];
  /** 席位描述 */
  description: string;
}

/** 单个 Agent 的发言 */
export interface AgentResponse {
  seatId: string;
  persona: string;
  dimension: string;
  content: string;
  /** 引用的 evidence ID 列表 */
  citedEvidenceIds: string[];
}

/** 圆桌会议记录 */
export interface RoundtableSession {
  id: string;
  question: string;
  selectedSeatIds: string[];
  responses: AgentResponse[];
  conclusion: string;
  createdAt: string;
}

// ============================================================
// 思想会客厅相关类型
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** 挂载的上下文 */
  context?: ChatContext;
  /** 引用的依据 */
  citations?: SBPACKEvidence[];
  timestamp: string;
}

export interface ChatContext {
  activeBookIds: string[];
  activeNodeIds: string[];
  thinkingDepth: 'standard' | 'deep';
}

// ============================================================
// 图谱可视化相关类型
// ============================================================

export interface GraphNode {
  id: string;
  label: string;
  type: 'book' | 'knowledge' | 'skill';
  bookId?: string;
  dimension?: string;
  weight?: number;
  x?: number;
  y?: number;
  z?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationType: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
