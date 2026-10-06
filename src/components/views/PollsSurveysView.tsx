import React, { useState } from 'react';
import {
  Vote,
  Plus,
  Send,
  BarChart2,
  CheckCircle2,
  Users,
  Check,
  Smartphone,
  Trash2
} from 'lucide-react';
import { WhatsAppPoll, ContactItem } from '../../types/dashboard';

interface PollsSurveysViewProps {
  polls: WhatsAppPoll[];
  contacts: ContactItem[];
  onSendPoll: (poll: WhatsAppPoll, recipientPhone: string) => void;
  onAddPoll: (poll: Omit<WhatsAppPoll, 'id' | 'totalVotes' | 'createdAt' | 'status'>) => void;
  onSimulateVote: (pollId: string, optionId: string) => void;
}

export const PollsSurveysView: React.FC<PollsSurveysViewProps> = ({
  polls,
  contacts,
  onSendPoll,
  onAddPoll,
  onSimulateVote,
}) => {
  const [selectedPoll, setSelectedPoll] = useState<WhatsAppPoll | null>(null);
  const [targetPhone, setTargetPhone] = useState(contacts[0]?.phone || '');

  // Add Poll Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !option1.trim() || !option2.trim()) return;

    const options = [
      { id: 'opt_' + Date.now() + '_1', text: option1, votes: 0 },
      { id: 'opt_' + Date.now() + '_2', text: option2, votes: 0 },
    ];
    if (option3.trim()) options.push({ id: 'opt_' + Date.now() + '_3', text: option3, votes: 0 });
    if (option4.trim()) options.push({ id: 'opt_' + Date.now() + '_4', text: option4, votes: 0 });

    onAddPoll({
      question,
      options,
      isMultipleChoice: false,
    });

    setQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setShowAddModal(false);
  };

  const handleDispatchPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoll || !targetPhone.trim()) return;

    onSendPoll(selectedPoll, targetPhone);
    setSelectedPoll(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Vote className="w-5 h-5 text-emerald-600" />
            Interactive WhatsApp Polls & Surveys
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Collect real-time customer feedback, NPS scores, and product votes directly inside WhatsApp conversations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Poll</span>
        </button>
      </div>

      {/* Poll Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {poll.status === 'active' ? 'Live Poll' : 'Closed'}
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {poll.totalVotes} Total Votes
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-4">{poll.question}</h4>

              {/* Options & Progress Bars */}
              <div className="space-y-3">
                {poll.options.map((opt) => {
                  const percent = poll.totalVotes > 0
                    ? Math.round((opt.votes / poll.totalVotes) * 100)
                    : 0;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => onSimulateVote(poll.id, opt.id)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition cursor-pointer group"
                      title="Click to simulate cast vote"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition">
                          {opt.text}
                        </span>
                        <span className="font-mono font-bold text-slate-600">
                          {opt.votes} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Click any option to test vote</span>
              <button
                type="button"
                onClick={() => setSelectedPoll(poll)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Poll to Contact</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Poll Modal */}
      {selectedPoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Send Poll to WhatsApp
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Recipients will receive interactive native vote buttons.
            </p>

            <form onSubmit={handleDispatchPoll} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Recipient WhatsApp Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1 font-sans">
                <span className="font-bold text-[10px] text-slate-400 uppercase block">Poll Payload:</span>
                <p className="font-bold">{selectedPoll.question}</p>
                {selectedPoll.options.map((o, idx) => (
                  <div key={o.id} className="text-slate-600">
                    {idx + 1}. {o.text}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPoll(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Poll</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Poll Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-1">Create Interactive Poll</h4>
            <p className="text-xs text-slate-500 mb-4">Enter question and voting options.</p>

            <form onSubmit={handleCreatePoll} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Poll Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How satisfied are you with our service?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Option 1</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ⭐⭐⭐⭐⭐ Excellent"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Option 2</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ⭐⭐⭐ Good"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Option 3 (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ⭐ Needs Work"
                  value={option3}
                  onChange={(e) => setOption3(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Option 4 (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Other"
                  value={option4}
                  onChange={(e) => setOption4(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
