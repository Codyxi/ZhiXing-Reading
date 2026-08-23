'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SBPACK, ChatMessage, ChatContext } from '@root/types/sbpack';
import { ALL_MOCK_SBPACKS } from '@root/mock-data';

// ── Store 类型 ──
interface SBPACKStore {
  /** 所有已加载的 SBPACK */
  packs: SBPACK[];
  /** 添加新的 SBPACK */
  addPack: (pack: SBPACK) => void;
  /** 移除 SBPACK */
  removePack: (bookId: string) => void;
  /** 根据 ID 查找 */
  getPack: (bookId: string) => SBPACK | undefined;

  // ── 思想会客厅状态 ──
  /** 当前绑定的书籍 ID */
  activeBookId: string | null;
  setActiveBookId: (id: string | null) => void;
  /** 已挂载的知识节点 ID */
  mountedNodeIds: string[];
  toggleMountedNode: (nodeId: string) => void;
  clearMountedNodes: () => void;
  /** 思考深度 */
  thinkingDepth: 'standard' | 'deep';
  setThinkingDepth: (d: 'standard' | 'deep') => void;
  /** 对话历史 */
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

const SBPACKContext = createContext<SBPACKStore | null>(null);

export function SBPACKProvider({ children }: { children: ReactNode }) {
  const [packs, setPacks] = useState<SBPACK[]>([...ALL_MOCK_SBPACKS]);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [mountedNodeIds, setMountedNodeIds] = useState<string[]>([]);
  const [thinkingDepth, setThinkingDepth] = useState<'standard' | 'deep'>('standard');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const addPack = useCallback((pack: SBPACK) => {
    setPacks((prev) => {
      if (prev.some((p) => p.bookId === pack.bookId)) return prev;
      return [...prev, pack];
    });
  }, []);

  const removePack = useCallback((bookId: string) => {
    setPacks((prev) => prev.filter((p) => p.bookId !== bookId));
  }, []);

  const getPack = useCallback(
    (bookId: string) => packs.find((p) => p.bookId === bookId),
    [packs]
  );

  const toggleMountedNode = useCallback((nodeId: string) => {
    setMountedNodeIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  }, []);

  const clearMountedNodes = useCallback(() => setMountedNodeIds([]), []);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  const clearChat = useCallback(() => setChatMessages([]), []);

  return (
    <SBPACKContext.Provider
      value={{
        packs,
        addPack,
        removePack,
        getPack,
        activeBookId,
        setActiveBookId,
        mountedNodeIds,
        toggleMountedNode,
        clearMountedNodes,
        thinkingDepth,
        setThinkingDepth,
        chatMessages,
        addChatMessage,
        clearChat,
      }}
    >
      {children}
    </SBPACKContext.Provider>
  );
}

export function useSBPACK(): SBPACKStore {
  const ctx = useContext(SBPACKContext);
  if (!ctx) throw new Error('useSBPACK must be used within SBPACKProvider');
  return ctx;
}
