'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  X, Settings, Key, Globe, Cpu, Thermometer, Hash,
  CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, TestTube2,
} from 'lucide-react';

const PRESETS = [
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'Moonshot (Kimi)', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { name: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { name: '硅基流动', baseUrl: 'https://api.siliconflow.cn/v1', model: 'Qwen/Qwen2.5-7B-Instruct' },
  { name: 'Ollama 本地', baseUrl: 'http://localhost:11434/v1', model: 'qwen2.5:7b' },
  { name: '自定义', baseUrl: '', model: '' },
];

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('4096');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'testing' | 'ok' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('OpenAI');

  useEffect(() => {
    if (!open) return;
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.baseUrl) setBaseUrl(data.baseUrl);
      if (data.model) setModel(data.model);
      if (data.temperature) setTemperature(String(data.temperature));
      if (data.maxTokens) setMaxTokens(String(data.maxTokens));
      setHasExistingKey(data.hasApiKey ?? false);

      const matched = PRESETS.find(p => p.baseUrl === data.baseUrl);
      if (matched) setSelectedPreset(matched.name);
      else setSelectedPreset('自定义');
    }).catch(() => {});
  }, [open]);

  const applyPreset = (name: string) => {
    setSelectedPreset(name);
    const preset = PRESETS.find(p => p.name === name);
    if (preset && preset.baseUrl) {
      setBaseUrl(preset.baseUrl);
      setModel(preset.model);
    }
  };

  const handleSave = useCallback(async () => {
    setStatus('saving');
    setStatusMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl, model, temperature, maxTokens,
          ...(apiKey ? { apiKey } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('saved');
        setStatusMsg('配置已保存');
        setHasExistingKey(true);
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        throw new Error('保存失败');
      }
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err.message ?? '保存失败');
    }
  }, [baseUrl, apiKey, model, temperature, maxTokens]);

  const handleTest = useCallback(async () => {
    setStatus('testing');
    setStatusMsg('正在测试连接…');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, model, temperature, maxTokens, ...(apiKey ? { apiKey } : {}) }),
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '请回复"连接成功"四个字' }],
          test: true,
        }),
      });

      if (res.ok) {
        setStatus('ok');
        setStatusMsg('连接测试成功！LLM 响应正常');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        const err = await res.json();
        throw new Error(err.error ?? '测试失败');
      }
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err.message ?? '连接测试失败');
    }
  }, [baseUrl, apiKey, model, temperature, maxTokens]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[580px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-hover">
              <Settings className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">LLM 连接设置</h2>
              <p className="text-xs text-text-muted">配置 OpenAI 兼容的 API 接口</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-hover text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preset selector */}
        <div className="border-b border-border px-6 py-3">
          <label className="mb-2 block text-xs font-medium text-text-secondary">快速选择平台</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.name}
                onClick={() => applyPreset(p.name)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  selectedPreset === p.name
                    ? 'bg-brand/10 text-brand'
                    : 'bg-bg-hover text-text-muted hover:bg-border-light'
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Globe className="h-3.5 w-3.5" /> API Base URL
            </label>
            <input
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="h-10 w-full rounded-lg border border-border bg-bg-hover px-3 font-mono text-sm text-text-primary placeholder-text-faint outline-none focus:border-brand/40"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Key className="h-3.5 w-3.5" /> API Key
              {hasExistingKey && !apiKey && (
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success">已保存密钥</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={hasExistingKey ? '留空则使用已保存的 Key…' : 'sk-xxxxxxxxxxxxxxxx'}
                className="h-10 w-full rounded-lg border border-border bg-bg-hover px-3 pr-10 font-mono text-sm text-text-primary placeholder-text-faint outline-none focus:border-brand/40"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <Cpu className="h-3.5 w-3.5" /> 模型名称
              </label>
              <input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="gpt-4o"
                className="h-10 w-full rounded-lg border border-border bg-bg-hover px-3 font-mono text-sm text-text-primary placeholder-text-faint outline-none focus:border-brand/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Thermometer className="h-3.5 w-3.5" /> 温度
                </label>
                <input
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  className="h-10 w-full rounded-lg border border-border bg-bg-hover px-3 text-sm text-text-primary outline-none focus:border-brand/40"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                  <Hash className="h-3.5 w-3.5" /> 最大 Token
                </label>
                <input
                  value={maxTokens}
                  onChange={e => setMaxTokens(e.target.value)}
                  type="number"
                  min="256"
                  max="128000"
                  className="h-10 w-full rounded-lg border border-border bg-bg-hover px-3 text-sm text-text-primary outline-none focus:border-brand/40"
                />
              </div>
            </div>
          </div>

          {status !== 'idle' && (
            <div className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm',
              status === 'ok' || status === 'saved' ? 'bg-success/10 text-success' : status === 'error' ? 'bg-error/10 text-error' : 'bg-bg-hover text-text-muted'
            )}>
              {status === 'saving' || status === 'testing' ? <Loader2 className="h-4 w-4 animate-spin" /> : status === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {statusMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            onClick={handleTest}
            disabled={!baseUrl || (!apiKey && !hasExistingKey) || status === 'testing' || status === 'saving'}
            className="flex items-center gap-2 rounded-lg bg-bg-hover px-4 py-2 text-sm text-text-muted transition-all hover:bg-border-light hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <TestTube2 className="h-4 w-4" />
            测试连接
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-text-muted hover:text-text-secondary">
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!baseUrl || status === 'saving' || status === 'testing'}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-medium text-white shadow-card-sm hover:shadow-card disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              保存配置
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
