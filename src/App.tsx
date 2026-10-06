/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Smartphone,
  Server,
  Settings,
  Code2,
  Bell,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Zap,
  Globe,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  ApiLogEntry,
  ConnectionStateData,
  DEFAULT_CONFIG,
  MessageTemplate,
  WhatsAppConfig,
  WhatsAppNumberVerification,
} from './types/whatsapp';
import { PRESET_TEMPLATES } from './data/templates';
import {
  fetchConnectionState,
  generateCurlCommand,
  normalizeApiKey,
  sanitizePhoneNumber,
  sendMediaMessage,
  sendTextMessage,
  verifyNumber,
} from './services/whatsappService';
import { StatusDashboard } from './components/StatusDashboard';
import { RecipientInput } from './components/RecipientInput';
import { TemplatePicker } from './components/TemplatePicker';
import { MessageComposer } from './components/MessageComposer';
import { PhonePreview } from './components/PhonePreview';
import { ConsoleInspector } from './components/ConsoleInspector';
import { SettingsModal } from './components/SettingsModal';
import { CodeExportModal } from './components/CodeExportModal';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export default function App() {
  // Configuration State
  const [config, setConfig] = useState<WhatsAppConfig>(() => {
    try {
      const saved = localStorage.getItem('wa_api_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clear previous hardcoded instance or key so user enters their own credentials
        if (
          parsed.instance === 'user_yrztomld6vqiqgjt' ||
          parsed.apiKey === '429683C4C977415CAAFCCE10F7D57E11' ||
          parsed.apiKey === 'wapi_live_429683c4c977415caafcce10f7d57e11'
        ) {
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

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig: WhatsAppConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('wa_api_config', JSON.stringify(newConfig));
    } catch {
      // ignore
    }
    addToast('success', 'Configuration Saved', 'API credentials updated. Connecting to instance...');
    // Re-check connection immediately with new credentials
    if (newConfig.baseUrl && newConfig.instance && newConfig.apiKey) {
      checkConnection(newConfig);
    }
  };

  // Connection State
  const [connectionState, setConnectionState] = useState<ConnectionStateData | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0); // Off by default until connected

  // Recipient Number & Verification
  const [phoneNumber, setPhoneNumber] = useState<string>(config.connectedNumber || '');
  const [isVerifyingNumber, setIsVerifyingNumber] = useState(false);
  const [isVerifyingSelf, setIsVerifyingSelf] = useState(false);
  const [verificationResult, setVerificationResult] = useState<WhatsAppNumberVerification | null>(null);

  // Template State & Customization
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(PRESET_TEMPLATES[0].id);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    customerName: 'Customer',
    orderId: 'BC-8492',
    amount: '649',
    deliveryMins: '28',
  });

  // Message Payload State
  const [messageType, setMessageType] = useState<'text' | 'media'>('text');
  const [textMessage, setTextMessage] = useState<string>(
    '🎉 *Order Confirmed!* \n\nHello *Customer*, thank you for dining with us!\n\n📦 *Order ID:* #BC-8492\n🍔 *Items:* 1x Truffle Smash Burger, 1x Crispy Parmesan Fries\n💰 *Total Paid:* ₹649\n⏳ *Estimated Delivery:* 28 minutes\n\n_Need help? Reply to this message anytime!_'
  );
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'document'>('document');
  const [mediaUrl, setMediaUrl] = useState<string>(
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  );
  const [fileName, setFileName] = useState<string>('Invoice_Sample.pdf');
  const [caption, setCaption] = useState<string>(
    '🧾 Here is your official invoice for Order #BC-8492. Thank you for your patronage!'
  );

  // Dispatch & UI States
  const [isSending, setIsSending] = useState(false);
  const [isCurlCopied, setIsCurlCopied] = useState(false);
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodeExportOpen, setIsCodeExportOpen] = useState(false);

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

  // Connection Checker Function
  const checkConnection = useCallback(
    async (currentConfig = config) => {
      if (!currentConfig.baseUrl || !currentConfig.instance || !currentConfig.apiKey) {
        return;
      }
      setIsCheckingConnection(true);
      try {
        const result = await fetchConnectionState(currentConfig);
        setConnectionState(result.state);
        setLogs((prev) => [result.log, ...prev].slice(0, 50));
      } catch (err: any) {
        addToast('error', 'Connection Check Failed', err?.message || 'Network error');
      } finally {
        setIsCheckingConnection(false);
      }
    },
    [config]
  );

  // Check connection on mount (only if configured)
  useEffect(() => {
    if (config.baseUrl && config.instance && config.apiKey) {
      checkConnection();
    }
  }, [checkConnection, config.baseUrl, config.instance, config.apiKey]);

  // Auto-refresh timer for connection status
  useEffect(() => {
    if (autoRefreshInterval <= 0 || !config.baseUrl || !config.instance || !config.apiKey) return;
    const intervalId = setInterval(() => {
      checkConnection();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, checkConnection, config.baseUrl, config.instance, config.apiKey]);

  // Verify Phone Number
  const handleVerifyNumber = async (phone: string, isSelf = false) => {
    if (!config.baseUrl || !config.instance || !config.apiKey) {
      addToast('info', 'Credentials Required', 'Please enter your WhatsApp API credentials in Config to connect first.');
      setIsSettingsOpen(true);
      return;
    }

    if (!phone || !sanitizePhoneNumber(phone)) {
      addToast('error', 'Missing Phone Number', 'Please enter a valid mobile number with country code.');
      return;
    }

    if (isSelf) {
      setIsVerifyingSelf(true);
    } else {
      setIsVerifyingNumber(true);
    }

    try {
      const res = await verifyNumber(config, phone);
      setLogs((prev) => [res.log, ...prev].slice(0, 50));

      if (!isSelf) {
        setVerificationResult(res.verification);
      }

      if (res.verification.exists) {
        addToast(
          'success',
          'WhatsApp Account Verified',
          `${phone} is registered on WhatsApp! (JID: ${res.verification.jid || 'valid'})`
        );
      } else {
        addToast(
          'error',
          'Not Registered',
          `${phone} was not recognized as an active WhatsApp account by the network.`
        );
      }
    } catch (err: any) {
      addToast('error', 'Verification Failed', err?.message || 'Error communicating with API');
    } finally {
      setIsVerifyingNumber(false);
      setIsVerifyingSelf(false);
    }
  };

  // Template Selection Handler
  const handleSelectTemplate = (
    template: MessageTemplate,
    resolvedText: string,
    resolvedCaption?: string
  ) => {
    setSelectedTemplateId(template.id);
    setMessageType(template.type);

    if (template.type === 'text') {
      setTextMessage(resolvedText);
    } else {
      if (template.mediaType) setMediaType(template.mediaType);
      if (template.mediaUrl) setMediaUrl(template.mediaUrl);
      if (template.fileName) setFileName(template.fileName);
      setCaption(resolvedCaption || '');
    }

    addToast('info', 'Template Applied', `"${template.title}" loaded into composer.`);
  };

  // Variable Change Handler
  const handleVariableChange = (key: string, value: string) => {
    const updated = { ...variableValues, [key]: value };
    setVariableValues(updated);

    // If template is active, re-substitute
    const currentTpl = PRESET_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (currentTpl) {
      let tText = currentTpl.text;
      let tCaption = currentTpl.caption || '';
      currentTpl.variables.forEach((v) => {
        const val = updated[v.key] ?? v.defaultValue;
        const regex = new RegExp(`{{${v.key}}}`, 'g');
        tText = tText.replace(regex, val);
        tCaption = tCaption.replace(regex, val);
      });

      if (currentTpl.type === 'text') {
        setTextMessage(tText);
      } else {
        setCaption(tCaption);
      }
    }
  };

  // Randomize Variables
  const handleRandomizeVariables = () => {
    const randomOrderNumber = Math.floor(1000 + Math.random() * 9000);
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const randomNames = ['Aarav Patel', 'Pooja Verma', 'Vikram Malhotra', 'Sanya Gupta', 'Karan Mehta'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomAmounts = ['499', '780', '1,250', '340', '920'];
    const randomAmount = randomAmounts[Math.floor(Math.random() * randomAmounts.length)];

    const updated: Record<string, string> = {
      ...variableValues,
      customerName: randomName,
      guestName: randomName,
      orderId: `BC-${randomOrderNumber}`,
      resCode: `RES-${randomOrderNumber}`,
      amount: randomAmount,
      otpCode: randomOtp,
      deliveryMins: String(Math.floor(20 + Math.random() * 25)),
    };

    setVariableValues(updated);

    const currentTpl = PRESET_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (currentTpl) {
      let tText = currentTpl.text;
      let tCaption = currentTpl.caption || '';
      currentTpl.variables.forEach((v) => {
        const val = updated[v.key] ?? v.defaultValue;
        const regex = new RegExp(`{{${v.key}}}`, 'g');
        tText = tText.replace(regex, val);
        tCaption = tCaption.replace(regex, val);
      });

      if (currentTpl.type === 'text') {
        setTextMessage(tText);
      } else {
        setCaption(tCaption);
      }
    }

    addToast('info', 'Data Randomized', 'Generated fresh simulated order, OTP, and customer values.');
  };

  // Trigger Send Message Action
  const handleSendMessage = async () => {
    if (!config.baseUrl || !config.instance || !config.apiKey) {
      addToast('error', 'Instance Not Configured', 'Please configure your WhatsApp API credentials in Config before sending.');
      setIsSettingsOpen(true);
      return;
    }

    const cleanPhone = sanitizePhoneNumber(phoneNumber);
    if (!cleanPhone) {
      addToast('error', 'Missing Phone Number', 'Please enter a valid WhatsApp mobile number with country code.');
      return;
    }

    setIsSending(true);
    try {
      let result;
      if (messageType === 'text') {
        if (!textMessage.trim()) {
          addToast('error', 'Empty Message', 'Please enter text for the WhatsApp message.');
          setIsSending(false);
          return;
        }
        result = await sendTextMessage(config, cleanPhone, textMessage);
      } else {
        if (!mediaUrl.trim()) {
          addToast('error', 'Missing Media URL', 'Please enter a valid media URL.');
          setIsSending(false);
          return;
        }
        result = await sendMediaMessage(config, {
          toPhone: cleanPhone,
          mediaUrl,
          mediaType,
          caption,
          fileName,
        });
      }

      setLogs((prev) => [result.log, ...prev].slice(0, 50));

      if (result.success) {
        addToast(
          'success',
          'Message Dispatched! 🚀',
          `Successfully triggered ${messageType.toUpperCase()} message to +${cleanPhone}. Status: ${result.log.status}`
        );
      } else {
        addToast(
          'error',
          'API Error',
          result.error || `HTTP ${result.log.status}: Check instance connection state.`
        );
      }
    } catch (err: any) {
      addToast('error', 'Dispatch Failed', err?.message || 'Could not send WhatsApp message.');
    } finally {
      setIsSending(false);
    }
  };

  // Copy current active cURL command
  const handleCopyCurrentCurl = () => {
    const cleanPhone = sanitizePhoneNumber(phoneNumber);
    const cleanBase = (config.baseUrl || 'https://your-evolution-api.example.com').replace(/\/+$/, '');
    const instance = config.instance || 'YOUR_INSTANCE_NAME';
    const apiKey = config.apiKey || 'YOUR_API_KEY';
    let endpoint = '';
    let body = {};

    if (messageType === 'text') {
      endpoint = `${cleanBase}/message/sendText/${instance}`;
      body = {
        number: cleanPhone ? `+${cleanPhone}` : '+1234567890',
        text: textMessage,
      };
    } else {
      endpoint = `${cleanBase}/message/sendMedia/${instance}`;
      body = {
        number: cleanPhone ? `+${cleanPhone}` : '+1234567890',
        mediatype: mediaType,
        mimetype: mediaType === 'document' ? 'application/pdf' : 'image/jpeg',
        media: mediaUrl,
        caption,
        fileName,
      };
    }

    const curl = generateCurlCommand('POST', endpoint, apiKey, body);
    navigator.clipboard.writeText(curl);
    setIsCurlCopied(true);
    setTimeout(() => setIsCurlCopied(false), 2000);
    addToast('info', 'cURL Copied', 'Paste into your terminal to test directly from command line.');
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phoneNumber, messageType, textMessage, mediaUrl, mediaType, caption, fileName, config]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 font-sans pb-16">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  WhatsApp Hub API Studio
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                  Evolution v2
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Interactive testing environment for BiteChez, notifications, media, and verification
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCodeExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition border border-zinc-700/80"
              title="View & copy SDK code snippets"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Integration Code</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition border border-zinc-700/80"
              title="Configure API base URL, instance, and key"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>Config</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Section 1: Realtime WhatsApp Status Dashboard */}
        <StatusDashboard
          config={config}
          connectionState={connectionState}
          isLoading={isCheckingConnection}
          onRefresh={() => checkConnection()}
          onVerifySelfNumber={() => handleVerifyNumber(config.connectedNumber, true)}
          isVerifyingSelf={isVerifyingSelf}
          autoRefreshInterval={autoRefreshInterval}
          setAutoRefreshInterval={setAutoRefreshInterval}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Section 2: Interactive Testing Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input, Templates & Composer (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mobile Number Target Input */}
            <RecipientInput
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onVerifyNumber={(phone) => handleVerifyNumber(phone, false)}
              isVerifying={isVerifyingNumber}
              verificationResult={verificationResult}
              defaultNumber={config.connectedNumber}
            />

            {/* Template Selector with Variables */}
            <TemplatePicker
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={handleSelectTemplate}
              variableValues={variableValues}
              onVariableChange={handleVariableChange}
              onRandomizeVariables={handleRandomizeVariables}
            />

            {/* Message Composer & Trigger Button */}
            <MessageComposer
              messageType={messageType}
              setMessageType={setMessageType}
              textMessage={textMessage}
              setTextMessage={setTextMessage}
              mediaType={mediaType}
              setMediaType={setMediaType}
              mediaUrl={mediaUrl}
              setMediaUrl={setMediaUrl}
              fileName={fileName}
              setFileName={setFileName}
              caption={caption}
              setCaption={setCaption}
              onSendMessage={handleSendMessage}
              isSending={isSending}
              onCopyCurl={handleCopyCurrentCurl}
              isCurlCopied={isCurlCopied}
              onClear={() => {
                setTextMessage('');
                setCaption('');
              }}
              targetPhone={phoneNumber}
            />
          </div>

          {/* Right Column: Live Phone Mockup Preview (5 cols) */}
          <div className="lg:col-span-5 sticky top-20">
            <PhonePreview
              recipientPhone={phoneNumber}
              senderPhone={config.connectedNumber}
              messageType={messageType}
              textMessage={textMessage}
              mediaType={mediaType}
              mediaUrl={mediaUrl}
              fileName={fileName}
              caption={caption}
            />
          </div>
        </div>

        {/* Section 3: Live API Request & Response Console Inspector */}
        <ConsoleInspector logs={logs} onClearLogs={() => setLogs([])} />
      </main>

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-start gap-3 transition-all transform duration-200 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-zinc-900 border-rose-500/40 text-rose-300'
                : 'bg-zinc-900 border-blue-500/40 text-blue-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <div className="font-bold text-xs text-white">{toast.title}</div>
              <div className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white p-0.5 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <CodeExportModal
        isOpen={isCodeExportOpen}
        onClose={() => setIsCodeExportOpen(false)}
        config={config}
        targetPhone={phoneNumber}
        messageText={messageType === 'text' ? textMessage : caption}
      />
    </div>
  );
}
