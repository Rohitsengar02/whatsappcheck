import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Send,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Check,
  Sparkles
} from 'lucide-react';
import { SupportTicketItem } from '../../types/dashboard';
import { INITIAL_SUPPORT_TICKETS } from '../../data/mockData';

interface SupportTicketsViewProps {
  onReplyOnWhatsApp: (phone: string, text: string) => void;
}

export const SupportTicketsView: React.FC<SupportTicketsViewProps> = ({ onReplyOnWhatsApp }) => {
  const [tickets, setTickets] = useState<SupportTicketItem[]>(INITIAL_SUPPORT_TICKETS);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Waiting on Customer' | 'Resolved'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Urgent' | 'High' | 'Medium' | 'Low'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);

  // Quick Reply modal
  const [replyText, setReplyText] = useState('');

  const handleUpdateStatus = (id: string, newStatus: SupportTicketItem['status']) => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleSendTicketReply = () => {
    if (!selectedTicket || !replyText.trim()) return;
    const fullMsg = `Hi ${selectedTicket.customerName},\n\nRegarding ticket *[${selectedTicket.ticketNumber}]* (${selectedTicket.subject}):\n\n${replyText}\n\n— *Sengar Support Desk*`;
    onReplyOnWhatsApp(selectedTicket.customerPhone, fullMsg);
    handleUpdateStatus(selectedTicket.id, 'Resolved');
    setSelectedTicket(null);
    setReplyText('');
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.ticketNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.customerPhone.includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityBadge = (p: SupportTicketItem['priority']) => {
    switch (p) {
      case 'Urgent':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Urgent SLA</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">High</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">Medium</span>;
      case 'Low':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">Low</span>;
    }
  };

  const getStatusBadge = (s: SupportTicketItem['status']) => {
    switch (s) {
      case 'Open':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Open</span>;
      case 'In Progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">In Progress</span>;
      case 'Waiting on Customer':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Waiting on Lead</span>;
      case 'Resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved ✓</span>;
    }
  };

  const openTicketsCount = tickets.filter((t) => t.status !== 'Resolved').length;
  const urgentCount = tickets.filter((t) => t.priority === 'Urgent' && t.status !== 'Resolved').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Support Tickets & SLA Escalation Desk</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Track customer inquiries, enforce response SLA timers, assign agent responsibilities, and resolve queries directly over WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <span className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{urgentCount} Urgent SLA Pending</span>
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Tickets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{openTicketsCount}</div>
          <div className="text-xs text-amber-600 font-medium mt-1">Needs team action</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Urgent Priority</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{urgentCount}</div>
          <div className="text-xs text-rose-500 mt-1">&lt; 30 min SLA window</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved Today</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {tickets.filter((t) => t.status === 'Resolved').length}
          </div>
          <div className="text-xs text-emerald-600 mt-1">100% CSAT feedback</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Response Time</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">3.4 mins</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Direct WhatsApp speed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Open', 'In Progress', 'Waiting on Customer', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, phone, ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-rose-500"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Subject & Snippet</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {tkt.ticketNumber}
                    <div className="text-[10px] text-slate-400 font-sans font-normal">{tkt.createdAt}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{tkt.customerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{tkt.customerPhone}</div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{tkt.subject}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{tkt.lastMessageSnippet}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {getPriorityBadge(tkt.priority)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(tkt.status)}
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{tkt.slaDue}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {tkt.assignedAgent.charAt(0)}
                      </div>
                      <span>{tkt.assignedAgent}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedTicket(tkt);
                          setReplyText(`Hi ${tkt.customerName}, regarding your inquiry: we have updated this for you.`);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Reply on WhatsApp</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No support tickets found matching your filter.
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Reply & Resolve Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Resolve Ticket: {selectedTicket.ticketNumber}
                </h3>
                <div className="text-xs text-slate-500">
                  Recipient: {selectedTicket.customerName} ({selectedTicket.customerPhone})
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">Subject: {selectedTicket.subject}</div>
                <div className="text-slate-500 italic">"{selectedTicket.lastMessageSnippet}"</div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  WhatsApp Resolution Reply
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your resolution response..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1.5">
                  {(['Open', 'In Progress', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedTicket.id, st)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border cursor-pointer ${
                        selectedTicket.status === st
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendTicketReply}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send & Resolve</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
