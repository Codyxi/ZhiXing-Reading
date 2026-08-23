'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SBPACKProvider } from '@/lib/store';
import Sidebar, { type TabId } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BookShelf from '@/components/shelf/BookShelf';
import ChatParlor from '@/components/chat/ChatParlor';
import ImportModal from '@/components/distill/ImportModal';
import SettingsPanel from '@/components/settings/SettingsPanel';

const Dashboard = dynamic(() => import('@/components/dashboard/Dashboard'), { ssr: false });
const KnowledgeGraph = dynamic(() => import('@/components/graph/KnowledgeGraph'), { ssr: false });
const ThinkTank = dynamic(() => import('@/components/thinktank/ThinkTank'), { ssr: false });

const tabMeta: Record<TabId, { title: string; subtitle: string }> = {
  home: { title: '总览', subtitle: '你的阅读资产一目了然' },
  graph: { title: '知识网络', subtitle: '可视化你所有书籍中的知识关联' },
  shelf: { title: '我的书架', subtitle: '管理你的书籍知识资产' },
  'think-tank': { title: '智囊团', subtitle: '多角色圆桌讨论，多维度决策支持' },
  chat: { title: '会客厅', subtitle: '基于知识库的深度对话' },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const meta = tabMeta[activeTab];

  return (
    <SBPACKProvider>
      <div className="min-h-screen bg-bg-primary">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onImport={() => setShowImport(true)}
          onSettings={() => setShowSettings(true)}
        />

        <div className="mx-auto max-w-[1440px]">
          <Header title={meta.title} subtitle={meta.subtitle} />

          <div className="px-6 pb-8">
            {activeTab === 'home' && <Dashboard onNavigate={(tab) => setActiveTab(tab as TabId)} />}
            {activeTab === 'graph' && <KnowledgeGraph />}
            {activeTab === 'shelf' && <BookShelf />}
            {activeTab === 'think-tank' && <ThinkTank />}
            {activeTab === 'chat' && <ChatParlor />}
          </div>
        </div>

        <ImportModal open={showImport} onClose={() => setShowImport(false)} />
        <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </SBPACKProvider>
  );
}
