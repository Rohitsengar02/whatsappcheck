import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  Key,
  Smartphone,
  Database,
  Check,
  RefreshCw,
  Globe,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Radio,
  QrCode,
  Send,
  Copy,
  Sparkles,
  Zap,
  UserCheck,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { ConnectionStateData, WhatsAppConfig } from '../../types/dashboard';
import {
  createInstance,
  fetchInstanceQrCode,
  fetchConnectionState,
  sendTextMessage,
  logoutInstance,
  deleteInstance,
  sanitizePhoneNumber,
  formatPhoneDisplay
} from '../../services/whatsappService';
import { authService, User } from '../../services/authService';

interface SettingsViewProps {
  config: WhatsAppConfig;
  onSaveConfig: (newConfig: WhatsAppConfig) => void;
  connectionState: ConnectionStateData | null;
  isChecking: boolean;
  onTestConnection: () => void;
  onClearCredentials: () => void;
  currentUser?: User | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onSaveConfig,
  connectionState,
  isChecking,
  onTestConnection,
  onClearCredentials,
  currentUser,
}) => {
  // Form State
  const [formData, setFormData] = useState<WhatsAppConfig>({
    baseUrl: config.baseUrl || 'https://www.bitechez.com',
    instance: config.instance || (currentUser ? `user_${currentUser.id}_${Math.random().toString(36).substring(2, 7)}` : 'user_' + Math.random().toString(36).substring(2, 9)),
    apiKey: config.apiKey || '429683C4C977415CAAFCCE10F7D57E11',
    connectedNumber: config.connectedNumber || '',
    mediaBucket: config.mediaBucket || 'rudram-media',
    useProxy: config.useProxy ?? false,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // QR Code Generation & Pairing State
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollCountdown, setPollCountdown] = useState(45);
  const [dbSaveNotice, setDbSaveNotice] = useState<string | null>(null);

  // Live Test Message State
  const [testPhone, setTestPhone] = useState(currentUser?.phone || '9411800280');
  const [testMessage, setTestMessage] = useState(
    'Hello! 👋 This is a live test message from Evolution API on www.bitechez.com. WhatsApp instance is paired and verified successfully! 🚀'
  );
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
    timestamp?: string;
  } | null>(null);

  // Polling ref to clear timers
  const pollTimerRef = useRef<any>(null);

  const isConnected = connectionState?.status === 'open';

  // Sync initial config if changed externally
  useEffect(() => {
    if (config.baseUrl || config.instance) {
      setFormData((prev) => ({
        ...prev,
        baseUrl: config.baseUrl || prev.baseUrl,
        instance: config.instance || prev.instance,
        apiKey: config.apiKey || prev.apiKey,
        connectedNumber: config.connectedNumber || prev.connectedNumber,
        mediaBucket: config.mediaBucket || prev.mediaBucket,
        useProxy: config.useProxy ?? prev.useProxy,
      }));
    }
  }, [config]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  // Preset Server URLs
  const serverPresets = [
    { label: 'Production www.bitechez.com', url: 'https://www.bitechez.com' },
    { label: 'Render Cloud Instance', url: 'https://whatsappapi-1n7u.onrender.com' },
    { label: 'Local Development Server', url: 'http://localhost:8080' },
  ];

  // Helper to persist credentials to Neon PostgreSQL
  const persistToDatabase = async (instanceName: string, apiKey: string, serverUrl: string, phoneNum?: string) => {
    const user = currentUser || authService.getUser();
    if (!user) return;

    try {
      const res = await authService.updateProfile({
        instance_name: instanceName,
        api_key: apiKey,
        server_url: serverUrl,
        phone: phoneNum || user.phone,
      });

      if (res.success) {
        setDbSaveNotice(`Saved to database for User #${user.id} (${user.email})`);
        setTimeout(() => setDbSaveNotice(null), 5000);
      }
    } catch (e) {
      console.warn('[PostgreSQL Persistence Notice]:', e);
    }
  };

  // 1. Generate QR Code
  const handleGenerateQr = async () => {
    if (!formData.baseUrl) {
      setQrError('Please select or enter the Evolution API Server URL');
      return;
    }

    const effectiveInstance = formData.instance.trim() || `user_${Math.random().toString(36).substring(2, 9)}`;
    const effectiveKey = formData.apiKey.trim() || '429683C4C977415CAAFCCE10F7D57E11';

    setIsGeneratingQr(true);
    setQrError(null);
    setQrBase64(null);
    setPairingCode(null);

    const activeConfig: WhatsAppConfig = {
      ...formData,
      instance: effectiveInstance,
      apiKey: effectiveKey,
    };

    try {
      // Step A: Attempt to create the instance
      let result = await createInstance(activeConfig, effectiveInstance, effectiveKey);

      let foundBase64 = result.qrcode?.base64;
      let foundPairingCode = result.qrcode?.pairingCode;

      // Step B: If instance already exists or no QR in create response, fetch via /instance/connect
      if (!foundBase64) {
        const connectResult = await fetchInstanceQrCode(activeConfig, effectiveInstance);
        if (connectResult.qrcode?.base64) {
          foundBase64 = connectResult.qrcode.base64;
          foundPairingCode = connectResult.qrcode.pairingCode;
        }
      }

      if (foundBase64) {
        // Ensure data:image format
        const cleanBase64 = foundBase64.startsWith('data:image')
          ? foundBase64
          : `data:image/png;base64,${foundBase64}`;
        setQrBase64(cleanBase64);
        setPairingCode(foundPairingCode || null);

        // Update form state & config
        setFormData(activeConfig);
        onSaveConfig(activeConfig);

        // Start connection polling
        startConnectionPolling(activeConfig);
      } else {
        // If already open/connected
        const stateCheck = await fetchConnectionState(activeConfig);
        if (stateCheck.state.status === 'open') {
          onSaveConfig(activeConfig);
          await persistToDatabase(effectiveInstance, effectiveKey, activeConfig.baseUrl);
          onTestConnection();
        } else {
          setQrError(result.error || 'Could not retrieve QR code. Check server connection or API key.');
        }
      }
    } catch (err: any) {
      setQrError(err.message || 'Error communicating with Evolution API server.');
    } finally {
      setIsGeneratingQr(false);
    }
  };

  // 2. Start Polling for Scan Completion
  const startConnectionPolling = (activeConfig: WhatsAppConfig) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }

    setIsPolling(true);
    setPollCountdown(45);

    let attempts = 0;
    const maxAttempts = 30; // 30 * 2.5s = 75 seconds

    pollTimerRef.current = setInterval(async () => {
      attempts++;
      setPollCountdown((prev) => Math.max(0, prev - 2));

      try {
        const check = await fetchConnectionState(activeConfig);
        if (check.state.status === 'open') {
          clearInterval(pollTimerRef.current);
          setIsPolling(false);
          setQrBase64(null);

          // Update active config
          onSaveConfig(activeConfig);
          onTestConnection();

          // Auto-save to Neon PostgreSQL database
          await persistToDatabase(activeConfig.instance, activeConfig.apiKey, activeConfig.baseUrl);
        }
      } catch (e) {
        // continue polling
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollTimerRef.current);
        setIsPolling(false);
      }
    }, 2500);
  };

  // 3. Send Test WhatsApp Message
  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNumber = sanitizePhoneNumber(testPhone);
    if (!cleanNumber || cleanNumber.length < 8) {
      setTestResult({
        success: false,
        message: 'Please provide a valid recipient phone number with country code (e.g. 919411800280).',
      });
      return;
    }

    if (!formData.instance || !formData.baseUrl) {
      setTestResult({
        success: false,
        message: 'Please configure and pair your WhatsApp instance first.',
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await sendTextMessage(formData, cleanNumber, testMessage);

      if (res.success) {
        setTestResult({
          success: true,
          message: `Test message dispatched successfully to +${cleanNumber}!`,
          details: res.data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Failed to send WhatsApp message. Verify instance connection.',
          details: res.data,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network dispatch error.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // 4. Disconnect / Logout WhatsApp Session
  const handleDisconnect = async () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }
    setIsPolling(false);
    setQrBase64(null);

    if (formData.instance && formData.baseUrl) {
      try {
        await logoutInstance(formData, formData.instance);
      } catch (e) {
        // ignore
      }
    }

    onClearCredentials();
    onTestConnection();
  };

  // 5. Manual Config Save
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    // Save to PostgreSQL
    await persistToDatabase(formData.instance, formData.apiKey, formData.baseUrl, formData.connectedNumber);
    onTestConnection();
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              WhatsApp Channel & Instance Connection
            </h3>
            {currentUser && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <UserCheck className="w-3 h-3" />
                User #{currentUser.id}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate a live QR code, pair any WhatsApp mobile account, auto-save credentials to the database, and verify messaging.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${
              isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span>{isConnected ? 'LIVE & PAIRED' : isPolling ? 'WAITING FOR SCAN' : 'NOT CONNECTED'}</span>
          </div>

          <button
            type="button"
            onClick={onTestConnection}
            disabled={isChecking || !formData.instance}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Pinging...' : 'Ping Now'}</span>
          </button>
        </div>
      </div>

      {/* Database Sync Notice */}
      {dbSaveNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dbSaveNotice}</span>
        </div>
      )}

      {/* SECTION 1: LIVE QR CODE CONNECTION CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              Live WhatsApp QR Code Pairing
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect your WhatsApp with <span className="font-semibold text-slate-800">www.bitechez.com</span> Evolution API in seconds.
            </p>
          </div>

          {/* Server Preset Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {serverPresets.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => setFormData({ ...formData, baseUrl: preset.url })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  formData.baseUrl === preset.url
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Quick Config Inputs */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Evolution API Server URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    placeholder="https://www.bitechez.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Instance Identifier</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          instance: `user_${Math.random().toString(36).substring(2, 9)}`,
                        })
                      }
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                    >
                      New Name
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.instance}
                    onChange={(e) => setFormData({ ...formData, instance: e.target.value })}
                    placeholder="e.g. user_bitechez_01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Auth API Key</label>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                    >
                      {showApiKey ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="429683C4C977415CAAFCCE10F7D57E11"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateQr}
                  disabled={isGeneratingQr || isConnected}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isGeneratingQr ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating QR Code...</span>
                    </>
                  ) : isConnected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>WhatsApp Connected</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Generate WhatsApp QR Code</span>
                    </>
                  )}
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                )}
              </div>

              {/* Instructions */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  How to link your WhatsApp:
                </p>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside pl-0.5">
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap Menu / Settings &gt; <span className="font-semibold text-slate-800">Linked Devices</span></li>
                  <li>Tap <span className="font-semibold text-slate-800">Link a Device</span> and scan the QR code</li>
                </ol>
              </div>

              {qrError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Notice: </span>
                    {qrError}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: QR Code Display Card */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl min-h-[320px]">
              {isConnected ? (
                /* Connected State */
                <div className="text-center space-y-3 animate-fadeIn">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-slate-900">
                      WhatsApp Connected Successfully!
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                      Session is live on <span className="font-mono text-emerald-700 font-semibold">{formData.baseUrl}</span> under instance <span className="font-mono font-semibold">{formData.instance}</span>.
                    </p>
                  </div>
                  {currentUser && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700 font-medium">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Linked with User ID #{currentUser.id}</span>
                    </div>
                  )}
                </div>
              ) : qrBase64 ? (
                /* QR Code Display */
                <div className="text-center space-y-3 animate-fadeIn">
                  <div className="p-3 bg-white border-2 border-emerald-500/30 rounded-2xl shadow-md inline-block">
                    <img
                      src={qrBase64}
                      alt="WhatsApp QR Code"
                      className="w-56 h-56 object-contain rounded-xl"
                    />
                  </div>

                  {isPolling && (
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span>Waiting for phone scan... ({pollCountdown}s)</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateQr}
                      disabled={isGeneratingQr}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingQr ? 'animate-spin' : ''}`} />
                      <span>Refresh QR Code</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Initial Empty / Call to Action */
                <div className="text-center space-y-3 py-6">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      QR Code Scanner Ready
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Click <span className="font-semibold text-emerald-600">"Generate WhatsApp QR Code"</span> to pair your device with <span className="font-mono">www.bitechez.com</span>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LIVE MESSAGE DISPATCH TESTER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              Live WhatsApp Message Dispatch Tester
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your connected instance by sending a real-time WhatsApp message to any mobile number.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
            Instant Delivery
          </span>
        </div>

        <div className="p-6">
          <form onSubmit={handleSendTestMessage} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Recipient Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g. 9411800280 or +919411800280"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Include country code (e.g. 91 for India)
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Test Message Body
                </label>
                <textarea
                  rows={2}
                  required
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Write test message body..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dispatches via Evolution API /message/sendText</span>
              </div>

              <button
                type="submit"
                disabled={isSendingTest || !formData.instance}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Test Message</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`mt-4 p-4 rounded-xl border text-xs animate-fadeIn ${
                testResult.success
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{testResult.message}</span>
                    {testResult.timestamp && (
                      <span className="text-[10px] opacity-75 font-mono">{testResult.timestamp}</span>
                    )}
                  </div>
                  {testResult.details && (
                    <pre className="text-[10px] font-mono bg-white/70 p-2 rounded-lg border border-slate-200/50 overflow-x-auto max-h-28">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: ADVANCED CONFIGURATION & DATABASE PERSISTENCE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Instance Credentials & Database Persistence
            </h4>
            <span className="text-xs text-slate-400">Neon PostgreSQL Synced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Connected Sender WhatsApp Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={formData.connectedNumber}
                onChange={(e) => setFormData({ ...formData, connectedNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Cloud Media Storage Bucket (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. rudram-media"
                value={formData.mediaBucket}
                onChange={(e) => setFormData({ ...formData, mediaBucket: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Local Edge Proxy */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Use Local Edge Proxy</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Routes API dispatches through the local application proxy to bypass any browser CORS restrictions.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={formData.useProxy}
                onChange={(e) => setFormData({ ...formData, useProxy: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Credentials</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved & Synced to Database!' : 'Save & Persist Credentials'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
