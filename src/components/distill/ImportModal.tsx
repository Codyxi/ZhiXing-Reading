'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSBPACK } from '@/lib/store';
import type { SBPACK } from '@root/types/sbpack';
import {
  X, Upload, FileJson, Sparkles, Loader2, CheckCircle2, AlertCircle, BookOpen,
} from 'lucide-react';

type Mode = 'json' | 'text';
type Step = 'idle' | 'analyzing' | 'extracting' | 'evidence' | 'relationships' | 'done' | 'error';

const STEP_LABELS: Record<Step, string> = {
  idle: '等待输入',
  analyzing: '分析文本结构…',
  extracting: '提取核心知识点…',
  evidence: '标注原句依据…',
  relationships: '构建知识关系网络…',
  done: '蒸馏完成！',
  error: '蒸馏失败',
};

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ImportModal({ open, onClose }: ImportModalProps) {
  const { addPack } = useSBPACK();
  const [mode, setMode] = useState<Mode>('text');
  const [inputText, setInputText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [step, setStep] = useState<Step>('idle');
  const [resultPack, setResultPack] = useState<SBPACK | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleDistill = useCallback(async () => {
    if (mode === 'text' && !inputText.trim()) return;
    if (mode === 'json' && !jsonText.trim()) return;

    setStep('analyzing');
    setErrorMsg('');
    setResultPack(null);

    try {
      if (mode === 'json') {
        const res = await fetch('/api/distill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'json', json: jsonText }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? '导入失败');
        setResultPack(data.pack);
        setStep('done');
        setStatusMsg(`成功导入《${data.pack.bookTitle}》，包含 ${data.pack.nodes.length} 个知识点`);
        return;
      }

      const res = await fetch('/api/distill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'text', text: inputText, title: title || undefined, author: author || undefined }),
      });

      if (!res.ok) throw new Error('请求失败');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            setStep(event.step as Step);
            setStatusMsg(event.message ?? '');
            if (event.pack) {
              setResultPack(event.pack);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setStep('error');
      setErrorMsg(err.message ?? '蒸馏过程出错');
    }
  }, [mode, inputText, jsonText, title, author]);

  const handleImport = useCallback(() => {
    if (!resultPack) return;
    addPack(resultPack);
    onClose();
    setInputText('');
    setJsonText('');
    setTitle('');
    setAuthor('');
    setStep('idle');
    setResultPack(null);
    setStatusMsg('');
  }, [resultPack, addPack, onClose]);

  const handleClose = () => {
    onClose();
    setStep('idle');
    setResultPack(null);
    setErrorMsg('');
    setStatusMsg('');
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="fixed left-1/2 top-1/2 z-50 w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-hover">
              <Upload className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">导入 SBPACK</h2>
              <p className="text-xs text-text-muted">导入已蒸馏的知识资产包，或将文本蒸馏为新的 SBPACK</p>
            </div>
          </div>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-hover text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 border-b border-border px-6 py-2">
          <button
            onClick={() => setMode('text')}
            className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              mode === 'text' ? 'bg-brand/10 text-brand' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            <Sparkles className="h-4 w-4" />
            文本蒸馏
          </button>
          <button
            onClick={() => setMode('json')}
            className={cn('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              mode === 'json' ? 'bg-brand/10 text-brand' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            <FileJson className="h-4 w-4" />
            JSON 导入
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {mode === 'text' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">书名 / 文档标题（可选）</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="例如：思考，快与慢"
                    className="h-9 w-full rounded-lg border border-border bg-bg-hover px-3 text-sm text-text-primary placeholder-text-faint outline-none focus:border-brand/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">作者（可选）</label>
                  <input
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="例如：丹尼尔·卡尼曼"
                    className="h-9 w-full rounded-lg border border-border bg-bg-hover px-3 text-sm text-text-primary placeholder-text-faint outline-none focus:border-brand/40"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">粘贴文本内容</label>
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="将任意文章、笔记、书籍摘录粘贴于此…&#10;&#10;系统将自动蒸馏为结构化的 SBPACK 知识资产包，包含知识点、原始技能、原句依据和知识关系。"
                  rows={10}
                  className="w-full rounded-xl border border-border bg-bg-hover px-4 py-3 text-sm leading-relaxed text-text-primary placeholder-text-faint outline-none focus:border-brand/40 resize-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">粘贴 SBPACK JSON</label>
              <textarea
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                placeholder='{ "bookId": "...", "bookTitle": "...", "nodes": [...], ... }'
                rows={12}
                className="w-full rounded-xl border border-border bg-bg-hover px-4 py-3 font-mono text-xs leading-relaxed text-text-primary placeholder-text-faint outline-none focus:border-brand/40 resize-none"
              />
            </div>
          )}

          {step !== 'idle' && (
            <div className="mt-4 rounded-xl bg-bg-hover p-4">
              <div className="flex items-center gap-3">
                {step === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : step === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-error" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-brand" />
                )}
                <div>
                  <p className={cn('text-sm font-medium', step === 'error' ? 'text-error' : step === 'done' ? 'text-success' : 'text-text-primary')}>
                    {STEP_LABELS[step]}
                  </p>
                  {statusMsg && <p className="mt-0.5 text-xs text-text-muted">{statusMsg}</p>}
                  {errorMsg && <p className="mt-0.5 text-xs text-error">{errorMsg}</p>}
                </div>
              </div>

              {step !== 'done' && step !== 'error' && (
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-700"
                    style={{
                      width: step === 'analyzing' ? '25%' : step === 'extracting' ? '50%' : step === 'evidence' ? '75%' : '90%',
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {resultPack && step === 'done' && (
            <div className="mt-4 rounded-xl border border-success/20 bg-success/5 p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-text-primary">《{resultPack.bookTitle}》</h4>
                  <p className="text-xs text-text-muted">{resultPack.author} · {resultPack.nodes.length} 个知识点 · {resultPack.evidences.length} 条依据</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {resultPack.nodes.slice(0, 6).map(n => (
                  <span key={n.id} className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                    n.type === 'skill' ? 'bg-bg-card text-text-secondary' : 'bg-brand/10 text-brand'
                  )}>
                    {n.title}
                  </span>
                ))}
                {resultPack.nodes.length > 6 && (
                  <span className="rounded-full bg-bg-card px-2.5 py-0.5 text-[10px] text-text-muted">
                    +{resultPack.nodes.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={handleClose} className="rounded-lg px-4 py-2 text-sm text-text-muted hover:text-text-secondary">
            取消
          </button>
          {step === 'done' && resultPack ? (
            <button
              onClick={handleImport}
              className="flex items-center gap-2 rounded-xl bg-success px-6 py-2.5 text-sm font-medium text-white shadow-card-sm hover:shadow-card"
            >
              <CheckCircle2 className="h-4 w-4" />
              确认导入
            </button>
          ) : (
            <button
              onClick={handleDistill}
              disabled={(mode === 'text' && !inputText.trim()) || (mode === 'json' && !jsonText.trim()) || step === 'analyzing' || step === 'extracting' || step === 'evidence' || step === 'relationships'}
              className={cn(
                'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all',
                'bg-brand text-white shadow-card-sm hover:shadow-card',
                'disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              <Sparkles className="h-4 w-4" />
              {mode === 'text' ? '开始蒸馏' : '验证并导入'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
