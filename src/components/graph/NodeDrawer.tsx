'use client';

import { X, BookOpen, Lightbulb, Zap, Quote, Tag, ArrowRight } from 'lucide-react';
import type { GraphNode } from '@root/types/sbpack';
import { findNodeDetail } from '@/lib/graph-data';

interface NodeDrawerProps {
  node: GraphNode | null;
  onClose: () => void;
}

export default function NodeDrawer({ node, onClose }: NodeDrawerProps) {
  if (!node) return null;
  const detail = findNodeDetail(node.id);
  if (!detail) return null;

  const { node: sbNode, pack, evidences } = detail;
  const isBook = node.type === 'book';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-[400px] flex-col"
        style={{
          background: 'rgba(20, 23, 28, 0.92)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(46, 51, 61, 0.5)',
          boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.4)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5" style={{ borderBottom: '1px solid rgba(46, 51, 61, 0.3)' }}>
          <div className="flex-1 pr-4">
            <div className="mb-2.5 flex items-center gap-2">
              {isBook ? (
                <BookOpen className="h-4 w-4" style={{ color: '#6C8CFF' }} />
              ) : node.type === 'skill' ? (
                <Zap className="h-4 w-4" style={{ color: '#8A8E96' }} />
              ) : (
                <Lightbulb className="h-4 w-4" style={{ color: '#6C8CFF' }} />
              )}
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  background: isBook ? 'rgba(108, 140, 255, 0.1)' : 'rgba(122, 127, 138, 0.08)',
                  color: isBook ? '#6C8CFF' : '#8A8E96',
                }}
              >
                {isBook ? '书籍' : node.type === 'skill' ? '原始技能' : '知识点'}
              </span>
              {node.dimension && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px]"
                  style={{ background: 'rgba(122, 127, 138, 0.06)', color: 'rgba(122, 127, 138, 0.6)' }}
                >
                  {node.dimension}
                </span>
              )}
            </div>
            <h3 className="text-[15px] font-semibold" style={{ color: '#E8EAED' }}>{node.label}</h3>
            {pack && (
              <p className="mt-1 text-[11px]" style={{ color: 'rgba(122, 127, 138, 0.6)' }}>
                来自《{pack.bookTitle}》 · {pack.author}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{ color: 'rgba(122, 127, 138, 0.5)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E8EAED')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(122, 127, 138, 0.5)')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
          {sbNode && (
            <div className="mb-6">
              <h4 className="mb-2 text-[12px] font-medium" style={{ color: 'rgba(122, 127, 138, 0.6)' }}>核心概要</h4>
              <p
                className="rounded-xl p-4 text-[13px] leading-relaxed"
                style={{ background: 'rgba(36, 40, 48, 0.5)', color: '#E8EAED' }}
              >
                {sbNode.summary}
              </p>
            </div>
          )}

          {isBook && pack?.description && (
            <div className="mb-6">
              <h4 className="mb-2 text-[12px] font-medium" style={{ color: 'rgba(122, 127, 138, 0.6)' }}>书籍简介</h4>
              <p
                className="rounded-xl p-4 text-[13px] leading-relaxed"
                style={{ background: 'rgba(36, 40, 48, 0.5)', color: '#E8EAED' }}
              >
                {pack.description}
              </p>
            </div>
          )}

          {evidences.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3 flex items-center gap-2 text-[12px] font-medium" style={{ color: 'rgba(122, 127, 138, 0.6)' }}>
                <Quote className="h-3.5 w-3.5" />
                原句依据 ({evidences.length})
              </h4>
              <div className="space-y-2.5">
                {evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(36, 40, 48, 0.5)',
                      borderLeft: '2px solid rgba(108, 140, 255, 0.25)',
                    }}
                  >
                    <p className="text-[13px] italic leading-relaxed" style={{ color: 'rgba(232, 234, 237, 0.85)' }}>
                      &ldquo;{ev.quote}&rdquo;
                    </p>
                    {ev.location && (
                      <p className="mt-2 text-[11px]" style={{ color: 'rgba(122, 127, 138, 0.5)' }}>— {ev.location}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isBook && pack && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-[12px] font-medium" style={{ color: 'rgba(122, 127, 138, 0.6)' }}>
                <Tag className="h-3.5 w-3.5" />
                知识节点 ({pack.nodes.length})
              </h4>
              <div className="space-y-1.5">
                {pack.nodes.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
                    style={{ background: 'rgba(36, 40, 48, 0.3)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(36, 40, 48, 0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(36, 40, 48, 0.3)')}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: n.type === 'skill' ? '#8A8E96' : '#6C8CFF' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px]" style={{ color: '#E8EAED' }}>{n.title}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(122, 127, 138, 0.5)' }}>
                        {n.type === 'skill' ? '原始技能' : '知识点'}
                      </p>
                    </div>
                    <ArrowRight className="h-3 w-3 shrink-0" style={{ color: 'rgba(122, 127, 138, 0.3)' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {pack && !isBook && (
            <div>
              <h4 className="mb-3 text-[12px] font-medium" style={{ color: 'rgba(122, 127, 138, 0.6)' }}>关联关系</h4>
              <div className="space-y-1.5">
                {pack.relationships
                  .filter(r => r.source === node.id || r.target === node.id)
                  .map((r, i) => {
                    const otherId = r.source === node.id ? r.target : r.source;
                    const otherNode = pack.nodes.find(n => n.id === otherId);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
                        style={{ background: 'rgba(36, 40, 48, 0.3)' }}
                      >
                        <span style={{ color: 'rgba(122, 127, 138, 0.5)' }}>{r.relationType}</span>
                        <ArrowRight className="h-2.5 w-2.5" style={{ color: 'rgba(122, 127, 138, 0.3)' }} />
                        <span style={{ color: '#E8EAED' }}>{otherNode?.title ?? otherId}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom accent */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(108, 140, 255, 0.3), transparent)' }} />
      </div>
    </>
  );
}
