/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  X,
  Smartphone
} from 'lucide-react';
import {
  AbandonedCartLead,
  AutomationRule,
  AutoMessageRule,
  CatalogProduct,
  ConnectionStateData,
  ContactItem,
  DEFAULT_CONFIG,
  DripSequence,
  DripStep,
  InboxConversation,
  MessageLogItem,
  ScheduledMessageItem,
  WhatsAppConfig,
  WhatsAppGroup,
  WhatsAppPoll,
} from './types/dashboard';
import {
  INITIAL_AUTOMATIONS,
  INITIAL_AUTO_MESSAGES,
  INITIAL_CART_LEADS,
  INITIAL_CATALOG_PRODUCTS,
  INITIAL_CONTACTS,
  INITIAL_CONVERSATIONS,
  INITIAL_DRIP_SEQUENCES,
  INITIAL_GROUPS,
  INITIAL_POLLS,
  INITIAL_SCHEDULED,
} from './data/mockData';
import { MessageTemplate } from './types/whatsapp';
import {
  fetchConnectionState,
  normalizeApiKey,
  sanitizePhoneNumber,
  sendMediaMessage,
  sendTextMessage,
  verifyNumber,
} from './services/whatsappService';

import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/views/OverviewView';
import { MessageSenderView } from './components/views/MessageSenderView';
import { BroadcastView } from './components/views/BroadcastView';
import { ScheduledView } from './components/views/ScheduledView';
import { AutomationsView } from './components/views/AutomationsView';
import { AutoResponderView } from './components/views/AutoResponderView';
import { AiCopilotView } from './components/views/AiCopilotView';
import { QrGeneratorView } from './components/views/QrGeneratorView';
import { InteractiveButtonsView } from './components/views/InteractiveButtonsView';
import { NumberValidatorView } from './components/views/NumberValidatorView';
import { WebhooksManagerView } from './components/views/WebhooksManagerView';
import { SupportTicketsView } from './components/views/SupportTicketsView';
import { DripSequencesView } from './components/views/DripSequencesView';
import { CartRecoveryView } from './components/views/CartRecoveryView';
import { CatalogPaymentsView } from './components/views/CatalogPaymentsView';
import { GroupsManagerView } from './components/views/GroupsManagerView';
import { PollsSurveysView } from './components/views/PollsSurveysView';
import { LiveInboxView } from './components/views/LiveInboxView';
import { TemplatesView } from './components/views/TemplatesView';
import { ContactsView } from './components/views/ContactsView';
import { AnalyticsReportsView } from './components/views/AnalyticsReportsView';
import { SettingsView } from './components/views/SettingsView';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');

  // WhatsApp Channel Credentials
  const [config, setConfig] = useState<WhatsAppConfig>(() => {
    try {
      const saved = localStorage.getItem('sengar_wa_config') || localStorage.getItem('wa_api_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.instance === 'user_yrztomld6vqiqgjt' ||
          parsed.apiKey === '429683C4C977415CAAFCCE10F7D57E11' ||
          parsed.apiKey === 'wapi_live_429683c4c977415caafcce10f7d57e11'
        ) {
          localStorage.removeItem('sengar_wa_config');
          localStorage.removeItem('wa_api_config');
          return DEFAULT_CONFIG;
        }
        if (parsed.apiKey) {
          parsed.apiKey = normalizeApiKey(parsed.apiKey);
        }
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  // State Data
  const [connectionState, setConnectionState] = useState<ConnectionStateData | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Modular Data States
  const [contacts, setContacts] = useState<ContactItem[]>(INITIAL_CONTACTS);
  const [automations, setAutomations] = useState<AutomationRule[]>(INITIAL_AUTOMATIONS);
  const [autoMessages, setAutoMessages] = useState<AutoMessageRule[]>(INITIAL_AUTO_MESSAGES);
  const [scheduledList, setScheduledList] = useState<ScheduledMessageItem[]>(INITIAL_SCHEDULED);
  const [dripSequences, setDripSequences] = useState<DripSequence[]>(INITIAL_DRIP_SEQUENCES);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>(INITIAL_CATALOG_PRODUCTS);
  const [groups, setGroups] = useState<WhatsAppGroup[]>(INITIAL_GROUPS);
  const [cartLeads, setCartLeads] = useState<AbandonedCartLead[]>(INITIAL_CART_LEADS);
  const [polls, setPolls] = useState<WhatsAppPoll[]>(INITIAL_POLLS);
  const [conversations, setConversations] = useState<InboxConversation[]>(INITIAL_CONVERSATIONS);
  const [logs, setLogs] = useState<MessageLogItem[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Toast Helper
  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Connection State Checker
  const checkConnection = useCallback(
    async (currentConfig = config) => {
      if (!currentConfig.baseUrl || !currentConfig.instance || !currentConfig.apiKey) {
        setConnectionState(null);
        return;
      }
      setIsCheckingConnection(true);
      try {
        const result = await fetchConnectionState(currentConfig);
        setConnectionState(result.state);
        if (result.state.status === 'open') {
          addToast('success', 'Instance Online', `Connected to WhatsApp instance: ${currentConfig.instance}`);
        } else if (result.state.status === 'close') {
          addToast('error', 'Session Closed', 'WhatsApp instance session is currently closed. Pair phone via QR code.');
        }
      } catch (err: any) {
        addToast('error', 'Connection Error', err?.message || 'Could not reach server.');
      } finally {
        setIsCheckingConnection(false);
      }
    },
    [config]
  );

  useEffect(() => {
    if (config.baseUrl && config.instance && config.apiKey) {
      checkConnection();
    }
  }, [checkConnection, config.baseUrl, config.instance, config.apiKey]);

  const handleSaveConfig = (newConfig: WhatsAppConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('sengar_wa_config', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    addToast('success', 'Credentials Saved', 'Connecting to your WhatsApp instance...');
    if (newConfig.baseUrl && newConfig.instance && newConfig.apiKey) {
      checkConnection(newConfig);
    }
  };

  const handleClearCredentials = () => {
    setConfig(DEFAULT_CONFIG);
    setConnectionState(null);
    try {
      localStorage.removeItem('sengar_wa_config');
      localStorage.removeItem('wa_api_config');
    } catch {
      // ignore
    }
    addToast('info', 'Credentials Cleared', 'WhatsApp channel disconnected.');
  };

  // Send Direct Message
  const handleSendDirectMessage = async (params: {
    toPhone: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'document';
    fileName?: string;
    caption?: string;
  }) => {
    if (!config.baseUrl || !config.instance || !config.apiKey) {
      addToast('error', 'Channel Not Connected', 'Please enter your WhatsApp instance credentials in Channel Setup first.');
      setActiveTab('settings');
      return;
    }

    const cleanPhone = sanitizePhoneNumber(params.toPhone);
    if (!cleanPhone) {
      addToast('error', 'Missing Phone Number', 'Please enter a valid international mobile number.');
      return;
    }

    setIsSending(true);
    try {
      let res;
      if (params.text) {
        res = await sendTextMessage(config, cleanPhone, params.text);
      } else if (params.mediaUrl) {
        res = await sendMediaMessage(config, {
          toPhone: cleanPhone,
          mediaUrl: params.mediaUrl,
          mediaType: params.mediaType || 'image',
          fileName: params.fileName,
          caption: params.caption,
        });
      }

      if (res?.success) {
        addToast('success', 'Message Delivered', `Sent to +${cleanPhone} successfully!`);
        setLogs((prev) => [
          {
            id: 'log_' + Date.now(),
            recipientPhone: `+${cleanPhone}`,
            type: params.text ? 'text' : 'media',
            content: params.text || params.caption || 'Media Attachment',
            status: 'delivered',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev,
        ]);
      } else {
        addToast('error', 'Delivery Failed', res?.error || 'Could not dispatch message.');
      }
    } catch (err: any) {
      addToast('error', 'Dispatch Error', err?.message || 'Network error.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyNumber = async (phone: string): Promise<boolean> => {
    if (!config.baseUrl || !config.instance || !config.apiKey) {
      addToast('error', 'Channel Not Connected', 'Please enter your WhatsApp instance credentials in Channel Setup first.');
      setActiveTab('settings');
      return false;
    }

    setIsVerifying(true);
    try {
      const res = await verifyNumber(config, phone);
      return res.verification.exists;
    } catch {
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Broadcast
  const handleBroadcastSend = async (params: {
    recipients: string[];
    message: string;
    delaySeconds: number;
    onProgress: (sent: number, total: number) => void;
  }) => {
    if (!config.baseUrl || !config.instance || !config.apiKey) {
      addToast('error', 'Channel Not Connected', 'Please configure your WhatsApp instance credentials first.');
      setActiveTab('settings');
      return;
    }

    setIsBroadcasting(true);
    const { recipients, message, delaySeconds, onProgress } = params;

    let sent = 0;
    for (const phone of recipients) {
      const clean = sanitizePhoneNumber(phone);
      if (clean) {
        try {
          await sendTextMessage(config, clean, message);
          sent++;
          onProgress(sent, recipients.length);
          setLogs((prev) => [
            {
              id: 'log_' + Date.now() + Math.random(),
              recipientPhone: `+${clean}`,
              type: 'broadcast',
              content: message,
              status: 'delivered',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...prev,
          ]);
        } catch {
          // continue
        }

        if (sent < recipients.length) {
          await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
        }
      }
    }

    setIsBroadcasting(false);
    addToast('success', 'Broadcast Completed', `Delivered to ${sent} recipients successfully!`);
  };

  // Scheduled message trigger
  const handleTriggerScheduledNow = async (item: ScheduledMessageItem) => {
    await handleSendDirectMessage({
      toPhone: item.recipientPhone,
      text: item.message,
    });
    setScheduledList((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, status: 'sent' } : s))
    );
  };

  // Inbox reply
  const handleSendMessageReply = async (convoId: string, replyText: string) => {
    const convo = conversations.find((c) => c.id === convoId);
    if (!convo) return;

    if (config.baseUrl && config.instance && config.apiKey) {
      await handleSendDirectMessage({
        toPhone: convo.phone,
        text: replyText,
      });
    } else {
      addToast('info', 'Reply Simulating', `Mock reply sent to ${convo.contactName} (Connect instance to send live)`);
    }

    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'user' as const,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' as const,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convoId
          ? {
              ...c,
              unreadCount: 0,
              lastMessageTime: 'Just now',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Left White Sidebar Navigation with 15 Tabs */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        connectionState={connectionState}
        onOpenConnect={() => setActiveTab('settings')}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          config={config}
          connectionState={connectionState}
          isCheckingConnection={isCheckingConnection}
          onRefreshConnection={() => checkConnection()}
          onOpenConnect={() => setActiveTab('settings')}
          onQuickSend={() => setActiveTab('sender')}
        />

        {/* View Routing Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              config={config}
              connectionState={connectionState}
              logs={logs}
              setActiveTab={setActiveTab}
              onOpenConnect={() => setActiveTab('settings')}
            />
          )}

          {activeTab === 'sender' && (
            <MessageSenderView
              config={config}
              contacts={contacts}
              onSendMessage={handleSendDirectMessage}
              isSending={isSending}
              onVerifyNumber={handleVerifyNumber}
              isVerifying={isVerifying}
            />
          )}

          {activeTab === 'broadcast' && (
            <BroadcastView
              config={config}
              contacts={contacts}
              onBroadcastSend={handleBroadcastSend}
              isBroadcasting={isBroadcasting}
            />
          )}

          {activeTab === 'live_inbox' && (
            <LiveInboxView
              conversations={conversations}
              onSendMessageReply={handleSendMessageReply}
            />
          )}

          {activeTab === 'scheduled' && (
            <ScheduledView
              scheduledList={scheduledList}
              onAddScheduled={(item) => {
                const newItem: ScheduledMessageItem = {
                  ...item,
                  id: 'sch_' + Date.now(),
                  status: 'pending',
                  createdAt: 'Just now',
                };
                setScheduledList((prev) => [newItem, ...prev]);
                addToast('success', 'Message Scheduled', `Queued for future delivery.`);
              }}
              onCancelScheduled={(id) => {
                setScheduledList((prev) => prev.filter((s) => s.id !== id));
                addToast('info', 'Schedule Removed', 'Cancelled from queue.');
              }}
              onTriggerNow={handleTriggerScheduledNow}
              contacts={contacts}
            />
          )}

          {activeTab === 'auto_responder' && (
            <AutoResponderView
              autoMessages={autoMessages}
              contacts={contacts}
              config={config}
              onToggleActive={(id) => {
                setAutoMessages((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
                );
              }}
              onAddRule={(rule) => {
                const newR: AutoMessageRule = {
                  ...rule,
                  id: 'am_' + Date.now(),
                  triggerCount: 0,
                  lastTriggered: 'Just created',
                };
                setAutoMessages((prev) => [newR, ...prev]);
                addToast('success', 'Auto Message Added', `"${rule.title}" is active.`);
              }}
              onDeleteRule={(id) => {
                setAutoMessages((prev) => prev.filter((r) => r.id !== id));
                addToast('info', 'Rule Removed', 'Auto message removed.');
              }}
              onSendTestMessage={(phone, text) => {
                handleSendDirectMessage({ toPhone: phone, text });
              }}
            />
          )}

          {activeTab === 'ai_copilot' && (
            <AiCopilotView
              contacts={contacts}
              onLoadIntoSender={(msg) => {
                setActiveTab('sender');
                addToast('info', 'Message Loaded', 'AI message loaded in direct sender.');
              }}
              onSendDirect={(phone, msg) => {
                handleSendDirectMessage({ toPhone: phone, text: msg });
              }}
            />
          )}

          {activeTab === 'interactive_buttons' && (
            <InteractiveButtonsView
              config={config}
              contacts={contacts}
              onSendToPhone={(phone, text) => {
                handleSendDirectMessage({ toPhone: phone, text });
              }}
            />
          )}

          {activeTab === 'qr_generator' && (
            <QrGeneratorView config={config} />
          )}

          {activeTab === 'number_validator' && (
            <NumberValidatorView
              config={config}
              onAddVerifiedContacts={(newContacts) => {
                const mapped: ContactItem[] = newContacts.map((c, idx) => ({
                  id: 'c_val_' + Date.now() + '_' + idx,
                  name: c.name,
                  phone: c.phone,
                  tag: c.tag,
                  lastContactedAt: 'Imported just now',
                }));
                setContacts((prev) => [...mapped, ...prev]);
                addToast('success', 'Contacts Imported', `Added ${mapped.length} verified leads to audience directory.`);
                setActiveTab('contacts');
              }}
            />
          )}

          {activeTab === 'webhooks_manager' && (
            <WebhooksManagerView config={config} />
          )}

          {activeTab === 'support_tickets' && (
            <SupportTicketsView
              onReplyOnWhatsApp={(phone, text) => {
                handleSendDirectMessage({ toPhone: phone, text });
              }}
            />
          )}

          {activeTab === 'automations' && (
            <AutomationsView
              automations={automations}
              onToggleActive={(id) => {
                setAutomations((prev) =>
                  prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
                );
              }}
              onAddRule={(rule) => {
                const newRule: AutomationRule = {
                  ...rule,
                  id: 'auto_' + Date.now(),
                  triggerCount: 0,
                };
                setAutomations((prev) => [newRule, ...prev]);
                addToast('success', 'Bot Enabled', `"${rule.name}" is now active!`);
              }}
              onDeleteRule={(id) => {
                setAutomations((prev) => prev.filter((a) => a.id !== id));
                addToast('info', 'Rule Removed', 'Bot deleted.');
              }}
            />
          )}

          {activeTab === 'drip_sequences' && (
            <DripSequencesView
              sequences={dripSequences}
              onToggleSequence={(id) => {
                setDripSequences((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
                );
              }}
              onAddSequence={(seq) => {
                const newSeq: DripSequence = {
                  ...seq,
                  id: 'drip_' + Date.now(),
                  enrolledCount: 1,
                  completedCount: 0,
                };
                setDripSequences((prev) => [newSeq, ...prev]);
                addToast('success', 'Sequence Created', `"${seq.name}" is now active.`);
              }}
              onTestStepSend={(step) => {
                if (contacts[0]) {
                  handleSendDirectMessage({
                    toPhone: contacts[0].phone,
                    text: step.message,
                  });
                } else {
                  addToast('info', 'Step Simulated', `Step: "${step.title}" message tested!`);
                }
              }}
            />
          )}

          {activeTab === 'cart_recovery' && (
            <CartRecoveryView
              leads={cartLeads}
              onSendRecovery={(lead, coupon) => {
                handleSendDirectMessage({
                  toPhone: lead.phone,
                  text: `🛒 Hi *${lead.customerName}*! We noticed you left items in your cart. Use code *${coupon}* for 15% off: https://shop.sengarhub.com/cart/resume`,
                });
                setCartLeads((prev) =>
                  prev.map((l) => (l.id === lead.id ? { ...l, recoveryStatus: 'recovered' } : l))
                );
              }}
            />
          )}

          {activeTab === 'catalog_payments' && (
            <CatalogPaymentsView
              products={catalogProducts}
              contacts={contacts}
              onSendProductInvoice={(params) => {
                handleSendDirectMessage({
                  toPhone: params.recipientPhone,
                  text: `🧾 *Order Invoice & Payment Link*\nItem: *${params.product.name}*\nAmount: *${params.product.currency}${params.product.price.toFixed(2)}*\nPayment Link: https://pay.sengarhub.com/order-8492`,
                  mediaUrl: params.product.imageUrl,
                  mediaType: 'image',
                  caption: `Official order for ${params.customerName}. Complete payment securely above.`,
                });
              }}
              onAddProduct={(prod) => {
                const newP: CatalogProduct = {
                  ...prod,
                  id: 'prod_' + Date.now(),
                };
                setCatalogProducts((prev) => [newP, ...prev]);
                addToast('success', 'Product Added', `"${prod.name}" added to catalog.`);
              }}
            />
          )}

          {activeTab === 'groups_manager' && (
            <GroupsManagerView
              groups={groups}
              onSendGroupAnnouncement={(group, msg) => {
                addToast('success', 'Announcement Sent', `Delivered to group "${group.name}"!`);
                setLogs((prev) => [
                  {
                    id: 'log_' + Date.now(),
                    recipientPhone: group.name,
                    type: 'broadcast',
                    content: msg,
                    status: 'delivered',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                  ...prev,
                ]);
              }}
              onAddGroup={(grp) => {
                const newG: WhatsAppGroup = {
                  ...grp,
                  id: 'grp_' + Date.now(),
                  lastActive: 'Just now',
                };
                setGroups((prev) => [newG, ...prev]);
                addToast('success', 'Group Tracked', `Added "${grp.name}" to manager.`);
              }}
            />
          )}

          {activeTab === 'polls_surveys' && (
            <PollsSurveysView
              polls={polls}
              contacts={contacts}
              onSendPoll={(poll, phone) => {
                const pollText = `📊 *${poll.question}*\n\n` + poll.options.map((o, idx) => `${idx + 1}. ${o.text}`).join('\n') + '\n\nReply with your option number to vote!';
                handleSendDirectMessage({
                  toPhone: phone,
                  text: pollText,
                });
              }}
              onAddPoll={(poll) => {
                const newPoll: WhatsAppPoll = {
                  ...poll,
                  id: 'poll_' + Date.now(),
                  totalVotes: 0,
                  createdAt: 'Just now',
                  status: 'active',
                };
                setPolls((prev) => [newPoll, ...prev]);
                addToast('success', 'Poll Created', `"${poll.question}" is live!`);
              }}
              onSimulateVote={(pollId, optionId) => {
                setPolls((prev) =>
                  prev.map((p) => {
                    if (p.id === pollId) {
                      const updatedOptions = p.options.map((o) =>
                        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
                      );
                      return {
                        ...p,
                        totalVotes: p.totalVotes + 1,
                        options: updatedOptions,
                      };
                    }
                    return p;
                  })
                );
                addToast('info', 'Vote Recorded', 'Test vote added to poll results.');
              }}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              onUseTemplate={(tpl: MessageTemplate) => {
                setActiveTab('sender');
                addToast('info', 'Template Loaded', `"${tpl.title}" ready in sender.`);
              }}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              onAddContact={(c) => {
                const newC: ContactItem = {
                  ...c,
                  id: 'c_' + Date.now(),
                };
                setContacts((prev) => [newC, ...prev]);
                addToast('success', 'Contact Added', `${c.name} saved to audience.`);
              }}
              onDeleteContact={(id) => {
                setContacts((prev) => prev.filter((c) => c.id !== id));
                addToast('info', 'Contact Removed', 'Contact deleted.');
              }}
              onMessageContact={(c) => {
                setActiveTab('sender');
              }}
            />
          )}

          {activeTab === 'analytics_reports' && <AnalyticsReportsView />}

          {activeTab === 'settings' && (
            <SettingsView
              config={config}
              onSaveConfig={handleSaveConfig}
              connectionState={connectionState}
              isChecking={isCheckingConnection}
              onTestConnection={() => checkConnection()}
              onClearCredentials={handleClearCredentials}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification System */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-lg flex items-start gap-3 bg-white transition-all transform duration-200 animate-slide-up ${
              toast.type === 'success'
                ? 'border-emerald-200 text-slate-800'
                : toast.type === 'error'
                ? 'border-rose-200 text-slate-800'
                : 'border-blue-200 text-slate-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <div className="font-bold text-xs text-slate-900">{toast.title}</div>
              <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
