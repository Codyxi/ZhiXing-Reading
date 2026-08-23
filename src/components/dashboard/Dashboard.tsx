'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSBPACK } from '@/lib/store';
import { getStats } from '@root/mock-data';
import {
  BookOpen, Lightbulb, Zap, Network,
  MessageSquare, Users, ArrowRight, Layers, FileText,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { packs } = useSBPACK();
  const stats = useMemo(() => getStats(), []);

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '知识网络', desc: '查看所有知识的关联关系', icon: Network, tab: 'graph' },
          { label: '我的书架', desc: '管理你的书籍资产', icon: BookOpen, tab: 'shelf' },
          { label: '智囊团', desc: '多角色圆桌讨论', icon: Users, tab: 'think-tank' },
          { label: '会客厅', desc: '基于知识的对话', icon: MessageSquare, tab: 'chat' },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => onNavigate(item.tab)}
            className="group flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4 text-left transition-all duration-150 hover:border-brand/20 hover:shadow-card"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-hover">
              <item.icon className="h-5 w-5 text-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-text-primary">{item.label}</p>
              <p className="mt-0.5 text-[13px] text-text-muted">{item.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: '书籍', value: stats.totalBooks, icon: BookOpen },
          { label: '知识点', value: stats.totalKnowledge, icon: Lightbulb },
          { label: '原始技能', value: stats.totalSkills, icon: Zap },
          { label: '原句依据', value: stats.totalEvidences, icon: FileText },
          { label: '知识关系', value: stats.totalRelationships, icon: Layers },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-bg-card p-4">
            <stat.icon className="h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="text-[28px] font-bold leading-none text-text-primary">{stat.value}</p>
              <p className="mt-1 text-[13px] text-text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Book grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-text-primary">最近的书籍资产</h2>
          <button
            onClick={() => onNavigate('shelf')}
            className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            查看全部 <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {packs.map((book) => {
            const skillCount = book.nodes.filter(n => n.type === 'skill').length;
            const knowledgeCount = book.nodes.filter(n => n.type === 'knowledge').length;

            return (
              <button
                key={book.bookId}
                onClick={() => onNavigate('shelf')}
                className="group flex flex-col items-center rounded-xl border border-border bg-bg-card p-5 text-left transition-all duration-150 hover:border-brand/20 hover:shadow-card"
              >
                {/* Book visual */}
                <div className="mb-3 flex h-20 w-16 items-center justify-center rounded-lg border border-border bg-bg-hover">
                  <BookOpen className="h-8 w-8 text-text-muted" />
                </div>

                {/* Title */}
                <p className="w-full truncate text-center text-[15px] font-medium text-text-primary">
                  {book.bookTitle}
                </p>
                <p className="mt-0.5 text-[13px] text-text-muted">{book.author}</p>

                {/* Stats */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[12px] text-text-muted">
                    <Lightbulb className="h-3 w-3" /> {knowledgeCount}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-text-muted">
                    <Zap className="h-3 w-3" /> {skillCount}
                  </span>
                </div>

                {/* SBPACK badge */}
                <span className="mt-2 rounded px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(78,203,113,0.12)', color: '#4ECB71' }}>
                  SBPACK 已验证
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
