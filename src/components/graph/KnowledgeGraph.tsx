'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import type { GraphNode } from '@root/types/sbpack';
import { buildGraphData } from '@/lib/graph-data';
import { useSBPACK } from '@/lib/store';
import ForceGraph from './ForceGraph';
import NodeDrawer from './NodeDrawer';
import GraphFilterBar from './GraphFilterBar';
import { Plus, Minus, Maximize2, Tag, EyeOff } from 'lucide-react';

export default function KnowledgeGraph() {
  const { packs } = useSBPACK();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(1);
  const graphRef = useRef<HTMLDivElement>(null);

  const graphData = useMemo(() => buildGraphData(packs), [packs]);

  const handleNodeClick = (node: GraphNode) => setSelectedNode(node);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.length > 1) {
      const match = graphData.nodes.find(n =>
        n.label.toLowerCase().includes(q.toLowerCase()) ||
        (n.dimension?.toLowerCase().includes(q.toLowerCase()) ?? false)
      );
      if (match) {
        const api = (graphRef.current as any)?.__graphAPI;
        api?.zoomToNode?.(match.id);
      }
    }
  }, [graphData]);

  const api = useCallback(() => (graphRef.current as any)?.__graphAPI, [])();

  return (
    <div ref={graphRef} className="relative h-[calc(100vh-180px)] overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(46, 51, 61, 0.4)' }}>
      {/* Filter bar */}
      <GraphFilterBar
        selectedBookId={selectedBookId}
        onSelectBook={setSelectedBookId}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Canvas */}
      <ForceGraph
        data={graphData}
        onNodeClick={handleNodeClick}
        highlightBookId={selectedBookId}
        searchQuery={searchQuery}
        showLabels={showLabels}
        onZoomChange={setCurrentZoom}
      />

      {/* Zoom controls — glass pill (bottom-right) */}
      <div
        className="absolute bottom-5 right-5 z-30 flex items-center gap-0.5 rounded-full p-1"
        style={{
          background: 'rgba(26, 29, 36, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(46, 51, 61, 0.5)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <ControlButton onClick={() => api?.zoomIn()} title="放大">
          <Plus className="h-3.5 w-3.5" />
        </ControlButton>
        <ControlButton onClick={() => api?.zoomOut()} title="缩小">
          <Minus className="h-3.5 w-3.5" />
        </ControlButton>
        <div className="mx-1 h-4 w-px" style={{ background: 'rgba(46, 51, 61, 0.5)' }} />
        <ControlButton onClick={() => api?.resetView()} title="重置">
          <Maximize2 className="h-3.5 w-3.5" />
        </ControlButton>
        <ControlButton
          onClick={() => setShowLabels(v => !v)}
          title={showLabels ? '隐藏标签' : '显示标签'}
          active={showLabels}
        >
          {showLabels ? <Tag className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </ControlButton>
      </div>

      {/* Stats bar — minimal glass (bottom-left) */}
      <div
        className="absolute bottom-5 left-5 z-30 flex items-center gap-3 rounded-full px-4 py-2"
        style={{
          background: 'rgba(26, 29, 36, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(46, 51, 61, 0.4)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        <StatDot color="#6C8CFF" />
        <span className="text-[13px] font-medium" style={{ color: '#E8EAED' }}>
          {graphData.nodes.filter(n => n.type === 'book').length}
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(122, 127, 138, 0.7)' }}>书籍</span>

        <div className="h-3 w-px" style={{ background: 'rgba(46, 51, 61, 0.4)' }} />

        <StatDot color="#6C8CFF" size={5} />
        <span className="text-[13px] font-medium" style={{ color: '#E8EAED' }}>
          {graphData.nodes.filter(n => n.type === 'knowledge').length}
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(122, 127, 138, 0.7)' }}>知识</span>

        <div className="h-3 w-px" style={{ background: 'rgba(46, 51, 61, 0.4)' }} />

        <StatDot color="#8A8E96" size={5} />
        <span className="text-[13px] font-medium" style={{ color: '#E8EAED' }}>
          {graphData.nodes.filter(n => n.type === 'skill').length}
        </span>
        <span className="text-[11px]" style={{ color: 'rgba(122, 127, 138, 0.7)' }}>技能</span>
      </div>

      {/* Node detail drawer */}
      <NodeDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}

/* ── Sub-components ────────────────────────────────── */

function ControlButton({
  onClick, title, active, children,
}: {
  onClick: () => void; title: string; active?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150"
      style={{
        color: active ? '#6C8CFF' : 'rgba(122, 127, 138, 0.7)',
        background: active ? 'rgba(108, 140, 255, 0.1)' : 'transparent',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(108, 140, 255, 0.1)';
        (e.currentTarget as HTMLElement).style.color = '#E8EAED';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = active ? 'rgba(108, 140, 255, 0.1)' : 'transparent';
        (e.currentTarget as HTMLElement).style.color = active ? '#6C8CFF' : 'rgba(122, 127, 138, 0.7)';
      }}
    >
      {children}
    </button>
  );
}

function StatDot({ color, size = 6 }: { color: string; size?: number }) {
  return (
    <span
      className="rounded-full"
      style={{ width: size, height: size, background: color, opacity: 0.7 }}
    />
  );
}
