import React from 'react';
import {
  LayoutDashboard,
  Send,
  Radio,
  Clock,
  Bot,
  FileText,
  Users,
  Settings,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Zap,
  ShoppingBag,
  MessageSquare,
  Vote,
  RotateCcw,
  BarChart3,
  Megaphone,
  MousePointerClick,
  QrCode,
  ShieldCheck,
  Webhook,
  LifeBuoy
} from 'lucide-react';
import { ConnectionStateData, WhatsAppConfig } from '../../types/dashboard';

export type NavTabId =
  | 'overview'
  | 'sender'
  | 'broadcast'
  | 'live_inbox'
  | 'scheduled'
  | 'auto_responder'
  | 'ai_copilot'
  | 'automations'
  | 'drip_sequences'
  | 'cart_recovery'
  | 'qr_generator'
  | 'interactive_buttons'
  | 'number_validator'
  | 'webhooks_manager'
  | 'support_tickets'
  | 'catalog_payments'
  | 'groups_manager'
  | 'polls_surveys'
  | 'templates'
  | 'contacts'
  | 'analytics_reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  config: WhatsAppConfig;
  connectionState: ConnectionStateData | null;
  onOpenConnect: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  config,
  connectionState,
  onOpenConnect,
}) => {
  const isConnected = connectionState?.status === 'open';
  const isConfigured = Boolean(config.baseUrl && config.instance && config.apiKey);

  const sections = [
    {
      title: 'Messaging & Live Inbox',
      items: [
        { id: 'overview' as NavTabId, label: 'Overview & KPIs', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'sender' as NavTabId, label: 'Direct Sender', icon: <Send className="w-4 h-4" />, badge: 'Live' },
        { id: 'live_inbox' as NavTabId, label: 'Live Team Inbox', icon: <MessageSquare className="w-4 h-4" />, badge: 'Chat' },
        { id: 'broadcast' as NavTabId, label: 'Bulk Broadcast', icon: <Radio className="w-4 h-4" />, badge: 'Anti-Ban' },
        { id: 'scheduled' as NavTabId, label: 'Scheduled & Loops', icon: <Clock className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Auto Messages & Smart Bots',
      items: [
        { id: 'auto_responder' as NavTabId, label: 'Auto Message Studio', icon: <Bot className="w-4 h-4" />, badge: 'Hot' },
        { id: 'ai_copilot' as NavTabId, label: 'AI Copilot & Anti-Ban', icon: <Sparkles className="w-4 h-4" />, badge: 'AI' },
        { id: 'drip_sequences' as NavTabId, label: 'Drip Sequences', icon: <Zap className="w-4 h-4" />, badge: 'Auto' },
        { id: 'automations' as NavTabId, label: 'Keyword Automations', icon: <Bot className="w-4 h-4" /> },
        { id: 'cart_recovery' as NavTabId, label: 'Abandoned Cart Recovery', icon: <RotateCcw className="w-4 h-4" />, badge: 'ROI' },
      ],
    },
    {
      title: 'Engagement & Interactive Tools',
      items: [
        { id: 'interactive_buttons' as NavTabId, label: 'Interactive CTA Buttons', icon: <MousePointerClick className="w-4 h-4" />, badge: 'New' },
        { id: 'qr_generator' as NavTabId, label: 'QR Codes & Click-to-Chat', icon: <QrCode className="w-4 h-4" />, badge: 'Web' },
        { id: 'number_validator' as NavTabId, label: 'Number Cleanser & Check', icon: <ShieldCheck className="w-4 h-4" />, badge: 'Clean' },
        { id: 'polls_surveys' as NavTabId, label: 'Polls & Live Surveys', icon: <Vote className="w-4 h-4" /> },
        { id: 'groups_manager' as NavTabId, label: 'Groups & Community', icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Operations, CRM & Settings',
      items: [
        { id: 'support_tickets' as NavTabId, label: 'Support Tickets & SLA', icon: <LifeBuoy className="w-4 h-4" />, badge: 'SLA' },
        { id: 'webhooks_manager' as NavTabId, label: 'Webhooks Live Stream', icon: <Webhook className="w-4 h-4" />, badge: 'API' },
        { id: 'catalog_payments' as NavTabId, label: 'Catalog & Invoicing', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'templates' as NavTabId, label: 'Message Templates', icon: <FileText className="w-4 h-4" /> },
        { id: 'contacts' as NavTabId, label: 'Contacts Directory', icon: <Users className="w-4 h-4" /> },
        { id: 'analytics_reports' as NavTabId, label: 'Analytics & Heatmap', icon: <BarChart3 className="w-4 h-4" />, badge: 'Pro' },
        { id: 'settings' as NavTabId, label: 'WhatsApp Channel Setup', icon: <Settings className="w-4 h-4" />, badge: isConnected ? 'Online' : 'Setup' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-100 flex items-center px-5 gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">
              Sengar
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Hub
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">WhatsApp Business Suite</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="p-3 space-y-4 overflow-y-auto flex-1 scrollbar-none">
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {sec.title}
            </div>

            {sec.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200/60 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ml-1 ${
                        isActive
                          ? 'bg-emerald-200/80 text-emerald-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Instance Connection Status Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
        <div
          onClick={onOpenConnect}
          className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-300 transition group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : isConfigured
                    ? 'bg-amber-400'
                    : 'bg-slate-300'
                }`}
              />
              Instance Status
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
          </div>

          <div className="text-xs font-bold text-slate-900 truncate">
            {config.instance || 'Not Connected'}
          </div>

          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
            <span>{isConnected ? 'Active & Ready' : isConfigured ? 'Pairing...' : 'Click to connect'}</span>
            <span className={`font-semibold ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
