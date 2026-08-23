'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSBPACK } from '@/lib/store';
import {
  Lightbulb, Zap, Calendar, ArrowRight, Trash2, Upload, Search, BookOpen,
} from 'lucide-react';
import ImportModal from '@/components/distill/ImportModal';
import BookCover from '@/components/ui/BookCover';

export default function BookShelf() {
  const { packs, removePack, setActiveBookId } = useSBPACK();
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const filteredPacks = packs.filter(p =>
    !search || p.bookTitle.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase())
  );

  const activePack = selectedBook ? packs.find(p => p.bookId === selectedBook) : null;

  return (
    <div className="flex h-[calc(100vh-180px)] gap-5">
      {/* Left: Book list */}
      <div className="flex w-[340px] shrink-0 flex-col rounded-xl border border-border bg-bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-faint" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索书籍…"
              className="h-9 w-full rounded-lg border border-border bg-bg-hover pl-9 pr-3 text-[13px] text-text-primary placeholder-text-faint outline-none focus:border-brand/40 focus:shadow-brand"
            />
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-brand/10 px-3 text-[13px] font-medium text-brand transition-all hover:bg-brand/20"
          >
            <Upload className="h-3.5 w-3.5" />
            导入
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {filteredPacks.map((pack) => {
            const isSelected = selectedBook === pack.bookId;
            const skillCount = pack.nodes.filter(n => n.type === 'skill').length;
            const knowledgeCount = pack.nodes.filter(n => n.type === 'knowledge').length;
            return (
              <button
                key={pack.bookId}
                onClick={() => setSelectedBook(isSelected ? null : pack.bookId)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all',
                  isSelected ? 'bg-brand/5 border border-brand/15' : 'border border-transparent hover:bg-bg-hover'
                )}
              >
                <BookCover bookId={pack.bookId} title={pack.bookTitle} author={pack.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-[15px] font-medium', isSelected ? 'text-text-primary' : 'text-text-secondary')}>
                    {pack.bookTitle}
                  </p>
                  <p className="text-[13px] text-text-muted">{pack.author}</p>
                  <div className="mt-1.5 flex gap-3">
                    <span className="flex items-center gap-1 text-[12px] text-text-muted">
                      <Lightbulb className="h-3 w-3" /> {knowledgeCount} 节点
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-text-muted">
                      <Zap className="h-3 w-3" /> {skillCount} 依据
                    </span>
                  </div>
                </div>
                <ArrowRight className={cn('h-4 w-4 shrink-0 text-text-faint transition-transform', isSelected && 'rotate-90')} />
              </button>
            );
          })}
          {filteredPacks.length === 0 && (
            <div className="py-8 text-center text-[13px] text-text-muted">没有找到匹配的书籍</div>
          )}
        </div>
      </div>

      {/* Right: Book detail */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-bg-card p-6">
        {activePack ? (
          <>
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <BookCover bookId={activePack.bookId} title={activePack.bookTitle} author={activePack.author} size="md" />
                <div>
                  <h2 className="text-xl font-bold text-text-primary">{activePack.bookTitle}</h2>
                  <p className="text-[13px] text-text-muted">{activePack.author}</p>
                  {activePack.distilledAt && (
                    <p className="mt-1 flex items-center gap-1 text-[12px] text-text-muted">
                      <Calendar className="h-3 w-3" />
                      蒸馏于 {new Date(activePack.distilledAt).toLocaleDateString('zh-CN')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveBookId(activePack.bookId)}
                  className="flex items-center gap-1.5 rounded-lg bg-brand/10 px-3 py-2 text-[13px] font-medium text-brand hover:bg-brand/20"
                >
                  在会客厅中使用
                </button>
                <button
                  onClick={() => { removePack(activePack.bookId); setSelectedBook(null); }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-hover text-text-muted hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {activePack.description && (
              <p className="mb-6 rounded-xl bg-bg-hover p-4 text-[14px] leading-relaxed text-text-secondary">
                {activePack.description}
              </p>
            )}

            <div className="mb-6 grid grid-cols-4 gap-3">
              {[
                { label: '知识点', value: activePack.nodes.filter(n => n.type === 'knowledge').length, icon: Lightbulb },
                { label: '原始技能', value: activePack.nodes.filter(n => n.type === 'skill').length, icon: Zap },
                { label: '原句依据', value: activePack.evidences.length, icon: Calendar },
                { label: '知识关系', value: activePack.relationships.length, icon: ArrowRight },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-bg-hover p-3 text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-bg-card">
                    <stat.icon className="h-4 w-4 text-brand" />
                  </div>
                  <p className="mt-2 text-lg font-bold text-text-primary">{stat.value}</p>
                  <p className="text-[12px] text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              <h3 className="mb-3 text-[14px] font-semibold text-text-secondary">知识节点</h3>
              <div className="space-y-2">
                {activePack.nodes.map((node) => (
                  <div key={node.id} className="flex items-start gap-3 rounded-lg bg-bg-hover px-4 py-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-bg-card">
                      {node.type === 'skill' ? <Zap className="h-3.5 w-3.5 text-text-muted" /> : <Lightbulb className="h-3.5 w-3.5 text-brand" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-text-primary">{node.title}</p>
                        {node.dimension && (
                          <span className="rounded bg-bg-card px-2 py-0.5 text-[10px] text-text-muted">{node.dimension}</span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-text-muted line-clamp-2">{node.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="empty-state-icon">
              <BookOpen className="h-8 w-8 text-text-faint" />
            </div>
            <h3 className="empty-state-title">我的书架</h3>
            <p className="empty-state-desc">
              在左侧选择一本书查看其知识资产详情，<br />
              或导入新的 SBPACK 知识包
            </p>
            <button
              onClick={() => setShowImport(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-[14px] font-medium text-white shadow-card-sm hover:shadow-card"
            >
              <Upload className="h-4 w-4" />
              导入书籍
            </button>
          </div>
        )}
      </div>

      <ImportModal open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
