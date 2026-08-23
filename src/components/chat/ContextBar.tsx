'use client';

import { cn } from '@/lib/utils';
import { useSBPACK } from '@/lib/store';
import { X, Lightbulb, Zap, Brain, Gauge } from 'lucide-react';

export default function ContextBar() {
  const {
    activeBookId, getPack, mountedNodeIds, toggleMountedNode, clearMountedNodes,
    thinkingDepth, setThinkingDepth,
  } = useSBPACK();

  const pack = activeBookId ? getPack(activeBookId) : null;
  const mountedNodes = pack?.nodes.filter(n => mountedNodeIds.includes(n.id)) ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-bg-card px-4 py-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">上下文:</span>

      {mountedNodes.length === 0 && !pack && (
        <span
          className="rounded-lg px-2.5 py-1 text-[10px] font-medium"
          style={{ background: 'rgba(248,113,113,0.08)', color: '#F87171' }}
        >
          未挂载任何上下文，请先在左侧选择一本书籍
        </span>
      )}

      {pack && mountedNodes.length === 0 && (
        <span className="text-[10px] text-text-muted">已绑定《{pack.bookTitle}》— 点击下方节点标签挂载</span>
      )}

      {mountedNodes.map((node) => (
        <button
          key={node.id}
          onClick={() => toggleMountedNode(node.id)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all hover:opacity-80',
            node.type === 'skill'
              ? 'bg-bg-hover text-text-secondary'
              : 'bg-brand/10 text-brand'
          )}
        >
          {node.type === 'skill' ? <Zap className="h-3 w-3" /> : <Lightbulb className="h-3 w-3" />}
          {node.title}
          <X className="h-3 w-3 opacity-50" />
        </button>
      ))}

      {mountedNodes.length > 0 && (
        <button onClick={clearMountedNodes} className="text-[10px] text-text-muted hover:text-error">
          清除全部
        </button>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 rounded-lg p-0.5" style={{ background: '#242830' }}>
        <button
          onClick={() => setThinkingDepth('standard')}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all',
            thinkingDepth === 'standard'
              ? 'bg-bg-card text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <Gauge className="h-3 w-3" />
          标准思考
        </button>
        <button
          onClick={() => setThinkingDepth('deep')}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-all',
            thinkingDepth === 'deep'
              ? 'bg-brand text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <Brain className="h-3 w-3" />
          深度思考
        </button>
      </div>
    </div>
  );
}
