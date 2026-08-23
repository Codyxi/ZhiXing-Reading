'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { GraphNode, GraphData } from '@root/types/sbpack';

/* ── Types ─────────────────────────────────────────── */

interface SimNode extends GraphNode {
  x: number; y: number;
  vx: number; vy: number;
  fx?: number; fy?: number;
  degree?: number;
  // smooth animation targets
  targetScale?: number;
  currentScale?: number;
  glowIntensity?: number;
}

interface SimLink {
  source: string | SimNode;
  target: string | SimNode;
  relationType: string;
}

interface LabelRect { x: number; y: number; w: number; h: number }

interface ForceGraphProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  highlightBookId?: string | null;
  searchQuery?: string;
  showLabels?: boolean;
  onZoomChange?: (zoom: number) => void;
}

/* ── Helpers ───────────────────────────────────────── */

function resolve(s: string | SimNode, nodes: SimNode[]): SimNode | undefined {
  return nodes.find(n => n.id === (typeof s === 'string' ? s : s.id));
}

function logScale(value: number, min: number, max: number, maxVal: number): number {
  const t = maxVal > 0 ? Math.log(1 + value) / Math.log(1 + maxVal) : 0;
  return min + t * (max - min);
}

function rectsOverlap(a: LabelRect, b: LabelRect, pad = 4): boolean {
  return !(a.x + a.w + pad < b.x || b.x + b.w + pad < a.x || a.y + a.h + pad < b.y || b.y + b.h + pad < a.y);
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function quadBezierPoint(
  x0: number, y0: number,
  cx: number, cy: number,
  x1: number, y1: number,
  t: number,
): { x: number; y: number } {
  const mt = 1 - t;
  return {
    x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
    y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
  };
}

/* ── Component ─────────────────────────────────────── */

export default function ForceGraph({
  data, onNodeClick, highlightBookId, searchQuery,
  showLabels = true, onZoomChange,
}: ForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<{ nodes: SimNode[]; links: SimLink[] } | null>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 });
  const dragRef = useRef<{
    node: SimNode | null; offsetX: number; offsetY: number;
    isPanning: boolean; startX: number; startY: number;
  }>({ node: null, offsetX: 0, offsetY: 0, isPanning: false, startX: 0, startY: 0 });
  const hoverRef = useRef<SimNode | null>(null);
  const [, forceUpdate] = useState(0);

  /* ── Initialise simulation ───────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const degreeMap = new Map<string, number>();
    data.edges.forEach(e => {
      const s = typeof e.source === 'string' ? e.source : e.source.id;
      const t = typeof e.target === 'string' ? e.target : e.target.id;
      degreeMap.set(s, (degreeMap.get(s) ?? 0) + 1);
      degreeMap.set(t, (degreeMap.get(t) ?? 0) + 1);
    });
    const maxDegree = Math.max(1, ...Array.from(degreeMap.values()));

    const books = data.nodes.filter(n => n.type === 'book');
    const simNodes: SimNode[] = data.nodes.map((n, i) => {
      const angle = (i / data.nodes.length) * Math.PI * 2;
      if (n.type === 'book') {
        const bi = books.findIndex(b => b.id === n.id);
        const ba = (bi / books.length) * Math.PI * 2 - Math.PI / 2;
        return {
          ...n, x: w / 2 + Math.cos(ba) * 240, y: h / 2 + Math.sin(ba) * 200,
          vx: 0, vy: 0, degree: degreeMap.get(n.id) ?? 0,
          targetScale: 1, currentScale: 1, glowIntensity: 0,
        };
      }
      const bi = books.findIndex(b => b.id === n.bookId);
      const ba = (bi / books.length) * Math.PI * 2 - Math.PI / 2;
      const bx = w / 2 + Math.cos(ba) * 240;
      const by = h / 2 + Math.sin(ba) * 200;
      const spread = 90 + Math.random() * 70;
      const ca = angle + Math.random() * 0.4 - 0.2;
      return {
        ...n, x: bx + Math.cos(ca) * spread, y: by + Math.sin(ca) * spread,
        vx: 0, vy: 0, degree: degreeMap.get(n.id) ?? 0,
        targetScale: 1, currentScale: 1, glowIntensity: 0,
      };
    });

    simRef.current = {
      nodes: simNodes,
      links: data.edges.map(e => ({ source: e.source, target: e.target, relationType: e.relationType })),
    };
    cameraRef.current = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
    forceUpdate(n => n + 1);
  }, [data]);

  /* ── Physics tick ────────────────────────────────── */
  const tick = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    const { nodes, links } = sim;

    const centerStrength = 0.003;
    const repulsionStrength = 2200;
    const linkStrength = 0.03;
    const linkDistBelongs = 180;
    const linkDistRelated = 130;
    const damping = 0.80;
    const alpha = 0.4;

    const canvas = canvasRef.current;
    const cx = canvas ? canvas.getBoundingClientRect().width / 2 : 500;
    const cy = canvas ? canvas.getBoundingClientRect().height / 2 : 400;

    const resolvedLinks = links.map(l => ({
      source: resolve(l.source, nodes), target: resolve(l.target, nodes),
      relationType: l.relationType,
    })).filter(l => l.source && l.target);

    // Center gravity — very weak
    for (const node of nodes) {
      if (node.fx !== undefined) { node.x = node.fx; node.vx = 0; continue; }
      if (node.fy !== undefined) { node.y = node.fy; node.vy = 0; continue; }
      node.vx += (cx - node.x) * centerStrength;
      node.vy += (cy - node.y) * centerStrength;
    }

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        if (a.fx !== undefined && b.fx !== undefined) continue;
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; dist = 1; }

        const force = repulsionStrength / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (a.fx === undefined) { a.vx -= fx; a.vy -= fy; }
        if (b.fx === undefined) { b.vx += fx; b.vy += fy; }

        // Soft collision
        const minDist = a.type === 'book' || b.type === 'book' ? 100 : 50;
        if (dist < minDist) {
          const push = (minDist - dist) * 0.4;
          const px = (dx / dist) * push, py = (dy / dist) * push;
          if (a.fx === undefined) { a.vx -= px; a.vy -= py; }
          if (b.fx === undefined) { b.vx += px; b.vy += py; }
        }
      }
    }

    // Link springs
    for (const link of resolvedLinks) {
      if (!link.source || !link.target) continue;
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const desired = link.relationType === 'belongs-to' ? linkDistBelongs : linkDistRelated;
      const force = (dist - desired) * linkStrength;
      if (link.source.fx === undefined) { link.source.vx += (dx / dist) * force; link.source.vy += (dy / dist) * force; }
      if (link.target.fx === undefined) { link.target.vx -= (dx / dist) * force; link.target.vy -= (dy / dist) * force; }
    }

    // Integrate
    for (const node of nodes) {
      if (node.fx !== undefined) continue;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx * alpha;
      node.y += node.vy * alpha;
    }

    // Smooth hover scale
    const hovered = hoverRef.current;
    for (const node of nodes) {
      const isH = hovered?.id === node.id;
      node.targetScale = isH ? 1.25 : 1;
      node.currentScale = lerp(node.currentScale ?? 1, node.targetScale, 0.12);
      node.glowIntensity = lerp(node.glowIntensity ?? 0, isH ? 1 : 0, 0.1);
    }

    // Smooth camera
    const cam = cameraRef.current;
    cam.x = lerp(cam.x, cam.targetX, 0.08);
    cam.y = lerp(cam.y, cam.targetY, 0.08);
    cam.zoom = lerp(cam.zoom, cam.targetZoom, 0.08);
  }, []);

  /* ── Render ──────────────────────────────────────── */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const sim = simRef.current;
    if (!canvas || !sim) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cam = cameraRef.current;
    timeRef.current += 0.016;
    const t = timeRef.current;

    // ── Background: radial gradient + dot grid ───────
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    bgGrad.addColorStop(0, '#13161D');
    bgGrad.addColorStop(1, '#0B0D11');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Camera transform
    ctx.save();
    ctx.translate(w / 2 + cam.x, h / 2 + cam.y);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-w / 2, -h / 2);

    // Dot grid — subtle, fading near edges
    const gridSize = 60;
    const sx = Math.floor(-w / gridSize) * gridSize;
    const sy = Math.floor(-h / gridSize) * gridSize;
    for (let gx = sx; gx < w * 2; gx += gridSize) {
      for (let gy = sy; gy < h * 2; gy += gridSize) {
        const distFromCenter = Math.sqrt((gx - w / 2) ** 2 + (gy - h / 2) ** 2);
        const maxDist = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);
        const opacity = Math.max(0.03, 0.08 * (1 - distFromCenter / maxDist));
        ctx.fillStyle = `rgba(78, 83, 92, ${opacity})`;
        ctx.beginPath();
        ctx.arc(gx, gy, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Helpers ──────────────────────────────────────
    const hasSearch = !!searchQuery && searchQuery.length > 0;
    const isHighlighted = (node: SimNode) => {
      if (highlightBookId && node.bookId !== highlightBookId && node.id !== highlightBookId) return false;
      if (hasSearch) {
        const q = searchQuery!.toLowerCase();
        return node.label.toLowerCase().includes(q) || (node.dimension?.toLowerCase().includes(q) ?? false);
      }
      return true;
    };
    const isDimmed = (node: SimNode) => !isHighlighted(node);

    // Resolve links
    const resolvedLinks = sim.links.map(l => ({
      source: resolve(l.source, sim.nodes), target: resolve(l.target, sim.nodes),
      relationType: l.relationType,
    })).filter(l => l.source && l.target);

    const maxDeg = Math.max(1, ...sim.nodes.map(n => n.degree ?? 0));
    const placedLabels: LabelRect[] = [];

    // ── Draw edges ───────────────────────────────────
    for (const link of resolvedLinks) {
      const s = link.source!, t2 = link.target!;
      const dimmed = isDimmed(s) || isDimmed(t2);
      const isBelongs = link.relationType === 'belongs-to';
      const isHovered = hoverRef.current && (hoverRef.current.id === s.id || hoverRef.current.id === t2.id);

      // Curved link — offset midpoint perpendicular to the line
      const mx = (s.x + t2.x) / 2;
      const my = (s.y + t2.y) / 2;
      const dx = t2.x - s.x;
      const dy = t2.y - s.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const curvature = isBelongs ? 0.06 : 0.1;
      const cx = mx + (-dy / len) * len * curvature;
      const cy = my + (dx / len) * len * curvature;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.quadraticCurveTo(cx, cy, t2.x, t2.y);

      if (dimmed) {
        ctx.strokeStyle = 'rgba(20, 23, 28, 0.5)';
        ctx.lineWidth = 0.4;
      } else if (isHovered) {
        ctx.strokeStyle = 'rgba(108, 140, 255, 0.45)';
        ctx.lineWidth = 1.2;
      } else if (isBelongs) {
        ctx.strokeStyle = 'rgba(108, 140, 255, 0.1)';
        ctx.lineWidth = 0.6;
      } else {
        ctx.strokeStyle = 'rgba(46, 51, 61, 0.45)';
        ctx.lineWidth = 0.6;
      }
      ctx.stroke();

      // Animated particles — subtle, on knowledge links
      if (!isBelongs && !dimmed && !isHovered) {
        const pt = (t * 0.25 + s.x * 0.001) % 1;
        const p = quadBezierPoint(s.x, s.y, cx, cy, t2.x, t2.y, pt);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(108, 140, 255, 0.25)';
        ctx.fill();
      }
    }

    // ── Draw child nodes ─────────────────────────────
    const childNodes = sim.nodes.filter(n => n.type !== 'book');
    const bookNodes = sim.nodes.filter(n => n.type === 'book');

    for (const node of childNodes) {
      const dimmed = isDimmed(node);
      const hovered = hoverRef.current?.id === node.id;
      const matchesSearch = hasSearch && isHighlighted(node);
      const scale = node.currentScale ?? 1;
      const baseRadius = logScale(node.degree ?? 1, 3.5, 11, maxDeg);
      const radius = baseRadius * scale;

      // Ambient glow
      if (!dimmed) {
        const glowR = radius + 8 + (node.glowIntensity ?? 0) * 12;
        const glowColor = matchesSearch
          ? `rgba(108, 140, 255, ${0.15 + (node.glowIntensity ?? 0) * 0.2})`
          : node.type === 'skill'
            ? `rgba(180, 184, 192, ${0.06 + (node.glowIntensity ?? 0) * 0.08})`
            : `rgba(108, 140, 255, ${0.06 + (node.glowIntensity ?? 0) * 0.1})`;
        const glow = ctx.createRadialGradient(node.x, node.y, radius * 0.5, node.x, node.y, glowR);
        glow.addColorStop(0, glowColor);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pulsing ring for search matches
      if (matchesSearch && !dimmed) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 4);
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 5 + pulse * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(108, 140, 255, ${0.15 + pulse * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Node body — with subtle highlight
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

      if (dimmed) {
        ctx.fillStyle = 'rgba(46, 51, 61, 0.4)';
      } else if (node.type === 'skill') {
        const grad = ctx.createRadialGradient(node.x - radius * 0.3, node.y - radius * 0.3, 0, node.x, node.y, radius);
        grad.addColorStop(0, '#C8CBD0');
        grad.addColorStop(1, '#8A8E96');
        ctx.fillStyle = grad;
      } else {
        const base = hovered ? '#6C8CFF' : '#5A6A8A';
        const highlight = hovered ? '#8BA4FF' : '#6E7E9E';
        const grad = ctx.createRadialGradient(node.x - radius * 0.3, node.y - radius * 0.3, 0, node.x, node.y, radius);
        grad.addColorStop(0, highlight);
        grad.addColorStop(1, base);
        ctx.fillStyle = grad;
      }
      ctx.fill();

      // Hover tooltip — elegant pill
      if (hovered && !dimmed) {
        const fontSize = 11;
        ctx.font = `500 ${fontSize}px -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tw = ctx.measureText(node.label).width;
        const pw = tw + 20;
        const ph = 26;
        const px = node.x - pw / 2;
        const py = node.y - radius * scale - ph - 10;

        // Glass pill
        ctx.fillStyle = 'rgba(26, 29, 36, 0.88)';
        ctx.strokeStyle = 'rgba(108, 140, 255, 0.2)';
        ctx.lineWidth = 0.5;
        roundedRect(ctx, px, py, pw, ph, 8);
        ctx.fill();
        ctx.stroke();

        // Subtle inner glow at top
        const innerGlow = ctx.createLinearGradient(px, py, px, py + ph);
        innerGlow.addColorStop(0, 'rgba(108, 140, 255, 0.06)');
        innerGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = innerGlow;
        roundedRect(ctx, px, py, pw, ph, 8);
        ctx.fill();

        ctx.fillStyle = '#E8EAED';
        ctx.fillText(node.label, node.x, py + ph / 2);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // ── Draw book nodes ──────────────────────────────
    for (const node of bookNodes) {
      const dimmed = isDimmed(node);
      const hovered = hoverRef.current?.id === node.id;
      const matchesSearch = hasSearch && isHighlighted(node);
      const scale = node.currentScale ?? 1;

      const bw = 150;
      const bh = 92;
      const bx = node.x - bw / 2;
      const by = node.y - bh / 2;
      const cr = 12;

      // Ambient glow
      if (!dimmed) {
        const glowR = 80 + (node.glowIntensity ?? 0) * 30;
        const glow = ctx.createRadialGradient(node.x, node.y, 20, node.x, node.y, glowR);
        if (matchesSearch) {
          glow.addColorStop(0, `rgba(108, 140, 255, ${0.12 + (node.glowIntensity ?? 0) * 0.15})`);
        } else {
          glow.addColorStop(0, `rgba(108, 140, 255, ${0.04 + (node.glowIntensity ?? 0) * 0.08})`);
        }
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shadow — very soft
      if (!dimmed) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = hovered ? 24 : 12;
        ctx.shadowOffsetY = 4;
      }

      // Card body — gradient fill
      const cardGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
      if (dimmed) {
        cardGrad.addColorStop(0, '#13161D');
        cardGrad.addColorStop(1, '#0F1115');
      } else {
        cardGrad.addColorStop(0, '#1E2128');
        cardGrad.addColorStop(1, '#161920');
      }
      ctx.fillStyle = cardGrad;
      roundedRect(ctx, bx, by, bw, bh, cr);
      ctx.fill();

      // Border
      ctx.strokeStyle = dimmed ? 'rgba(46, 51, 61, 0.4)' : hovered ? 'rgba(108, 140, 255, 0.5)' : 'rgba(46, 51, 61, 0.6)';
      ctx.lineWidth = hovered ? 1.5 : 0.8;
      roundedRect(ctx, bx, by, bw, bh, cr);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Top highlight line — very subtle
      if (!dimmed) {
        ctx.beginPath();
        ctx.moveTo(bx + cr, by + 1);
        ctx.lineTo(bx + bw - cr, by + 1);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Spine — thin brand accent
      ctx.fillStyle = dimmed ? 'rgba(46, 51, 61, 0.5)' : 'rgba(108, 140, 255, 0.7)';
      roundedRect(ctx, bx + 1, by + 6, 2.5, bh - 12, 1.25);
      ctx.fill();

      // Book icon — clean
      ctx.font = '20px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = dimmed ? 'rgba(78, 83, 92, 0.5)' : 'rgba(180, 184, 192, 0.7)';
      ctx.fillText('📖', node.x - 1, node.y - 14);

      // Title — clean sans-serif
      ctx.font = `600 11px -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif`;
      ctx.fillStyle = dimmed ? 'rgba(78, 83, 92, 0.5)' : '#E8EAED';
      const titleText = node.label.length > 10 ? node.label.slice(0, 10) + '…' : node.label;
      ctx.fillText(titleText, node.x, node.y + 14);

      // Subtitle
      const childCount = sim.nodes.filter(n => n.bookId === node.id && n.type !== 'book').length;
      ctx.font = `400 9px -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif`;
      ctx.fillStyle = dimmed ? 'rgba(46, 51, 61, 0.5)' : 'rgba(122, 127, 138, 0.7)';
      ctx.fillText(`${childCount} 个知识点`, node.x, node.y + 28);

      // ── External label (if showLabels) ─────────────
      if (showLabels && !dimmed) {
        const fs = 10;
        ctx.font = `500 ${fs}px -apple-system, "SF Pro Text", "Noto Sans SC", sans-serif`;
        ctx.textAlign = 'center';
        const lt = node.label;
        const ltW = ctx.measureText(lt).width;
        const lx = node.x - ltW / 2;
        const ly = by + bh + 18;

        const lr: LabelRect = { x: lx - 6, y: ly - fs - 2, w: ltW + 12, h: fs + 6 };

        let overlap = false;
        for (const p of placedLabels) {
          if (rectsOverlap(lr, p)) { overlap = true; break; }
        }
        if (!overlap) {
          // Thin guide line
          ctx.beginPath();
          ctx.moveTo(node.x, by + bh + 2);
          ctx.lineTo(node.x, ly - 4);
          ctx.strokeStyle = 'rgba(46, 51, 61, 0.25)';
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Small dot at connection
          ctx.beginPath();
          ctx.arc(node.x, by + bh + 2, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(108, 140, 255, 0.3)';
          ctx.fill();

          ctx.fillStyle = 'rgba(180, 184, 192, 0.65)';
          ctx.fillText(lt, node.x, ly);
          placedLabels.push(lr);
        }
      }
    }

    ctx.restore();
    onZoomChange?.(cam.zoom);
  }, [highlightBookId, searchQuery, showLabels, onZoomChange]);

  /* ── Animation loop ──────────────────────────────── */
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      tick();
      render();
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [tick, render]);

  /* ── Camera helpers ──────────────────────────────── */
  const getCanvasPos = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cam = cameraRef.current;
    return {
      x: (e.clientX - rect.left - rect.width / 2 - cam.x) / cam.zoom + rect.width / 2,
      y: (e.clientY - rect.top - rect.height / 2 - cam.y) / cam.zoom + rect.height / 2,
    };
  }, []);

  const findNodeAt = useCallback((x: number, y: number): SimNode | null => {
    const sim = simRef.current;
    if (!sim) return null;
    for (let i = sim.nodes.length - 1; i >= 0; i--) {
      const node = sim.nodes[i];
      const dx = x - node.x, dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (node.type === 'book' ? 75 : 18)) return node;
    }
    return null;
  }, []);

  /* ── Zoom API (exposed on container) ─────────────── */
  const zoomToNode = useCallback((nodeId: string) => {
    const sim = simRef.current;
    const canvas = canvasRef.current;
    if (!sim || !canvas) return;
    const node = sim.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const rect = canvas.getBoundingClientRect();
    const tz = 1.6;
    cameraRef.current.targetX = -(node.x - rect.width / 2) * tz;
    cameraRef.current.targetY = -(node.y - rect.height / 2) * tz;
    cameraRef.current.targetZoom = tz;
  }, []);

  const zoomIn = useCallback(() => {
    cameraRef.current.targetZoom = Math.min(4, cameraRef.current.targetZoom * 1.4);
  }, []);

  const zoomOut = useCallback(() => {
    cameraRef.current.targetZoom = Math.max(0.2, cameraRef.current.targetZoom / 1.4);
  }, []);

  const resetView = useCallback(() => {
    cameraRef.current.targetX = 0;
    cameraRef.current.targetY = 0;
    cameraRef.current.targetZoom = 1;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) (el as any).__graphAPI = { zoomToNode, zoomIn, zoomOut, resetView };
  }, [zoomToNode, zoomIn, zoomOut, resetView]);

  /* ── Input handlers ──────────────────────────────── */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    const node = findNodeAt(pos.x, pos.y);
    if (node) {
      dragRef.current = { node, offsetX: pos.x - node.x, offsetY: pos.y - node.y, isPanning: false, startX: 0, startY: 0 };
      node.fx = node.x;
      node.fy = node.y;
    } else {
      dragRef.current = { ...dragRef.current, isPanning: true, startX: e.clientX - cameraRef.current.x, startY: e.clientY - cameraRef.current.y };
    }
  }, [getCanvasPos, findNodeAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    if (dragRef.current.node) {
      dragRef.current.node.fx = pos.x - dragRef.current.offsetX;
      dragRef.current.node.fy = pos.y - dragRef.current.offsetY;
    } else if (dragRef.current.isPanning) {
      const cam = cameraRef.current;
      cam.targetX = e.clientX - dragRef.current.startX;
      cam.targetY = e.clientY - dragRef.current.startY;
      // Also update current directly for responsiveness
      cam.x = cam.targetX;
      cam.y = cam.targetY;
    } else {
      const node = findNodeAt(pos.x, pos.y);
      hoverRef.current = node;
      if (canvasRef.current) canvasRef.current.style.cursor = node ? 'pointer' : 'grab';
    }
  }, [getCanvasPos, findNodeAt]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const drag = dragRef.current;
    if (drag.node) {
      const pos = getCanvasPos(e);
      const dx = pos.x - drag.node.x, dy = pos.y - drag.node.y;
      if (Math.sqrt(dx * dx + dy * dy) < 5) onNodeClick(drag.node);
      drag.node.fx = undefined;
      drag.node.fy = undefined;
    }
    dragRef.current = { node: null, offsetX: 0, offsetY: 0, isPanning: false, startX: 0, startY: 0 };
  }, [getCanvasPos, onNodeClick]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    cameraRef.current.targetZoom = Math.max(0.2, Math.min(4, cameraRef.current.targetZoom * factor));
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          dragRef.current = { node: null, offsetX: 0, offsetY: 0, isPanning: false, startX: 0, startY: 0 };
          hoverRef.current = null;
        }}
        onWheel={handleWheel}
      />
    </div>
  );
}
