import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Clock,
  Play,
  CheckCircle2,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Send,
  Trash2,
  Layers
} from 'lucide-react';
import { DripSequence, DripStep } from '../../types/dashboard';

interface DripSequencesViewProps {
  sequences: DripSequence[];
  onToggleSequence: (id: string) => void;
  onAddSequence: (seq: Omit<DripSequence, 'id' | 'enrolledCount' | 'completedCount'>) => void;
  onTestStepSend: (step: DripStep) => void;
}

export const DripSequencesView: React.FC<DripSequencesViewProps> = ({
  sequences,
  onToggleSequence,
  onAddSequence,
  onTestStepSend,
}) => {
  const [selectedSeqId, setSelectedSeqId] = useState<string>(sequences[0]?.id || '');
  const [showModal, setShowModal] = useState(false);
  const [seqName, setSeqName] = useState('');
  const [seqDesc, setSeqDesc] = useState('');
  const [triggerEvent, setTriggerEvent] = useState<DripSequence['triggerEvent']>('on_contact_added');

  const selectedSequence = sequences.find((s) => s.id === selectedSeqId) || sequences[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seqName.trim()) return;

    onAddSequence({
      name: seqName,
      description: seqDesc || 'Automated multi-step WhatsApp sequence',
      triggerEvent,
      isActive: true,
      steps: [
        {
          id: 'step_' + Date.now(),
          stepNumber: 1,
          delayHours: 0,
          title: 'Immediate Welcome Message',
          message: '👋 Welcome! We are excited to connect with you on WhatsApp.',
        },
        {
          id: 'step_' + (Date.now() + 1),
          stepNumber: 2,
          delayHours: 24,
          title: 'Day 1 Value & Check-in',
          message: '🌟 Hope your day is going great! Here is a helpful tip from our team.',
        },
      ],
    });

    setSeqName('');
    setSeqDesc('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            Automated Drip Sequences & Multi-Day Nurturing
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliver scheduled message funnels over days/weeks automatically when a customer signs up or places an order.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Drip Sequence</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sequence Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {sequences.map((seq) => {
            const isSelected = seq.id === selectedSequence?.id;
            return (
              <div
                key={seq.id}
                onClick={() => setSelectedSeqId(seq.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs ring-1 ring-emerald-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {seq.name}
                  </h4>
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="relative inline-flex items-center cursor-pointer shrink-0"
                  >
                    <input
                      type="checkbox"
                      checked={seq.isActive}
                      onChange={() => onToggleSequence(seq.id)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {seq.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span>{seq.steps.length} Steps in Funnel</span>
                  <span className="font-bold text-emerald-700">{seq.enrolledCount} Enrolled</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Visual Drip Steps Timeline (8 cols) */}
        {selectedSequence && (
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Trigger: {selectedSequence.triggerEvent.replace(/_/g, ' ')}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  {selectedSequence.name}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {selectedSequence.completedCount} / {selectedSequence.enrolledCount}
                </span>
                <span className="text-[10px] text-slate-400 block">Completed Funnel</span>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
              {selectedSequence.steps.map((step, idx) => (
                <div key={step.id} className="relative pl-10">
                  {/* Step circle beacon */}
                  <div className="absolute left-2 top-3 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-emerald-200 transition space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{step.title}</span>
                        <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {step.delayHours === 0 ? 'Immediately on trigger' : `+${step.delayHours} Hours after trigger`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onTestStepSend(step)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Test Step</span>
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans shadow-2xs">
                      {step.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Sequence Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-1">Create New Drip Sequence</h4>
            <p className="text-xs text-slate-500 mb-4">Set sequence trigger and funnel behavior.</p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Sequence Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Day VIP Client Welcome Flow"
                  value={seqName}
                  onChange={(e) => setSeqName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Automatically sends welcome and coupon after signup"
                  value={seqDesc}
                  onChange={(e) => setSeqDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Trigger Event</label>
                <select
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                >
                  <option value="on_contact_added">When new contact is added to audience</option>
                  <option value="on_lead_signup">When inbound lead sends first message</option>
                  <option value="on_order_completed">When customer places an order</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  Create Funnel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
