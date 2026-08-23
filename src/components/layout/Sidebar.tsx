'use client';

import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Network,
  BookOpen,
  Users,
  MessageSquare,
  Upload,
  Settings,
  Sparkles,
} from 'lucide-react';

export type TabId = 'home' | 'graph' | 'shelf' | 'chat' | 'think-tank';

interface TopNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onImport?: () => void;
  onSettings?: () => void;
}

const tabs = [
  { id: 'home' as TabId, label: '总览', icon: LayoutDashboard },
  { id: 'graph' as TabId, label: '知识网络', icon: Network },
  { id: 'shelf' as TabId, label: '我的书架', icon: BookOpen },
  { id: 'think-tank' as TabId, label: '智囊团', icon: Users },
  { id: 'chat' as TabId, label: '会客厅', icon: MessageSquare },
];

export default function Sidebar({ activeTab, onTabChange, onImport, onSettings }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-bg-card px-6">
      {/* Logo */}
      <div className="mr-8 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight text-text-primary">知行</span>
          <span className="ml-1.5 text-[10px] font-medium text-text-muted">ZhiXing</span>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:border-brand/30 hover:text-brand"
        >
          <Upload className="h-3.5 w-3.5" />
          导入
        </button>
        <button
          onClick={onSettings}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
