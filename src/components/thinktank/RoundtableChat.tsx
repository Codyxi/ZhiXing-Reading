'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AgentResponse } from '@root/types/sbpack';
import { Send, Loader2, FileText, RotateCcw } from 'lucide-react';
import AgentMessage from './AgentMessage';

interface SSEEvent {
  type: 'thinking' | 'chunk' | 'complete' | 'conclusion_thinking' | 'conclusion_chunk' | 'done';
  seatId?: string;
  persona?: string;
  dimension?: string;
  chunk?: string;
  response?: AgentResponse;
  conclusion?: string;
  responses?: AgentResponse[];
}

interface RoundtableChatProps {
  selectedSeatIds: string[];
  disabled?: boolean;
  onSpeakingChange?: (seatId: string | null) => void;
  onSeatComplete?: (seatId: string) => void;
  onComplete?: () => void;
}

export default function RoundtableChat({
  selectedSeatIds,
  disabled,
  onSpeakingChange,
  onSeatComplete,
  onComplete,
}: RoundtableChatProps) {
  const [question, setQuestion] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [responses, setResponses] = useState<AgentResponse[]>([]);
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({});
  const [currentThinkingSeat, setCurrentThinkingSeat] = useState<string | null>(null);
  const [conclusion, setConclusion] = useState('');
  const [conclusionStreaming, setConclusionStreaming] = useState('');
  const [isConclusionThinking, setIsConclusionThinking] = useState(false);
  const [isConclusionDone, setIsConclusionDone] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [responses, streamingContent, conclusionStreaming]);

  const handleStart = useCallback(async () => {
    if (!question.trim() || selectedSeatIds.length < 2) return;

    setIsRunning(true);
    setResponses([]);
    setStreamingContent({});
    setCurrentThinkingSeat(null);
    setConclusion('');
    setConclusionStreaming('');
    setIsConclusionThinking(false);
    setIsConclusionDone(false);

    try {
      const res = await fetch('/api/roundtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), selectedSeatIds }),
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6);
          try {
            const event: SSEEvent = JSON.parse(json);

            switch (event.type) {
              case 'thinking':
                setCurrentThinkingSeat(event.seatId ?? null);
                onSpeakingChange?.(event.seatId ?? null);
                setStreamingContent(prev => ({ ...prev, [event.seatId!]: '' }));
                break;

              case 'chunk':
                setStreamingContent(prev => ({
                  ...prev,
                  [event.seatId!]: (prev[event.seatId!] ?? '') + (event.chunk ?? ''),
                }));
                break;

              case 'complete':
                if (event.response) {
                  setResponses(prev => [...prev, event.response!]);
                  setStreamingContent(prev => {
                    const next = { ...prev };
                    delete next[event.response!.seatId];
                    return next;
                  });
                  onSeatComplete?.(event.response.seatId);
                  onSpeakingChange?.(null);
                  setCurrentThinkingSeat(null);
                }
                break;

              case 'conclusion_thinking':
                setIsConclusionThinking(true);
                setCurrentThinkingSeat(null);
                onSpeakingChange?.(null);
                break;

              case 'conclusion_chunk':
                setConclusionStreaming(prev => prev + (event.chunk ?? ''));
                break;

              case 'done':
                setConclusion(event.conclusion ?? '');
                setConclusionStreaming('');
                setIsConclusionThinking(false);
                setIsConclusionDone(true);
                setIsRunning(false);
                onComplete?.();
                break;
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error('Roundtable error:', err);
      setIsRunning(false);
    }
  }, [question, selectedSeatIds, onSpeakingChange, onSeatComplete, onComplete]);

  const handleReset = () => {
    setQuestion('');
    setResponses([]);
    setStreamingContent({});
    setCurrentThinkingSeat(null);
    setConclusion('');
    setConclusionStreaming('');
    setIsConclusionThinking(false);
    setIsConclusionDone(false);
    setIsRunning(false);
  };

  const canStart = question.trim().length > 0 && selectedSeatIds.length >= 2 && !isRunning;

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-2">
        {/* Empty state */}
        {responses.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="empty-state-icon">
              <span className="text-3xl">🏛️</span>
            </div>
            <h3 className="empty-state-title">发起圆桌讨论</h3>
            <p className="empty-state-desc">
              在左侧选择 2-4 个席位，然后输入你的问题，<br />
              智囊团将从多维度为你提供决策建议
            </p>
          </div>
        )}

        {responses.map((resp) => (
          <AgentMessage key={resp.seatId} response={resp} />
        ))}

        {currentThinkingSeat && streamingContent[currentThinkingSeat] !== undefined && (
          <AgentMessage
            response={{
              seatId: currentThinkingSeat,
              persona: '',
              dimension: '',
              content: '',
              citedEvidenceIds: [],
            }}
            isStreaming
            streamedContent={streamingContent[currentThinkingSeat]}
          />
        )}

        {currentThinkingSeat && !streamingContent[currentThinkingSeat] && (
          <div className="flex items-center gap-3 rounded-xl bg-bg-hover px-5 py-4 border border-border">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            <span className="text-sm text-text-muted">智囊正在思考中…</span>
          </div>
        )}

        {isConclusionThinking && !conclusionStreaming && (
          <div className="flex items-center gap-3 rounded-xl bg-brand/5 px-5 py-4 border border-brand/15">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            <span className="text-sm text-brand">综合决议生成中…</span>
          </div>
        )}

        {(conclusionStreaming || conclusion) && (
          <div className="rounded-xl border border-brand/15 bg-brand/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <span className="text-sm font-bold text-brand">圆桌会议纪要</span>
              {isConclusionDone && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success">已完成</span>
              )}
            </div>
            <div className="max-w-none">
              {(conclusionStreaming || conclusion).split('\n').map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                const parts = line.split(/\*\*(.*?)\*\*/g);
                if (line.startsWith('## ')) {
                  return <h3 key={i} className="mb-2 text-base font-bold text-brand">{line.replace('## ', '')}</h3>;
                }
                if (line.startsWith('### ')) {
                  return <h4 key={i} className="mb-1.5 text-sm font-semibold text-text-primary">{line.replace('### ', '')}</h4>;
                }
                if (line.startsWith('---')) {
                  return <hr key={i} className="my-3 border-border" />;
                }
                if (line.startsWith('> ')) {
                  return (
                    <blockquote key={i} className="my-2 border-l-2 border-brand/30 pl-3 text-xs italic text-text-secondary">
                      {line.replace('> ', '')}
                    </blockquote>
                  );
                }
                if (/^\d+\.\s/.test(line)) {
                  return (
                    <p key={i} className="mb-1 text-sm text-text-primary">
                      {parts.map((part, j) =>
                        j % 2 === 1 ? <strong key={j} className="text-brand">{part}</strong> : <span key={j}>{part}</span>
                      )}
                    </p>
                  );
                }
                return (
                  <p key={i} className="mb-1.5 text-sm leading-relaxed text-text-primary">
                    {parts.map((part, j) =>
                      j % 2 === 1 ? <strong key={j} className="text-brand">{part}</strong> : <span key={j}>{part}</span>
                    )}
                  </p>
                );
              })}
              {!isConclusionDone && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-brand" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="mt-4 shrink-0">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canStart && handleStart()}
              placeholder={selectedSeatIds.length < 2 ? '请先在左侧选择至少 2 个席位…' : '输入你的问题，例如："我该不该辞职去创业？"'}
              disabled={disabled || isRunning}
              className={cn(
                'h-12 w-full rounded-lg border bg-bg-hover px-4 pr-12 text-sm text-text-primary placeholder-text-faint outline-none transition-all',
                'focus:border-brand/40 focus:shadow-brand',
                isRunning ? 'border-brand/20' : 'border-border',
              )}
            />
          </div>

          {isConclusionDone ? (
            <button
              onClick={handleReset}
              className="flex h-12 items-center gap-2 rounded-lg bg-bg-hover px-5 text-sm font-medium text-text-secondary transition-all hover:bg-border-light hover:text-text-primary"
            >
              <RotateCcw className="h-4 w-4" />
              重新开始
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={!canStart}
              className={cn(
                'flex h-12 items-center gap-2 rounded-lg px-6 text-sm font-medium transition-all',
                canStart
                  ? 'bg-brand text-white shadow-card-sm hover:shadow-card'
                  : 'bg-bg-hover text-text-faint cursor-not-allowed',
              )}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  讨论中…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  召集圆桌
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
