'use client';

import { cn } from '@/lib/utils';
import type { AgentResponse, SBPACKEvidence } from '@root/types/sbpack';
import { ROUNDTABLE_SEATS } from '@root/mock-data/roundtable-seats';
import { ALL_MOCK_SBPACKS } from '@root/mock-data';
import { Quote, Zap, CheckCircle2, Loader2 } from 'lucide-react';

/** 从所有 SBPACK 中查找 evidence */
function findEvidence(evidenceId: string): SBPACKEvidence | null {
  for (const pack of ALL_MOCK_SBPACKS) {
    const ev = pack.evidences.find((e) => e.id === evidenceId);
    if (ev) return ev;
  }
  return null;
}

interface AgentMessageProps {
  response: AgentResponse;
  isStreaming?: boolean;
  streamedContent?: string;
}

export default function AgentMessage({ response, isStreaming, streamedContent }: AgentMessageProps) {
  const seat = ROUNDTABLE_SEATS.find((s) => s.id === response.seatId);
  const displayContent = isStreaming ? (streamedContent ?? '') : response.content;

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="mb-1.5 text-sm leading-relaxed text-text-primary">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold text-brand">{part}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="rounded-xl border border-border bg-bg-hover p-5">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{seat?.icon ?? '💬'}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand">
                {response.dimension}席 · {response.persona}
              </span>
              {isStreaming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-text-muted" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              )}
            </div>
            <p className="text-[10px] text-text-muted">
              基于 {seat?.linkedBookIds?.length ?? 0} 本关联书籍的知识输出
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-none">
        {renderContent(displayContent)}
        {isStreaming && (
          <span className="inline-block h-4 w-0.5 animate-pulse bg-text-primary" />
        )}
      </div>

      {/* Cited Evidences */}
      {!isStreaming && response.citedEvidenceIds.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Quote className="h-3.5 w-3.5 text-text-muted" />
            <span className="text-xs font-medium text-text-muted">引用依据</span>
          </div>
          <div className="space-y-2">
            {response.citedEvidenceIds.map((eid, idx) => {
              const evidence = findEvidence(eid);
              if (!evidence) return null;
              return (
                <div key={idx} className="flex items-start gap-2 rounded-lg border-l-2 border-brand/20 bg-bg-card px-3 py-2">
                  <Zap className="mt-0.5 h-3 w-3 shrink-0 text-text-muted" />
                  <p className="text-xs italic text-text-secondary">
                    &ldquo;{evidence.quote}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
