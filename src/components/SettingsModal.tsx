import React, { useState } from 'react';
import {
  X,
  Key,
  Server,
  Smartphone,
  Database,
  RotateCcw,
  Check,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { DEFAULT_CONFIG, WhatsAppConfig } from '../types/whatsapp';
import { normalizeApiKey } from '../services/whatsappService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WhatsAppConfig;
  onSaveConfig: (newConfig: WhatsAppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<WhatsAppConfig>({
    ...config,
    apiKey: normalizeApiKey(config.apiKey),
  });
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = {
      ...formData,
      apiKey: normalizeApiKey(formData.apiKey),
    };
    onSaveConfig(normalized);
    onClose();
  };

  const handleClear = () => {
    setFormData({
      baseUrl: '',
      instance: '',
      apiKey: '',
      connectedNumber: '',
      mediaBucket: '',
      useProxy: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">API Credentials & Environment</h2>
            <p className="text-xs text-zinc-400">Manage WhatsApp Evolution API keys, instances, and proxy settings</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-5">
          {/* Server Base URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Production Server URL</span>
              <span className="text-[10px] text-zinc-500 font-normal">Render / Evolution Host</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://your-evolution-api.example.com"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Instance Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Active Instance Name</span>
              <span className="text-[10px] text-emerald-400">Required</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. my-company-instance"
              value={formData.instance}
              onChange={(e) => setFormData({ ...formData, instance: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">Auth Header (apikey)</label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                {showApiKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={showApiKey ? 'text' : 'password'}
              required
              placeholder="Enter your Evolution API key"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-zinc-500">
              Paste the API key configured in your Evolution API instance environment.
            </p>
          </div>

          {/* Connected WhatsApp Number & R2 Bucket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                <span>Sender / Connected Phone</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +1234567890 (optional)"
                value={formData.connectedNumber}
                onChange={(e) => setFormData({ ...formData, connectedNumber: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>Media Bucket (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. my-media-bucket"
                value={formData.mediaBucket}
                onChange={(e) => setFormData({ ...formData, mediaBucket: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* CORS Proxy Toggle */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Use Local Dev Proxy (Recommended)</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Routes requests via <code className="text-emerald-300">/whatsapp-api/*</code> on the Vite development server to bypass browser cross-origin (CORS) restrictions.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={formData.useProxy}
                onChange={(e) => setFormData({ ...formData, useProxy: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Credentials</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition"
              >
                <Check className="w-4 h-4" />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
