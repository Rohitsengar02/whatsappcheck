import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Play,
  Trash2,
  Repeat,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Smartphone,
  ChevronRight,
  Send
} from 'lucide-react';
import { ContactItem, ScheduledMessageItem } from '../../types/dashboard';

interface ScheduledViewProps {
  scheduledList: ScheduledMessageItem[];
  onAddScheduled: (item: Omit<ScheduledMessageItem, 'id' | 'createdAt' | 'status'>) => void;
  onCancelScheduled: (id: string) => void;
  onTriggerNow: (item: ScheduledMessageItem) => void;
  contacts: ContactItem[];
}

export const ScheduledView: React.FC<ScheduledViewProps> = ({
  scheduledList,
  onAddScheduled,
  onCancelScheduled,
  onTriggerNow,
  contacts,
}) => {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [repeatRule, setRepeatRule] = useState<'none' | 'daily' | 'weekly' | 'hourly'>('none');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone || !message.trim() || !scheduledDateTime) return;

    onAddScheduled({
      recipientPhone,
      recipientName: recipientName || 'Customer',
      message,
      scheduledTime: new Date(scheduledDateTime).toISOString(),
      repeatRule,
    });

    setMessage('');
    setRecipientPhone('');
    setRecipientName('');
    setScheduledDateTime('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Scheduled Messages & Recurring Loops
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Queue messages to dispatch at a specific future date and time, or set automated daily/weekly reminder loops.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Hide Creator' : 'Schedule New Message'}</span>
        </button>
      </div>

      {/* New Scheduled Message Creator Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Create Scheduled Dispatch
            </h4>
            <span className="text-xs text-emerald-600 font-semibold">Step-by-step scheduler</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Recipient WhatsApp Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Recipient Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Schedule Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Recurring Loop Option
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'none', label: 'One-Time Only' },
                { id: 'daily', label: 'Daily Loop (Every 24h)' },
                { id: 'weekly', label: 'Weekly Loop' },
                { id: 'hourly', label: 'Hourly Loop' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRepeatRule(item.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    repeatRule === item.id
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Scheduled Message Content
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Hi there! Friendly reminder for your upcoming appointment today at 4 PM..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
            >
              Add to Schedule Queue
            </button>
          </div>
        </form>
      )}

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">
            Active Scheduled Queue ({scheduledList.filter((s) => s.status === 'pending').length} Pending)
          </h4>
          <span className="text-xs text-slate-400">Auto-triggers on schedule</span>
        </div>

        {scheduledList.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-600" />
            <p className="text-xs font-semibold text-slate-600">No scheduled messages queued</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;Schedule New Message&quot; above to create reminders.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {scheduledList.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{item.recipientName}</span>
                    <span className="text-xs font-mono text-slate-500">({item.recipientPhone})</span>
                    {item.repeatRule !== 'none' && (
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Repeat className="w-2.5 h-2.5" /> {item.repeatRule.toUpperCase()} LOOP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">&quot;{item.message}&quot;</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{new Date(item.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Status: <strong className="text-emerald-600 uppercase font-bold">{item.status}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onTriggerNow(item)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-semibold transition"
                      title="Test send immediately"
                    >
                      Trigger Now
                    </button>
                    <button
                      onClick={() => onCancelScheduled(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Cancel schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
