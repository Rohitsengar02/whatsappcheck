import React, { useState } from 'react';
import {
  RotateCcw,
  DollarSign,
  TrendingUp,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { AbandonedCartLead } from '../../types/dashboard';

interface CartRecoveryViewProps {
  leads: AbandonedCartLead[];
  onSendRecovery: (lead: AbandonedCartLead, couponCode: string) => void;
}

export const CartRecoveryView: React.FC<CartRecoveryViewProps> = ({
  leads,
  onSendRecovery,
}) => {
  const [selectedLead, setSelectedLead] = useState<AbandonedCartLead | null>(null);
  const [coupon, setCoupon] = useState('RECOVER15');
  const [autoRecoveryActive, setAutoRecoveryActive] = useState(true);

  const totalAbandonedValue = leads.reduce((acc, l) => acc + l.cartTotal, 0);
  const recoveredValue = leads
    .filter((l) => l.recoveryStatus === 'recovered')
    .reduce((acc, l) => acc + l.cartTotal, 0);

  const handleDispatchRecovery = () => {
    if (!selectedLead) return;
    onSendRecovery(selectedLead, coupon);
    setSelectedLead(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-emerald-600" />
            Abandoned Cart & Lost Sales Recovery
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Recover uncompleted checkout shoppers automatically via high-converting WhatsApp reminder nudges.
          </p>
        </div>

        {/* Auto Recovery Switch */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">Auto-Recovery Sequence</span>
            <span className="text-[10px] text-slate-400">Trigger nudges after 30 mins</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoRecoveryActive}
              onChange={() => setAutoRecoveryActive(!autoRecoveryActive)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* 3 Recovery KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Cart Abandonment Value</span>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            ${totalAbandonedValue.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{leads.length} shoppers checked out without paying</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Recovered Revenue via WhatsApp</span>
          <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">
            ${recoveredValue.toFixed(2)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Direct attribution</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Recovery Conversion Rate</span>
          <div className="text-2xl font-black text-purple-600 mt-2">
            38.5%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">5x higher conversion than email</span>
        </div>
      </div>

      {/* Shopper Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Abandoned Shoppers Queue</h4>
          <span className="text-xs text-slate-400">1-click WhatsApp nudge</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Shopper</th>
                <th className="py-3 px-4">Cart Contents</th>
                <th className="py-3 px-4">Cart Total</th>
                <th className="py-3 px-4">Abandoned At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{lead.customerName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{lead.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {lead.cartItems}
                  </td>
                  <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                    ${lead.cartTotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {lead.abandonedAt}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                        lead.recoveryStatus === 'recovered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : lead.recoveryStatus === 'reminded'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {lead.recoveryStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {lead.recoveryStatus !== 'recovered' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Recover Cart</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recover Cart Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Send Cart Recovery Nudge to {selectedLead.customerName}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Send a personalized WhatsApp message with an optional incentive coupon.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Incentive Coupon Code
                </label>
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Message Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed">
                <span className="font-bold text-[10px] text-slate-400 block mb-1 uppercase">Message:</span>
                🛒 Hi *{selectedLead.customerName}*! We noticed you left *{selectedLead.cartItems}* in your cart.<br />
                We saved your items! Use code *{coupon}* for an extra discount on checkout:<br />
                👉 https://shop.sengarhub.com/cart/resume
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchRecovery}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Recovery Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
