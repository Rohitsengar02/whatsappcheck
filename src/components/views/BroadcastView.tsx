import React, { useState } from 'react';
import {
  Radio,
  Users,
  Send,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  Info
} from 'lucide-react';
import { ContactItem, WhatsAppConfig } from '../../types/dashboard';

interface BroadcastViewProps {
  config: WhatsAppConfig;
  contacts: ContactItem[];
  onBroadcastSend: (params: {
    recipients: string[];
    message: string;
    delaySeconds: number;
    onProgress: (sent: number, total: number) => void;
  }) => Promise<void>;
  isBroadcasting: boolean;
}

export const BroadcastView: React.FC<BroadcastViewProps> = ({
  config,
  contacts,
  onBroadcastSend,
  isBroadcasting,
}) => {
  const [recipientListText, setRecipientListText] = useState(
    contacts.map((c) => c.phone).join('\n')
  );
  const [campaignTitle, setCampaignTitle] = useState('Festive VIP Offer Blast');
  const [message, setMessage] = useState(
    '🎉 Hi there! Exclusive VIP offer for you today: Enjoy 25% off on your next order with code SENGAR25. Reply to claim!'
  );
  const [delaySeconds, setDelaySeconds] = useState(4);
  const [sentCount, setSentCount] = useState(0);

  const parsedRecipients = recipientListText
    .split(/[\n,]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 5);

  const handleStartBroadcast = async () => {
    if (parsedRecipients.length === 0 || !message.trim()) return;
    setSentCount(0);
    await onBroadcastSend({
      recipients: parsedRecipients,
      message,
      delaySeconds,
      onProgress: (sent) => setSentCount(sent),
    });
  };

  const handleSelectAllContacts = () => {
    setRecipientListText(contacts.map((c) => c.phone).join('\n'));
  };

  const progressPercent = parsedRecipients.length > 0
    ? Math.round((sentCount / parsedRecipients.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Anti-Ban Safety Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <strong className="font-bold text-emerald-950">Smart Anti-Ban Throttling Enabled:</strong>{' '}
          Our dispatcher spaces out outgoing messages with a configurable {delaySeconds}s jitter delay. This keeps your WhatsApp Business account safe and prevents spam detection flags.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Recipients & Campaign Settings (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Campaign Details */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Broadcast Campaign Setup</h3>
                  <p className="text-xs text-slate-500">Configure bulk recipient list and delay</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g. October Customer Followup"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Recipient Numbers Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Recipient Numbers (one per line or comma separated)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllContacts}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  + Add All {contacts.length} Contacts
                </button>
              </div>
              <textarea
                rows={5}
                value={recipientListText}
                onChange={(e) => setRecipientListText(e.target.value)}
                placeholder="+919876543210&#10;+14155552671&#10;+971501234567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{parsedRecipients.length} valid recipients detected</span>
                <span>International format required (+country code)</span>
              </div>
            </div>

            {/* Delay Slider */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" /> Dispatch Throttle Delay
                </span>
                <span className="font-bold text-emerald-700 font-mono">{delaySeconds} seconds</span>
              </div>
              <input
                type="range"
                min={2}
                max={15}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>2s (Faster)</span>
                <span>Safe recommended: 4-6s</span>
                <span>15s (Ultra Safe)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form: Message Text & Progress Bar (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Broadcast Message Content
            </h3>

            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type the message you want to broadcast to your audience..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white leading-relaxed"
            />

            {/* Live Progress Bar when running */}
            {isBroadcasting && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    Broadcasting in progress...
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {sentCount} / {parsedRecipients.length} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-emerald-700">
                  Please keep this tab open until all recipients have been delivered.
                </p>
              </div>
            )}

            {/* Launch CTA */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ready to dispatch {parsedRecipients.length} messages
              </span>

              <button
                type="button"
                onClick={handleStartBroadcast}
                disabled={isBroadcasting || parsedRecipients.length === 0 || !message.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? 'Broadcasting...' : 'Launch Broadcast Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
