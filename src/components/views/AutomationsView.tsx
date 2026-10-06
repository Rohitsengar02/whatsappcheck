import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Zap,
  Play,
  CheckCircle2,
  Trash2,
  Sliders,
  Send,
  MessageSquare,
  Sparkles,
  Search,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { AutomationRule } from '../../types/dashboard';

interface AutomationsViewProps {
  automations: AutomationRule[];
  onToggleActive: (id: string) => void;
  onAddRule: (rule: Omit<AutomationRule, 'id' | 'triggerCount'>) => void;
  onDeleteRule: (id: string) => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  automations,
  onToggleActive,
  onAddRule,
  onDeleteRule,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<'keyword' | 'welcome' | 'off_hours'>('keyword');
  const [keywordsText, setKeywordsText] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'media'>('text');
  const [responseText, setResponseTypeText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  // Interactive Bot Simulator State
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{
    matchedRule?: AutomationRule;
    replyText?: string;
  } | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !responseText.trim()) return;

    const keywords = keywordsText
      .split(/[,]+/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    onAddRule({
      name,
      triggerType,
      keywords,
      matchType: 'contains',
      responseType,
      responseText,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaUrl ? 'document' : undefined,
      isActive: true,
    });

    setName('');
    setKeywordsText('');
    setResponseTypeText('');
    setMediaUrl('');
    setShowModal(false);
  };

  // Run test simulation on inbound message
  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const normalized = testInput.toLowerCase();
    const matched = automations.find((rule) => {
      if (!rule.isActive) return false;
      if (rule.triggerType === 'keyword') {
        return rule.keywords.some((kw) => normalized.includes(kw));
      }
      return false;
    });

    if (matched) {
      setTestResult({
        matchedRule: matched,
        replyText: matched.responseText,
      });
    } else {
      setTestResult({
        replyText: '⚠️ No active automation rule matched this keyword. Check your trigger keywords list.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            Auto-Bots & Smart Keyword Responders
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Set up 24/7 instant replies when customers text specific keywords like &quot;price&quot;, &quot;menu&quot;, or &quot;help&quot;.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Auto-Bot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Automation Rules List (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {automations.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-2xl border transition bg-white shadow-xs ${
                rule.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl text-xs font-bold ${
                      rule.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rule.name}</h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {rule.triggerType} trigger • {rule.triggerCount} times triggered
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Active Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={() => onToggleActive(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>

                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Keywords chips */}
              {rule.keywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap my-2">
                  <span className="text-[10px] text-slate-400 font-semibold">Triggers on:</span>
                  {rule.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200"
                    >
                      &quot;{kw}&quot;
                    </span>
                  ))}
                </div>
              )}

              {/* Response Preview */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans mt-2">
                <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">
                  🤖 Bot Auto-Reply:
                </span>
                <p className="line-clamp-2">{rule.responseText}</p>
                {rule.mediaUrl && (
                  <div className="mt-1 text-[10px] text-purple-700 font-medium flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3" /> Includes PDF attachment
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Interactive Bot Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Live Bot Simulator
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">Test matching rules</span>
          </div>

          <p className="text-xs text-slate-600">
            Type a message below to test how your active auto-bots respond when an incoming message is received.
          </p>

          <form onSubmit={handleSimulate} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Hi, what is the price?"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
            >
              Simulate
            </button>
          </form>

          {/* Quick preset test pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
            <span>Quick test:</span>
            {['Hi', 'Tell me price', 'Send payment details'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setTestInput(sample);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px]"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Simulator Output */}
          {testResult && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fade-in text-xs">
              {testResult.matchedRule ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-bold text-[11px]">
                      ✅ Match Found: {testResult.matchedRule.name}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      Matched
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed shadow-2xs">
                    {testResult.replyText}
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 italic text-[11px]">{testResult.replyText}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-1">Create New WhatsApp Auto-Bot</h4>
            <p className="text-xs text-slate-500 mb-4">Define incoming trigger words and your automated response.</p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Bot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catalog Request Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Trigger Keywords (comma separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="catalog, menu, products, items"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Automated Reply Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Hello! Here is our current product list..."
                  value={responseText}
                  onChange={(e) => setResponseTypeText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Optional Media / Brochure URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/catalog.pdf"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  Save & Enable Bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
