import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { sanitizePhoneNumber, formatPhoneDisplay } from '../services/whatsappService';
import { WhatsAppNumberVerification } from '../types/whatsapp';

interface RecipientInputProps {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  onVerifyNumber: (phone: string) => void;
  isVerifying: boolean;
  verificationResult: WhatsAppNumberVerification | null;
  defaultNumber: string;
}

const COMMON_COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'US/Canada (+1)' },
  { code: '+44', country: 'UK', label: 'United Kingdom (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
];

export const RecipientInput: React.FC<RecipientInputProps> = ({
  phoneNumber,
  setPhoneNumber,
  onVerifyNumber,
  isVerifying,
  verificationResult,
  defaultNumber,
}) => {
  const [recentNumbers, setRecentNumbers] = useState<string[]>(() => {
    return defaultNumber ? [defaultNumber] : [];
  });

  const sanitized = sanitizePhoneNumber(phoneNumber);

  const handleApplyPreset = (num: string) => {
    setPhoneNumber(num);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Recipient WhatsApp Mobile Number</h3>
            <p className="text-xs text-zinc-400">Enter international phone with country code (e.g. +91, +1, +44)</p>
          </div>
        </div>

        {/* Quick fill default number if provided in config */}
        {defaultNumber && (
          <button
            type="button"
            onClick={() => handleApplyPreset(defaultNumber)}
            className="text-xs px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-teal-300 rounded-lg transition border border-zinc-700/60 flex items-center gap-1.5"
            title="Fill connected test WhatsApp number"
          >
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>Use Connected Number ({defaultNumber})</span>
          </button>
        )}
      </div>

      {/* Input Group */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Quick country code dropdown */}
          <div className="w-full sm:w-44 shrink-0">
            <select
              aria-label="Country Code"
              onChange={(e) => {
                const code = e.target.value;
                if (!phoneNumber.startsWith('+')) {
                  setPhoneNumber(`${code}${sanitized}`);
                } else {
                  // Replace existing prefix
                  const match = phoneNumber.match(/^\+\d{1,3}/);
                  if (match) {
                    setPhoneNumber(phoneNumber.replace(match[0], code));
                  } else {
                    setPhoneNumber(`${code}${sanitized}`);
                  }
                }
              }}
              defaultValue="+91"
              className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {COMMON_COUNTRY_CODES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Main phone input */}
          <div className="relative flex-1">
            <input
              type="tel"
              placeholder="+1234567890 (e.g. +919876543210)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700/90 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Verify WhatsApp Account button */}
          <button
            type="button"
            onClick={() => onVerifyNumber(phoneNumber)}
            disabled={isVerifying || !sanitized}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0 border border-zinc-700 active:scale-95"
            title="Checks if number is active on WhatsApp network via Evolution API"
          >
            <ShieldCheck className={`w-4 h-4 text-emerald-400 ${isVerifying ? 'animate-pulse' : ''}`} />
            <span>{isVerifying ? 'Checking...' : 'Verify on WhatsApp'}</span>
          </button>
        </div>

        {/* Formatted number preview & Verification result */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
          <div className="text-zinc-400 flex items-center gap-2">
            <span>API Payload Format:</span>
            <span className="font-mono bg-zinc-800/80 px-2 py-0.5 rounded text-emerald-300 font-medium">
              &quot;number&quot;: &quot;{sanitized ? `+${sanitized}` : '—'}&quot;
            </span>
            <span className="text-zinc-500 text-[11px]">
              (Normalized digits: <code className="text-zinc-400">{sanitized || 'none'}</code>)
            </span>
          </div>

          {/* Verification Badge */}
          {verificationResult && (
            <div className="flex items-center gap-1.5">
              {verificationResult.exists ? (
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>WhatsApp Verified</span>
                  {verificationResult.jid && (
                    <span className="text-[10px] text-emerald-500 font-mono hidden sm:inline">
                      ({verificationResult.jid.slice(0, 15)}...)
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Not on WhatsApp or unreachable</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent test numbers */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
          <span className="text-zinc-400">Quick Numbers:</span>
          {recentNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleApplyPreset(num)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition ${
                phoneNumber === num
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
