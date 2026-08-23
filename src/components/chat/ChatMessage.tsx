'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType, SBPACKEvidence } from '@root/types/sbpack';
import { ALL_MOCK_SBPACKS } from '@root/mock-data';
import { User, Bot, Quote, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

function findEvidence(evidenceId: string): SBPACKEvidence | null {
  for (const pack of ALL_MOCK_SBPACKS) {
    const ev = pack.evidences.find((e) => e.id === evidenceId);
    if (ev) return ev;
  }
  return null;
}

export default function ChatMessageComponent({ message }: ChatMessageProps) {
  const [showCitations, setShowCitations] = useState(false);
  const isUser = message.role === 'user';
  const citations = message.citations ?? [];

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isUser ? 'bg-brand/10' : 'bg-bg-hover'
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-brand" />
        ) : (
          <Bot className="h-4 w-4 text-text-muted" />
        )}
      </div>

      <div className={cn('max-w-[80%] space-y-2', isUser && 'text-right')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-tr-sm bg-brand text-white'
            : 'rounded-tl-sm bg-bg-hover text-text-primary'
        )}>
          {message.content.split('\n').map((line, i) => {
            if (!line.trim()) return <br key={i} />;
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} className="mb-1">
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j} className={cn('font-semibold', isUser ? 'text-white' : 'text-brand')}>{part}</strong> : <span key={j}>{part}</span>
                )}
              </p>
            );
          })}
        </div>

        {!isUser && citations.length > 0 && (
          <div>
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center gap-1.5 rounded-lg bg-bg-hover px-3 py-1.5 text-[11px] font-medium text-text-muted transition-colors hover:text-text-secondary"
            >
              <Quote className="h-3 w-3" />
              {citations.length} 条相关依据
              {showCitations ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {showCitations && (
              <div className="mt-2 space-y-2">
                {citations.map((ev, idx) => (
                  <div key={idx} className="rounded-lg border-l-2 border-brand/30 bg-bg-hover px-3 py-2.5">
                    <p className="text-xs italic leading-relaxed text-text-secondary">
                      &ldquo;{ev.quote}&rdquo;
                    </p>
                    {ev.location && (
                      <p className="mt-1 text-[10px] text-text-muted">— {ev.location}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-text-muted">
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
