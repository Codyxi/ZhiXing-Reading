'use client';

import { cn } from '@/lib/utils';
import { useSBPACK } from '@/lib/store';
import { ChevronRight, Zap, Lightbulb } from 'lucide-react';
import BookCover from '@/components/ui/BookCover';

export default function BookSelector() {
  const { packs, activeBookId, setActiveBookId } = useSBPACK();

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-xs font-semibold tracking-wider text-text-muted">知识资产库</h3>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {packs.map((pack) => {
          const isActive = activeBookId === pack.bookId;
          const skillCount = pack.nodes.filter(n => n.type === 'skill').length;
          const knowledgeCount = pack.nodes.filter(n => n.type === 'knowledge').length;

          return (
            <button
              key={pack.bookId}
              onClick={() => setActiveBookId(isActive ? null : pack.bookId)}
              className={cn(
                'group flex w-full flex-col gap-2 rounded-xl px-3 py-3 text-left transition-all',
                isActive
                  ? 'bg-brand/5 border border-brand/15'
                  : 'border border-transparent hover:bg-bg-hover'
              )}
            >
              <div className="flex items-center gap-2.5">
                <BookCover bookId={pack.bookId} title={pack.bookTitle} author={pack.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-medium', isActive ? 'text-text-primary' : 'text-text-secondary')}>
                    {pack.bookTitle}
                  </p>
                  <p className="text-[10px] text-text-muted">{pack.author}</p>
                </div>
                <ChevronRight className={cn('h-3.5 w-3.5 shrink-0 transition-transform', isActive && 'rotate-90', 'text-text-muted')} />
              </div>

              {isActive && (
                <div className="flex gap-3 pl-[42px]">
                  <div className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-brand" />
                    <span className="text-[10px] text-text-muted">{knowledgeCount} 知识点</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-text-muted" />
                    <span className="text-[10px] text-text-muted">{skillCount} 技能</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
