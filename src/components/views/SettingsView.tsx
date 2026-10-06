import React, { useState } from 'react';
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
  Radio
} from 'lucide-react';
import { ConnectionStateData, WhatsAppConfig } from '../../types/dashboard';

interface SettingsViewProps {
  config: WhatsAppConfig;
  onSaveConfig: (newConfig: WhatsAppConfig) => void;
  connectionState: ConnectionStateData | null;
  isChecking: boolean;
  onTestConnection: () => void;
  onClearCredentials: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onSaveConfig,
  connectionState,
  isChecking,
  onTestConnection,
  onClearCredentials,
}) => {
  const [formData, setFormData] = useState<WhatsAppConfig>({ ...config });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const isConnected = connectionState?.status === 'open';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Channel Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            WhatsApp Channel & Instance Connection
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect your Evolution API server, set instance credentials, and test live WhatsApp session status.
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isConnected ? 'LIVE & PAIRED' : 'NOT CONNECTED'}</span>
          </div>

          <button
            type="button"
            onClick={onTestConnection}
            disabled={isChecking || !config.instance}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Pinging...' : 'Ping Now'}</span>
          </button>
        </div>
      </div>

      {/* Connection Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              API Server Configuration
            </h4>
            <span className="text-xs text-slate-400">All fields are securely handled</span>
          </div>

          {/* 1. Base URL */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Production Server URL
            </label>
            <input
              type="url"
              required
              placeholder="https://your-evolution-api.example.com"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              The public URL of your deployed Evolution API service (e.g. Render, Railway, or VPS).
            </span>
          </div>

          {/* 2. Instance Name */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Active WhatsApp Instance Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. my-business-instance"
              value={formData.instance}
              onChange={(e) => setFormData({ ...formData, instance: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              The instance identifier created inside your Evolution API dashboard.
            </span>
          </div>

          {/* 3. API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Auth Header API Key (apikey)
              </label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {showApiKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={showApiKey ? 'text' : 'password'}
              required
              placeholder="Paste your Evolution API authentication key"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Global API key or instance API key configured in your environment.
            </span>
          </div>

          {/* 4. Sender Number & Media Bucket */}
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
                placeholder="e.g. my-media-bucket"
                value={formData.mediaBucket}
                onChange={(e) => setFormData({ ...formData, mediaBucket: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* High reliability proxy */}
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
              onClick={onClearCredentials}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Disconnect / Clear Credentials</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved & Connected!' : 'Save & Connect Instance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
