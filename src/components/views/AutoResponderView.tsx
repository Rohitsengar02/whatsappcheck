import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Zap,
  Play,
  CheckCircle2,
  Trash2,
  Send,
  MessageSquare,
  Sparkles,
  Search,
  Check,
  Clock,
  Moon,
  AlertCircle,
  Smartphone,
  ChevronRight,
  HelpCircle,
  Copy,
  Tag
} from 'lucide-react';
import { AutoMessageRule, AutoTriggerType, ContactItem, WhatsAppConfig } from '../../types/dashboard';

interface AutoResponderViewProps {
  autoMessages: AutoMessageRule[];
  contacts: ContactItem[];
  config: WhatsAppConfig;
  onToggleActive: (id: string) => void;
  onAddRule: (rule: Omit<AutoMessageRule, 'id' | 'triggerCount' | 'lastTriggered'>) => void;
  onDeleteRule: (id: string) => void;
  onSendTestMessage: (phone: string, text: string) => void;
}

export const AutoResponderView: React.FC<AutoResponderViewProps> = ({
  autoMessages,
  contacts,
  config,
  onToggleActive,
  onAddRule,
  onDeleteRule,
  onSendTestMessage,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | AutoTriggerType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Rule Form State
  const [title, setTitle] = useState('');
  const [triggerType, setTriggerType] = useState<AutoTriggerType>('welcome');
  const [keywordsText, setKeywordsText] = useState('');
  const [scheduleHours, setScheduleHours] = useState('8:00 PM – 9:00 AM');
  const [delaySeconds, setDelaySeconds] = useState(1);
  const [responseText, setResponseText] = useState('');
  const [quickChipsText, setQuickChipsText] = useState('View Services, Talk to Human, Order Status');

  // Test Simulation State
  const [testSimInput, setTestSimInput] = useState('Hi there! Looking for price details');
  const [simMatchedRule, setSimMatchedRule] = useState<AutoMessageRule | null>(null);
  const [simOutput, setSimOutput] = useState<string | null>(null);
  const [simIsRunning, setSimIsRunning] = useState(false);

  // Live Phone Dispatch Modal
  const [dispatchModalRule, setDispatchModalRule] = useState<AutoMessageRule | null>(null);
  const [targetPhone, setTargetPhone] = useState(contacts[0]?.phone || config.connectedNumber || '+919761304821');

  const filteredRules = autoMessages.filter((rule) => {
    if (selectedFilter !== 'all' && rule.triggerType !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rule.title.toLowerCase().includes(q) ||
        rule.responseText.toLowerCase().includes(q) ||
        (rule.keywords && rule.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !responseText.trim()) return;

    const keywords = keywordsText
      .split(/[,]+/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const quickChips = quickChipsText
      .split(/[,]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    onAddRule({
      title,
      triggerType,
      keywords: keywords.length > 0 ? keywords : undefined,
      scheduleHours: triggerType === 'away' ? scheduleHours : undefined,
      delaySeconds,
      responseText,
      quickChips: quickChips.length > 0 ? quickChips : undefined,
      isActive: true,
    });

    setTitle('');
    setKeywordsText('');
    setResponseText('');
    setShowAddModal(false);
  };

  const handleRunSimulation = () => {
    if (!testSimInput.trim()) return;
    setSimIsRunning(true);
    setSimMatchedRule(null);
    setSimOutput(null);

    setTimeout(() => {
      const inputLower = testSimInput.toLowerCase();
      // Match rules
      const matched = autoMessages.find((rule) => {
        if (!rule.isActive) return false;
        if (rule.triggerType === 'keyword' || rule.triggerType === 'faq' || rule.triggerType === 'instant_lead') {
          return rule.keywords?.some((k) => inputLower.includes(k.toLowerCase()));
        }
        if (rule.triggerType === 'welcome') {
          return inputLower.includes('hi') || inputLower.includes('hello') || inputLower.includes('start');
        }
        return false;
      });

      if (matched) {
        setSimMatchedRule(matched);
        setSimOutput(matched.responseText);
      } else {
        const fallback = autoMessages.find((r) => r.triggerType === 'welcome' && r.isActive);
        if (fallback) {
          setSimMatchedRule(fallback);
          setSimOutput(fallback.responseText);
        } else {
          setSimOutput('⚠️ No active auto-reply matched your message. Add a new keyword rule or turn on your Welcome Bot.');
        }
      }
      setSimIsRunning(false);
    }, 400);
  };

  const getTriggerBadge = (type: AutoTriggerType) => {
    switch (type) {
      case 'welcome':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">👋 Welcome Greeting</span>;
      case 'away':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">🌙 Away / Off-Hours</span>;
      case 'keyword':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">⚡ Keyword Match</span>;
      case 'faq':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">❓ 24/7 FAQ Answer</span>;
      case 'instant_lead':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">🎯 VIP Lead Capture</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Auto Message & Smart Responder</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Automate instant greetings, off-hours away replies, FAQ answers, and keyword responders without any coding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Auto Message</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Rules</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {autoMessages.filter((r) => r.isActive).length} / {autoMessages.length}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">● 100% automated coverage</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Triggers</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {autoMessages.reduce((acc, r) => acc + r.triggerCount, 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Auto responses dispatched</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Delay</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">1.2s</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Natural typing emulation</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Away Mode Status</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">Standby</div>
          <div className="text-xs text-slate-500 mt-1">Activates at 8:00 PM IST</div>
        </div>
      </div>

      {/* Main Grid: Auto Message List + Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Rules List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['all', 'welcome', 'away', 'keyword', 'faq', 'instant_lead'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition cursor-pointer ${
                    selectedFilter === tab
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'all' ? 'All Rules' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Rules Cards */}
          <div className="space-y-4">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs ${
                  rule.isActive ? 'border-slate-200 hover:border-emerald-300' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="font-bold text-slate-900 text-base">{rule.title}</h3>
                      {getTriggerBadge(rule.triggerType)}
                      <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                        Delay: {rule.delaySeconds}s
                      </span>
                    </div>

                    {rule.triggerType === 'keyword' && rule.keywords && (
                      <div className="flex items-center gap-1.5 flex-wrap my-2">
                        <span className="text-xs text-slate-500">Triggers on keywords:</span>
                        {rule.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-mono border border-blue-100"
                          >
                            "{kw}"
                          </span>
                        ))}
                      </div>
                    )}

                    {rule.triggerType === 'away' && rule.scheduleHours && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md my-2 w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Active during: {rule.scheduleHours}</span>
                      </div>
                    )}

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 text-xs text-slate-700 whitespace-pre-line font-sans leading-relaxed">
                      {rule.responseText}
                    </div>

                    {rule.quickChips && rule.quickChips.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        <span className="text-xs text-slate-400">Quick Buttons:</span>
                        {rule.quickChips.map((chip, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium"
                          >
                            [ {chip} ]
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                      <span>Triggered: <strong className="text-slate-600">{rule.triggerCount} times</strong></span>
                      {rule.lastTriggered && <span>Last: {rule.lastTriggered}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => onToggleActive(rule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                        rule.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                      title={rule.isActive ? 'Active - Click to pause' : 'Paused - Click to activate'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          rule.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => {
                        setDispatchModalRule(rule);
                        setTargetPhone(contacts[0]?.phone || config.connectedNumber || '+919761304821');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-medium rounded-lg transition cursor-pointer"
                      title="Test send this response to a phone number"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Test Send</span>
                    </button>

                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredRules.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <Bot className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 text-sm font-medium">No auto message rules found in this filter.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Create an auto message now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Testing Playground Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <Smartphone className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Live Trigger Simulator</h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                Real-Time
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Test how your auto message bot responds when a customer texts your WhatsApp number. Type any keyword or greeting below:
            </p>

            {/* Test Input */}
            <div className="mt-4 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Customer Incoming Message:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testSimInput}
                  onChange={(e) => setTestSimInput(e.target.value)}
                  placeholder="e.g. Hi, menu please, order status..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
                />
                <button
                  onClick={handleRunSimulation}
                  disabled={simIsRunning}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition cursor-pointer shrink-0"
                >
                  {simIsRunning ? 'Checking...' : 'Trigger Bot'}
                </button>
              </div>

              {/* Quick Preset Buttons for Test */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center">Try:</span>
                {['Hi there!', 'menu', 'pricing', 'order status', 'interested in demo'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => {
                      setTestSimInput(hint);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Screen Mockup */}
            <div className="mt-5 bg-slate-100 p-4 rounded-2xl border border-slate-200 space-y-3 font-sans">
              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>SIMULATED CHAT</span>
                <span>WhatsApp Engine v2.4</span>
              </div>

              {/* Inbound Customer Bubble */}
              <div className="flex justify-start">
                <div className="bg-white text-slate-800 text-xs px-3.5 py-2 rounded-2xl rounded-tl-xs shadow-xs max-w-[85%] border border-slate-200">
                  <div className="text-[10px] text-slate-400 mb-0.5">Customer (Lead)</div>
                  {testSimInput || '...'}
                  <div className="text-[9px] text-slate-400 text-right mt-1">10:45 AM</div>
                </div>
              </div>

              {/* Bot Response Bubble */}
              {simOutput && (
                <div className="flex justify-end animate-fade-in">
                  <div className="bg-emerald-50 text-slate-800 text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-xs max-w-[90%] border border-emerald-200">
                    <div className="flex items-center justify-between gap-2 text-[10px] text-emerald-700 mb-1 font-semibold">
                      <span>🤖 {simMatchedRule ? simMatchedRule.title : 'Auto Responder'}</span>
                      <span className="text-[9px] bg-emerald-200/60 px-1.5 rounded">Auto Reply</span>
                    </div>
                    <div className="whitespace-pre-line leading-relaxed text-slate-800">
                      {simOutput}
                    </div>

                    {simMatchedRule?.quickChips && (
                      <div className="mt-2 pt-2 border-t border-emerald-200/60 flex flex-wrap gap-1">
                        {simMatchedRule.quickChips.map((c, i) => (
                          <span
                            key={i}
                            className="bg-white text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-[9px] text-emerald-700 text-right mt-1">10:45 AM ✓✓</div>
                  </div>
                </div>
              )}
            </div>

            {simMatchedRule && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <div>
                  <span className="font-bold">Rule Triggered: </span>
                  {simMatchedRule.title} ({simMatchedRule.triggerType})
                </div>
                <button
                  onClick={() => {
                    setDispatchModalRule(simMatchedRule);
                    setTargetPhone(contacts[0]?.phone || config.connectedNumber || '+919761304821');
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Send Live Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Create Auto Message Rule</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. VIP Discount Responder or Sunday Greeting"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Trigger Event</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value as AutoTriggerType)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                  >
                    <option value="welcome">Welcome Greeting (First Contact)</option>
                    <option value="keyword">Keyword Match (Contains words)</option>
                    <option value="away">Away / After Hours (Night & Weekend)</option>
                    <option value="faq">24/7 FAQ Answer Bot</option>
                    <option value="instant_lead">Instant Lead Capture</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Emulated Typing Delay</label>
                  <select
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                  >
                    <option value={0}>0 Seconds (Instant)</option>
                    <option value={1}>1 Second (Natural)</option>
                    <option value={2}>2 Seconds (Realistic)</option>
                    <option value={4}>4 Seconds (Long response)</option>
                  </select>
                </div>
              </div>

              {(triggerType === 'keyword' || triggerType === 'faq' || triggerType === 'instant_lead') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trigger Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="e.g. pricing, quote, cost, rates, demo"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">If the incoming customer message includes any of these words, the bot fires.</p>
                </div>
              )}

              {triggerType === 'away' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Active Hours Window</label>
                  <input
                    type="text"
                    value={scheduleHours}
                    onChange={(e) => setScheduleHours(e.target.value)}
                    placeholder="e.g. Mon-Fri 8:00 PM – 9:00 AM"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Automatic Reply Message</label>
                <textarea
                  required
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter the automated message with WhatsApp formatting (*bold*, _italic_, emoji)..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quick Action Buttons / Chips</label>
                <input
                  type="text"
                  value={quickChipsText}
                  onChange={(e) => setQuickChipsText(e.target.value)}
                  placeholder="e.g. View Menu, Talk to Agent, Order Status"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Displays suggested replies below the message for the user to tap.</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
                >
                  Save & Enable Auto Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Dispatch Modal */}
      {dispatchModalRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 animate-scale-in">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Test Send: {dispatchModalRule.title}
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Send this automated response to a test phone number via your connected WhatsApp API channel:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Mobile Number</label>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="+919761304821"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line max-h-36 overflow-y-auto">
                {dispatchModalRule.responseText}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDispatchModalRule(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSendTestMessage(targetPhone, dispatchModalRule.responseText);
                    setDispatchModalRule(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Send to WhatsApp Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
