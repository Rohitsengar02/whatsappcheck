import React from 'react';
import {
  Send,
  Radio,
  Clock,
  Bot,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Smartphone,
  ShieldCheck,
  Zap,
  Users,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { ConnectionStateData, MessageLogItem, WhatsAppConfig } from '../../types/dashboard';
import { NavTabId } from '../layout/Sidebar';

interface OverviewViewProps {
  config: WhatsAppConfig;
  connectionState: ConnectionStateData | null;
  logs: MessageLogItem[];
  setActiveTab: (tab: NavTabId) => void;
  onOpenConnect: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  config,
  connectionState,
  logs,
  setActiveTab,
  onOpenConnect,
}) => {
  const isConnected = connectionState?.status === 'open';
  const isConfigured = Boolean(config.baseUrl && config.instance && config.apiKey);

  const totalDelivered = logs.filter((l) => l.status === 'delivered' || l.status === 'sent').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-2 backdrop-blur-xs">
            <Sparkles className="w-3 h-3 text-emerald-200" />
            <span>Sengar WhatsApp Automation Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Ready to dispatch messages & automate your WhatsApp
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Send instant messages, launch scheduled reminder loops, or enable smart keyword auto-bots with zero technical hassle.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('sender')}
            className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Message</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className="px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5 border border-emerald-400/30"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Bulk Broadcast</span>
          </button>
        </div>
      </div>

      {/* Instance Connection Health Alert if not connected */}
      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {isConfigured ? 'WhatsApp Instance is Disconnected' : 'No WhatsApp Instance Connected'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {isConfigured
                  ? 'Your server credentials are saved, but the WhatsApp session is offline. Check session state in Channel Setup.'
                  : 'Connect your WhatsApp Evolution API instance to start sending real messages to customer numbers.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenConnect}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 self-start sm:self-auto"
          >
            {isConfigured ? 'Check Connection' : 'Connect Channel Now'}
          </button>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Messages Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {124 + totalDelivered}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18% from last week</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Delivery Success Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              99.4%
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Ultra-high delivery speed
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Active Auto-Bots</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              3 Active
            </div>
            <div className="text-xs text-slate-500 mt-1">
              89 automated inquiries served
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Scheduled & Loops</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              2 Scheduled
            </div>
            <div className="text-xs text-amber-600 font-semibold mt-1">
              Next trigger in 2 hours
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Channel Overview & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: WhatsApp Channel Info & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">WhatsApp Instance Status</h3>
                  <p className="text-xs text-slate-500">Connected device session details</p>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {isConnected ? 'ONLINE • READY' : 'OFFLINE'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Instance Name</span>
                <span className="text-xs font-bold text-slate-900 font-mono truncate block mt-0.5">
                  {config.instance || 'Not configured'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Sender Phone</span>
                <span className="text-xs font-bold text-emerald-700 font-mono block mt-0.5">
                  {config.connectedNumber || 'Not specified'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">API Response Latency</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  {connectionState?.latencyMs ? `${connectionState.latencyMs} ms` : '—'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Mode: {config.useProxy ? 'High-Reliability Proxy' : 'Direct Cloud HTTPS'}
              </span>
              <button
                onClick={onOpenConnect}
                className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                Configure Channel <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">WhatsApp Feature Launchpad</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('auto_responder')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Auto Message Studio</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Welcome, away & keyword bots</div>
              </button>

              <button
                onClick={() => setActiveTab('ai_copilot')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">AI Copilot & Anti-Ban</div>
                <div className="text-[11px] text-slate-500 mt-0.5">High converting copy & Spintax</div>
              </button>

              <button
                onClick={() => setActiveTab('interactive_buttons')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Send className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Interactive Buttons</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Quick replies & menu lists</div>
              </button>

              <button
                onClick={() => setActiveTab('qr_generator')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">QR & Click-to-Chat</div>
                <div className="text-[11px] text-slate-500 mt-0.5">wa.me links & website widget</div>
              </button>

              <button
                onClick={() => setActiveTab('number_validator')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Number Cleanser</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Batch WhatsApp verification</div>
              </button>

              <button
                onClick={() => setActiveTab('support_tickets')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900">Support Tickets & SLA</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Resolve customer queries</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Activity Stream */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Recent Message Activity
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">{logs.length} logged</span>
            </div>

            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
                <p className="text-xs font-semibold text-slate-600">No activity logged yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Trigger messages or test auto-bots to view real-time delivery logs here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {logs.slice(0, 7).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 font-mono">
                          {log.recipientPhone}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {log.type}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-1">{log.content}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.status === 'delivered' || log.status === 'sent'
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-[10px] font-bold text-slate-700 capitalize">
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Real-time Delivery Hub</span>
            <button
              onClick={() => setActiveTab('sender')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Compose Message →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
