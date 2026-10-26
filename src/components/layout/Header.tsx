import React from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Bell,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { ConnectionStateData, WhatsAppConfig } from '../../types/dashboard';
import { User } from '../../services/authService';
import { NavTabId } from './Sidebar';

interface HeaderProps {
  activeTab: NavTabId;
  config: WhatsAppConfig;
  connectionState: ConnectionStateData | null;
  isCheckingConnection: boolean;
  onRefreshConnection: () => void;
  onOpenConnect: () => void;
  onQuickSend: () => void;
  currentUser?: User | null;
  onGoToLanding?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  config,
  connectionState,
  isCheckingConnection,
  onRefreshConnection,
  onOpenConnect,
  onQuickSend,
  currentUser,
  onGoToLanding,
  onLogout,
}) => {
  const isConnected = connectionState?.status === 'open';

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Executive Overview', subtitle: 'WhatsApp delivery metrics, active queues, and channel health' };
      case 'sender':
        return { title: 'Direct WhatsApp Sender', subtitle: 'Compose text, PDFs, and media messages with real-time phone simulator' };
      case 'broadcast':
        return { title: 'Broadcast Campaigns', subtitle: 'Send personalized bulk messages with anti-ban delay throttling' };
      case 'scheduled':
        return { title: 'Scheduled Messages & Loops', subtitle: 'Automate future deliveries and recurring customer reminders' };
      case 'automations':
        return { title: 'Auto-Bots & Keyword Responders', subtitle: 'Configure instant chatbots, welcome sequences, and off-hours replies' };
      case 'live_inbox':
        return { title: 'Live Team Inbox & Conversations', subtitle: 'Two-way customer chats, quick canned replies, and agent assignment' };
      case 'drip_sequences':
        return { title: 'Automated Drip Sequences', subtitle: 'Multi-day onboarding funnels and scheduled customer nurture steps' };
      case 'cart_recovery':
        return { title: 'Abandoned Cart & Lost Sales Recovery', subtitle: 'Recover unconverted shoppers with automatic WhatsApp discount nudges' };
      case 'catalog_payments':
        return { title: 'WhatsApp Catalog & Quick Pay', subtitle: 'Send product cards, digital payment checkout links, and instant invoices' };
      case 'groups_manager':
        return { title: 'Groups & VIP Communities Blaster', subtitle: 'Broadcast updates and announcements to entire WhatsApp groups in one click' };
      case 'polls_surveys':
        return { title: 'Interactive WhatsApp Polls & Surveys', subtitle: 'Collect live customer feedback, NPS scores, and voting results' };
      case 'analytics_reports':
        return { title: 'Analytics & Engagement Heatmap', subtitle: 'Optimal send times, delivery funnels, open rates, and exportable CSV reports' };
      case 'templates':
        return { title: 'Message Templates Library', subtitle: 'Pre-approved business layouts for orders, reminders, and promotions' };
      case 'contacts':
        return { title: 'Contacts & Audience Manager', subtitle: 'Organize VIP customers, leads, and phone contact tags' };
      case 'auto_responder':
        return { title: 'Auto Message & Smart Responder', subtitle: 'Automate welcome greetings, night away messages, and 24/7 FAQ answers' };
      case 'ai_copilot':
        return { title: 'AI Copilot & Anti-Ban Humanizer', subtitle: 'Generate high-converting sales pitches, translations, and Spintax syntax' };
      case 'interactive_buttons':
        return { title: 'Interactive Buttons & List Menus', subtitle: 'Create WhatsApp CTA buttons, quick replies, and sectioned menus' };
      case 'qr_generator':
        return { title: 'QR Code & Click-to-Chat Studio', subtitle: 'Generate branded WhatsApp QR codes, wa.me links, and website widgets' };
      case 'number_validator':
        return { title: 'Number Cleanser & WhatsApp Validator', subtitle: 'Sanitize phone numbers, check active WhatsApp status, and export clean CSV' };
      case 'webhooks_manager':
        return { title: 'Webhooks Live Receiver & Event Stream', subtitle: 'Inspect inbound messages, delivery receipts, and connection events in real time' };
      case 'support_tickets':
        return { title: 'Support Tickets & Escalation Desk', subtitle: 'Track customer inquiries, enforce SLA timers, and resolve issues via WhatsApp' };
      case 'settings':
        return { title: 'WhatsApp Channel Setup', subtitle: 'Pair your Evolution API instance, server URL, and access credentials' };
      default:
        return { title: 'WhatsApp Automation Hub', subtitle: 'Manage messages, campaigns, and automations' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs font-sans">
      {/* Left: Search input matching screenshot */}
      <div className="flex items-center gap-4">
        <div className="relative w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search here..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#84cc16] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Help & Support */}
        <button
          type="button"
          onClick={onOpenConnect}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>Help & Support</span>
        </button>

        {/* Notification Bell with Red Badge */}
        <button
          type="button"
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4 stroke-[2]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* WhatsApp Connection status pill */}
        <button
          onClick={onOpenConnect}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
            isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : config.baseUrl && config.instance
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="WhatsApp Instance Connection State"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-emerald-500 animate-pulse'
                : config.baseUrl
                ? 'bg-amber-500'
                : 'bg-slate-400'
            }`}
          />
          <span className="hidden md:inline">
            {isConnected ? 'WhatsApp Live' : config.instance ? 'Connecting...' : 'Offline'}
          </span>
        </button>

        {/* User Profile RS Avatar with down chevron */}
        <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
          <div className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
              RS
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer hidden lg:block"
              title="Sign Out"
            >
              <span className="text-[11px] font-bold">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
