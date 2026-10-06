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
  Send
} from 'lucide-react';
import { ConnectionStateData, WhatsAppConfig } from '../../types/dashboard';
import { NavTabId } from './Sidebar';

interface HeaderProps {
  activeTab: NavTabId;
  config: WhatsAppConfig;
  connectionState: ConnectionStateData | null;
  isCheckingConnection: boolean;
  onRefreshConnection: () => void;
  onOpenConnect: () => void;
  onQuickSend: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  config,
  connectionState,
  isCheckingConnection,
  onRefreshConnection,
  onOpenConnect,
  onQuickSend,
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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-slate-900 leading-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-500 font-normal hidden sm:block">
          {subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Connection status button */}
        <button
          onClick={onOpenConnect}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : config.baseUrl && config.instance
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="Manage WhatsApp Connection"
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
            {isConnected
              ? `Connected: ${config.instance}`
              : config.instance
              ? `Connecting (${config.instance})`
              : 'Connect WhatsApp Instance'}
          </span>
          <span className="md:hidden">{isConnected ? 'Online' : 'Connect'}</span>
        </button>

        {/* Refresh Ping icon */}
        {config.instance && config.apiKey && (
          <button
            onClick={onRefreshConnection}
            disabled={isCheckingConnection}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            title="Check live instance ping"
          >
            <RefreshCw className={`w-4 h-4 ${isCheckingConnection ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        )}

        {/* Quick Send CTA */}
        <button
          onClick={onQuickSend}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send Message</span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            RS
          </div>
        </div>
      </div>
    </header>
  );
};
