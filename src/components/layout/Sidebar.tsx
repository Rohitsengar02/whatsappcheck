import React from 'react';
import {
  LayoutDashboard,
  Send,
  Radio,
  Clock,
  Bot,
  Sparkles,
  Zap,
  RotateCcw,
  MousePointerClick,
  QrCode,
  ShieldCheck,
  Vote,
  Users,
  LifeBuoy,
  Webhook,
  ShoppingBag,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
  MoreVertical,
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

interface NavSection {
  title: string;
  items: {
    id: NavTabId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  config,
  connectionState,
  onOpenConnect,
}) => {
  const isConnected = connectionState?.status === 'open';

  // All 22 pages organized into clean, comprehensive sections
  const sections: NavSection[] = [
    {
      title: 'Messaging & Live Inbox',
      items: [
        {
          id: 'overview',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'sender',
          label: 'Send Message',
          icon: <Send className="w-4 h-4 stroke-[1.9]" />,
          badge: 'Live',
        },
        {
          id: 'live_inbox',
          label: 'Live Team Inbox',
          icon: <MessageSquare className="w-4 h-4 stroke-[1.9]" />,
          badge: 'Chat',
        },
        {
          id: 'broadcast',
          label: 'Bulk Broadcast',
          icon: <Radio className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'scheduled',
          label: 'Scheduled Messages',
          icon: <Clock className="w-4 h-4 stroke-[1.9]" />,
        },
      ],
    },
    {
      title: 'Auto Messages & Bots',
      items: [
        {
          id: 'auto_responder',
          label: 'Auto Message Studio',
          icon: <Bot className="w-4 h-4 stroke-[1.9]" />,
          badge: 'Hot',
        },
        {
          id: 'ai_copilot',
          label: 'AI Smart Copilot',
          icon: <Sparkles className="w-4 h-4 stroke-[1.9]" />,
          badge: 'AI',
        },
        {
          id: 'drip_sequences',
          label: 'Drip Sequences',
          icon: <Zap className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'automations',
          label: 'Smart Automations',
          icon: <Bot className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'cart_recovery',
          label: 'Cart Recovery',
          icon: <RotateCcw className="w-4 h-4 stroke-[1.9]" />,
          badge: 'ROI',
        },
      ],
    },
    {
      title: 'Interactive & Growth Tools',
      items: [
        {
          id: 'interactive_buttons',
          label: 'Interactive Buttons',
          icon: <MousePointerClick className="w-4 h-4 stroke-[1.9]" />,
          badge: 'New',
        },
        {
          id: 'qr_generator',
          label: 'QR Code Generator',
          icon: <QrCode className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'number_validator',
          label: 'Number Validator',
          icon: <ShieldCheck className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'polls_surveys',
          label: 'Polls & Surveys',
          icon: <Vote className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'groups_manager',
          label: 'Groups Manager',
          icon: <Users className="w-4 h-4 stroke-[1.9]" />,
        },
      ],
    },
    {
      title: 'Audience, CRM & Setup',
      items: [
        {
          id: 'contacts',
          label: 'Contacts Directory',
          icon: <Users className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'templates',
          label: 'Message Templates',
          icon: <FileText className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'catalog_payments',
          label: 'Catalog & Payments',
          icon: <ShoppingBag className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'support_tickets',
          label: 'Support Tickets',
          icon: <LifeBuoy className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'webhooks_manager',
          label: 'Webhooks Manager',
          icon: <Webhook className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'analytics_reports',
          label: 'Analytics & Heatmap',
          icon: <BarChart3 className="w-4 h-4 stroke-[1.9]" />,
        },
        {
          id: 'settings',
          label: 'WhatsApp Setup',
          icon: <Settings className="w-4 h-4 stroke-[1.9]" />,
          badge: isConnected ? 'Online' : 'Setup',
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none shadow-xs font-sans">
      {/* 1. CyberLim Brand Header */}
      <div className="h-20 flex flex-col justify-center px-6 shrink-0 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-slate-900 text-2xl tracking-tight">Cyber</span>
          <span className="font-extrabold text-[#84cc16] text-2xl tracking-tight flex items-center">
            Lim
            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] ml-0.5 inline-block" />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium tracking-tight mt-0.5">WhatsApp Messaging Suite</p>
      </div>

      {/* 2. All 22 Navigation Buttons with CyberLim active pill & hover effect */}
      <div className="p-3 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {sections.map((section, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {section.title}
            </div>

            {section.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#ecfccb] text-[#3f6212] font-bold shadow-xs border border-[#d9f99d]'
                      : 'text-slate-600 font-semibold hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-[#65a30d]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-[#84cc16] text-white'
                          : item.badge === 'Online'
                          ? 'bg-emerald-100 text-emerald-800'
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

      {/* 3. Bottom Free Plan & Profile Widget */}
      <div className="p-4 space-y-3.5 border-t border-slate-100 bg-white shrink-0">
        {/* Free Plan Progress Card */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Free Plan</span>
            <button
              type="button"
              onClick={onOpenConnect}
              className="px-2.5 py-0.5 bg-[#84cc16] hover:bg-[#65a30d] text-white text-[11px] font-bold rounded-lg transition shadow-xs cursor-pointer"
            >
              Upgrade
            </button>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#84cc16] h-1.5 rounded-full w-[45%]" />
          </div>

          <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-medium">
            <span>450 / 1,000 messages</span>
            <span className="text-slate-400 font-mono text-[9.5px]">45%</span>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              RS
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">Rohit Sengar</div>
              <div className="text-[11px] text-slate-400 truncate">rohit@cyberlim.com</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenConnect}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
