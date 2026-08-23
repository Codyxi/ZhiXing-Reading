'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSBPACK } from '@/lib/store';
import type { ChatMessage as ChatMsg, SBPACKEvidence } from '@root/types/sbpack';
import { ALL_MOCK_SBPACKS } from '@root/mock-data';
import BookSelector from './BookSelector';
import ContextBar from './ContextBar';
import ChatMessageComponent from './ChatMessage';
import { Send, Loader2, Trash2, Lightbulb, Zap } from 'lucide-react';

export default function ChatParlor() {
  const {
    activeBookId, mountedNodeIds, thinkingDepth,
    chatMessages, addChatMessage, clearChat, getPack,
    toggleMountedNode,
  } = useSBPACK();

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const pack = activeBookId ? getPack(activeBookId) : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, streamingContent]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      context: {
        activeBookIds: activeBookId ? [activeBookId] : [],
        activeNodeIds: [...mountedNodeIds],
        thinkingDepth,
      },
    };
    addChatMessage(userMsg);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const recentMessages = [...chatMessages.slice(-8), userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentMessages,
          context: { bookId: activeBookId, mountedNodeIds, thinkingDepth },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '请求失败' }));
        throw new Error(err.error ?? '请求失败');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) throw e;
          }
        }
      }

      const citations: SBPACKEvidence[] = [];
      if (pack) {
        const evidencePattern = /\[依据:\s*"(.+?)"\]/g;
        let match;
        while ((match = evidencePattern.exec(fullContent)) !== null) {
          const quoteText = match[1];
          const ev = pack.evidences.find(e => e.quote.includes(quoteText.slice(0, 30)));
          if (ev && !citations.find(c => c.id === ev.id)) citations.push(ev);
        }
        if (citations.length === 0 && mountedNodeIds.length > 0) {
          for (const nodeId of mountedNodeIds.slice(0, 2)) {
            const ev = pack.evidences.find(e => e.nodeId === nodeId);
            if (ev) citations.push(ev);
          }
        }
      }

      addChatMessage({
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date().toISOString(),
        citations,
      });
    } catch (err: any) {
      addChatMessage({
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        content: `抱歉，出现了一个错误：${err.message}\n\n如果是 API 配置问题，请点击右上角的设置按钮配置 LLM 连接。`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [input, activeBookId, mountedNodeIds, thinkingDepth, chatMessages, addChatMessage, isStreaming, pack]);

  return (
    <div className="flex h-[calc(100vh-180px)] overflow-hidden rounded-xl border border-border bg-bg-card">
      <BookSelector />

      <div className="flex flex-1 flex-col">
        <ContextBar />

        {pack && (
          <div className="flex flex-wrap gap-1.5 border-b border-border bg-bg-card px-4 py-2">
            <span className="self-center mr-1 text-[10px] text-text-muted">挂载节点:</span>
            {pack.nodes.map((node) => {
              const isMounted = mountedNodeIds.includes(node.id);
              return (
                <button
                  key={node.id}
                  onClick={() => toggleMountedNode(node.id)}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all',
                    isMounted
                      ? node.type === 'skill' ? 'bg-bg-hover text-text-secondary' : 'bg-brand/10 text-brand'
                      : 'bg-bg-hover text-text-faint hover:bg-border-light hover:text-text-muted'
                  )}
                >
                  {node.type === 'skill' ? <Zap className="h-2.5 w-2.5" /> : <Lightbulb className="h-2.5 w-2.5" />}
                  {node.title}
                </button>
              );
            })}
          </div>
        )}

        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {chatMessages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="empty-state-icon">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="empty-state-title">会客厅</h3>
              <p className="empty-state-desc">
                在左侧选择知识书籍，挂载知识点作为上下文，<br />
                然后开始对话。AI 将基于知识库为你提供有依据的回答。
              </p>
            </div>
          )}

          {chatMessages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} />
          ))}

          {isStreaming && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-hover">
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-bg-hover px-4 py-3">
                {streamingContent ? (
                  <div className="text-sm leading-relaxed text-text-primary">
                    {streamingContent.split('\n').map((line, i) => {
                      if (!line.trim()) return <br key={i} />;
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i} className="mb-1">
                          {parts.map((part, j) =>
                            j % 2 === 1 ? <strong key={j} className="font-semibold text-brand">{part}</strong> : <span key={j}>{part}</span>
                          )}
                        </p>
                      );
                    })}
                    <span className="inline-block h-4 w-0.5 animate-pulse bg-text-primary" />
                  </div>
                ) : (
                  <span className="text-sm text-text-muted animate-pulse">正在思考中…</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-bg-card px-5 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={pack ? `基于《${pack.bookTitle}》提问…` : '选择知识书籍后开始提问…'}
              disabled={isStreaming}
              className="flex-1 h-11 rounded-lg border border-border bg-bg-hover px-4 text-sm text-text-primary placeholder-text-faint outline-none transition-all focus:border-brand/40 focus:shadow-brand disabled:opacity-50"
            />
            {chatMessages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-bg-hover text-text-muted hover:bg-error/10 hover:text-error"
                title="清空对话"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className={cn(
                'flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium transition-all',
                input.trim() && !isStreaming
                  ? 'bg-brand text-white shadow-card-sm hover:shadow-card'
                  : 'bg-bg-hover text-text-faint cursor-not-allowed'
              )}
            >
              <Send className="h-4 w-4" />
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
