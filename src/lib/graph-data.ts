import type { SBPACK, SBPACKNode, GraphNode, GraphEdge, GraphData } from '@root/types/sbpack';
import { ALL_MOCK_SBPACKS } from '@root/mock-data';

/** 中性色映射 — 每本书使用统一的灰调，通过色带区分 */
export const BOOK_COLORS: Record<string, string> = {
  'richdad-001':   '#B4B8C0',
  'wolf-001':      '#B4B8C0',
  'influence-001': '#B4B8C0',
  'ask-001':       '#B4B8C0',
  'sales-001':     '#B4B8C0',
  'team-001':      '#B4B8C0',
  'weakness-001':  '#B4B8C0',
  'buffett-001':   '#B4B8C0',
};

/** 节点类型颜色 — 使用品牌色系 */
export const NODE_TYPE_COLORS = {
  knowledge: '#6C8CFF',
  skill:     '#B4B8C0',
} as const;

export const DEFAULT_BOOK_COLOR = '#7A7F8A';

/**
 * 将 SBPACK 数组转换为图谱数据
 */
export function buildGraphData(
  packs: SBPACK[] = ALL_MOCK_SBPACKS
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const pack of packs) {
    nodes.push({
      id: pack.bookId,
      label: pack.bookTitle,
      type: 'book',
      bookId: pack.bookId,
      weight: 5,
    });

    for (const node of pack.nodes) {
      nodes.push({
        id: node.id,
        label: node.title,
        type: node.type,
        bookId: pack.bookId,
        dimension: node.dimension,
        weight: node.weight ?? 3,
      });

      edges.push({
        source: node.id,
        target: pack.bookId,
        relationType: 'belongs-to',
      });
    }

    for (const rel of pack.relationships) {
      edges.push({
        source: rel.source,
        target: rel.target,
        relationType: rel.relationType,
      });
    }
  }

  return { nodes, edges };
}

/**
 * 从 SBPACK 数据中查找节点的完整信息
 */
export function findNodeDetail(nodeId: string) {
  for (const pack of ALL_MOCK_SBPACKS) {
    if (pack.bookId === nodeId) {
      return { node: null, pack, evidences: [] };
    }
    const found = pack.nodes.find((n) => n.id === nodeId);
    if (found) {
      const evidences = pack.evidences.filter((e) => e.nodeId === nodeId);
      return { node: found, pack, evidences };
    }
  }
  return null;
}

export function getBookColor(bookId?: string): string {
  if (!bookId) return DEFAULT_BOOK_COLOR;
  return BOOK_COLORS[bookId] ?? DEFAULT_BOOK_COLOR;
}

export function getNodeColor(node: GraphNode): string {
  if (node.type === 'book') return getBookColor(node.bookId);
  return NODE_TYPE_COLORS[node.type] ?? DEFAULT_BOOK_COLOR;
}
