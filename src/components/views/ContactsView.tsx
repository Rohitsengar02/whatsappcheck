import React, { useState } from 'react';
import {
  Users,
  Plus,
  Send,
  Trash2,
  Search,
  Tag,
  Phone,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ContactItem } from '../../types/dashboard';

interface ContactsViewProps {
  contacts: ContactItem[];
  onAddContact: (contact: Omit<ContactItem, 'id'>) => void;
  onDeleteContact: (id: string) => void;
  onMessageContact: (contact: ContactItem) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onMessageContact,
}) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tag, setTag] = useState<ContactItem['tag']>('Customer');

  const filtered = contacts.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.tag.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onAddContact({
      name,
      phone,
      tag,
      lastContactedAt: 'Just now',
    });

    setName('');
    setPhone('');
    setTag('Customer');
    setShowModal(false);
  };

  const getTagBadge = (t: ContactItem['tag']) => {
    switch (t) {
      case 'VIP':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Lead':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Customer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending Followup':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Contacts & Audience Manager
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer directories, VIP lists, and click to message any contact directly.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Contact Name</th>
                <th className="py-3 px-4">WhatsApp Phone</th>
                <th className="py-3 px-4">Segment Tag</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                    {c.phone}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTagBadge(
                        c.tag
                      )}`}
                    >
                      {c.tag}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {c.lastContactedAt || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onMessageContact(c)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1 active:scale-95"
                      >
                        <Send className="w-3 h-3" />
                        <span>Message</span>
                      </button>
                      <button
                        onClick={() => onDeleteContact(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-1">Add New Contact</h4>
            <p className="text-xs text-slate-500 mb-4">Enter customer name and WhatsApp number.</p>

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  WhatsApp Phone (with Country Code)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Segment Tag</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                >
                  <option value="Customer">Customer</option>
                  <option value="VIP">VIP</option>
                  <option value="Lead">Lead</option>
                  <option value="Pending Followup">Pending Followup</option>
                  <option value="Team">Team</option>
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
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
