import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Database,
  ExternalLink,
  Flame,
  Globe,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { ConnectionStateData, WhatsAppConfig } from '../types/whatsapp';

interface StatusDashboardProps {
  config: WhatsAppConfig;
  connectionState: ConnectionStateData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onVerifySelfNumber: () => void;
  isVerifyingSelf: boolean;
  autoRefreshInterval: number; // in seconds, 0 = off
  setAutoRefreshInterval: (seconds: number) => void;
  onOpenSettings: () => void;
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({
  config,
  connectionState,
  isLoading,
  onRefresh,
  onVerifySelfNumber,
  isVerifyingSelf,
  autoRefreshInterval,
  setAutoRefreshInterval,
  onOpenSettings,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const isConfigured = Boolean(config.baseUrl && config.instance && config.apiKey);

  const getStatusBadge = () => {
    if (!isConfigured) {
      return {
        bg: 'bg-zinc-800 text-zinc-400 border-zinc-700',
        dot: 'bg-zinc-500',
        text: 'NOT CONNECTED',
        icon: <WifiOff className="w-4 h-4 text-zinc-400" />,
        color: 'zinc',
      };
    }

    if (!connectionState) {
      return {
        bg: 'bg-zinc-800/80 text-zinc-300 border-zinc-700',
        dot: 'bg-zinc-400',
        text: 'Checking Connection...',
        icon: <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" />,
        color: 'zinc',
      };
    }

    switch (connectionState.status) {
      case 'open':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400 animate-pulse',
          text: 'ONLINE • OPEN',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          color: 'emerald',
        };
      case 'connecting':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
          text: 'CONNECTING...',
          icon: <Activity className="w-4 h-4 animate-spin text-amber-400" />,
          color: 'amber',
        };
      case 'close':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          text: 'DISCONNECTED • CLOSED',
          icon: <WifiOff className="w-4 h-4 text-rose-400" />,
          color: 'rose',
        };
      case 'refused':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          dot: 'bg-red-400',
          text: 'CONNECTION REFUSED',
          icon: <AlertCircle className="w-4 h-4 text-red-400" />,
          color: 'red',
        };
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          text: 'ERROR / UNREACHABLE',
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          color: 'rose',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow when connected */}
      {connectionState?.status === 'open' && (
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <Smartphone className="w-6 h-6" />
            </div>
            {connectionState?.status === 'open' && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-900"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                WhatsApp Instance Status
              </h2>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                {badge.text}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 flex items-center gap-2">
              <span className="text-emerald-400 font-medium">Evolution API v2</span>
              <span>•</span>
              <span>Endpoint: <code className="text-zinc-300 font-mono">/instance/connectionState/{config.instance}</code></span>
            </p>
          </div>
        </div>

        {/* Action Controls & Auto-refresh */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Auto Refresh dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-800/90 border border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 hidden sm:inline">Auto-Ping:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={0} className="bg-zinc-800 text-zinc-200">Off</option>
              <option value={10} className="bg-zinc-800 text-zinc-200">10s</option>
              <option value={20} className="bg-zinc-800 text-zinc-200">20s</option>
              <option value={60} className="bg-zinc-800 text-zinc-200">60s</option>
            </select>
          </div>

          {/* Manual Ping button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-xs font-semibold shadow transition duration-150 active:scale-95"
            title="Ping WhatsApp connection status now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Checking...' : 'Ping Status'}</span>
          </button>

          {/* Verify self number */}
          <button
            onClick={onVerifySelfNumber}
            disabled={isVerifyingSelf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/70 rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            title="Verify configured WhatsApp number is registered"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>{isVerifyingSelf ? 'Verifying...' : 'Verify Number'}</span>
          </button>

          {/* Config Settings shortcut */}
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs transition"
            title="API Credentials & URL Settings"
          >
            Config
          </button>
        </div>
      </div>

      {/* Connect Callout if not configured */}
      {!isConfigured && (
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Connect Your WhatsApp Instance
            </h4>
            <p className="text-xs text-zinc-300 mt-0.5">
              Enter your Server URL, Instance Name, and API Key to connect and begin testing messages and templates.
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow shrink-0 active:scale-95"
          >
            Enter Credentials
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {/* Card 1: Active Instance */}
        <div className="bg-zinc-800/50 hover:bg-zinc-800/80 transition border border-zinc-700/50 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              Instance Name
            </span>
            {config.instance && (
              <button
                onClick={() => copyToClipboard(config.instance, 'inst')}
                className="text-zinc-500 hover:text-zinc-200 transition"
                title="Copy instance name"
              >
                {copiedKey === 'inst' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="font-mono text-sm font-semibold text-white truncate" title={config.instance || 'Not configured'}>
            {config.instance || <span className="text-zinc-500 italic font-sans text-xs">Not configured</span>}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${config.instance ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
            {config.baseUrl ? 'Custom Evolution API' : 'No Server Connected'}
          </div>
        </div>

        {/* Card 2: Connected WhatsApp Number */}
        <div className="bg-zinc-800/50 hover:bg-zinc-800/80 transition border border-zinc-700/50 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              Connected Number
            </span>
            {config.connectedNumber && (
              <button
                onClick={() => copyToClipboard(config.connectedNumber, 'phone')}
                className="text-zinc-500 hover:text-zinc-200 transition"
                title="Copy phone"
              >
                {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="font-mono text-sm font-bold text-emerald-300">
            {config.connectedNumber || <span className="text-zinc-500 italic font-sans text-xs">Optional / Not set</span>}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
            <span className="text-zinc-500">Business WhatsApp</span>
            {config.connectedNumber && (
              <a
                href={`https://wa.me/${config.connectedNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                Chat <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Card 3: Realtime Latency & Ping */}
        <div className="bg-zinc-800/50 hover:bg-zinc-800/80 transition border border-zinc-700/50 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-blue-400" />
              API Latency
            </span>
            <span className="text-[11px] text-zinc-500">
              {connectionState?.lastChecked
                ? `${Math.max(0, Math.round((Date.now() - connectionState.lastChecked) / 1000))}s ago`
                : '—'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">
              {connectionState?.latencyMs !== undefined ? `${connectionState.latencyMs} ms` : '—'}
            </span>
            {connectionState?.latencyMs !== undefined && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                connectionState.latencyMs < 350
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : connectionState.latencyMs < 900
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {connectionState.latencyMs < 350 ? 'FAST' : connectionState.latencyMs < 900 ? 'NORMAL' : 'HIGH'}
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-zinc-400" />
            Mode: {config.useProxy ? 'Local Dev Proxy' : 'Direct HTTPS'}
          </div>
        </div>

        {/* Card 4: Media Storage */}
        <div className="bg-zinc-800/50 hover:bg-zinc-800/80 transition border border-zinc-700/50 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Media Storage
            </span>
            <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
              Storage
            </span>
          </div>
          <div className="font-mono text-sm font-semibold text-purple-300">
            {config.mediaBucket || <span className="text-zinc-500 italic font-sans text-xs">Default bucket</span>}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
            <span className="text-zinc-500">Invoices & Media</span>
            <span className="text-zinc-400 text-[10px]">{config.mediaBucket ? 'Custom' : 'Direct URL'}</span>
          </div>
        </div>
      </div>

      {/* Info / Alert banner if disconnected or error */}
      {connectionState?.status === 'close' && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold">WhatsApp Session is Closed:</strong> The instance{' '}
            <code className="font-mono text-amber-300">{config.instance}</code> is currently not paired with a mobile phone. You may need to scan the Evolution QR code or restart the session.
          </div>
        </div>
      )}

      {connectionState?.status === 'error' && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold">Connection Check Failed:</strong> {connectionState.error || 'Could not reach server'}.
            <div className="mt-1 text-zinc-400">
              Tip: If you see CORS or network errors, ensure &quot;Use Local Proxy&quot; is turned on in Config.
            </div>
          </div>
        </div>
      )}

      {/* Expandable Raw JSON inspection */}
      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="hover:text-zinc-200 flex items-center gap-1.5 transition"
        >
          <span>{showRawJson ? 'Hide' : 'View'} Raw /instance/connectionState Response</span>
          <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">JSON</span>
        </button>

        <span className="text-[11px] text-zinc-500">
          Auth: <code className="text-zinc-400 font-mono">apikey: {config.apiKey.slice(0, 10)}...</code>
        </span>
      </div>

      {showRawJson && (
        <div className="mt-3 p-3.5 bg-black/60 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-400 overflow-x-auto">
          <pre>{JSON.stringify(connectionState?.rawResponse || { message: 'No response data yet' }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
