import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  Phone,
  MoreVertical,
  Paperclip,
  Smile,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { InboxConversation, ChatMessage } from '../../types/dashboard';

interface LiveInboxViewProps {
  conversations: InboxConversation[];
  onSendMessageReply: (conversationId: string, replyText: string) => void;
}

export const LiveInboxView: React.FC<LiveInboxViewProps> = ({
  conversations,
  onSendMessageReply,
}) => {
  const [selectedConvoId, setSelectedConvoId] = useState<string>(conversations[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');

  const activeConvo = conversations.find((c) => c.id === selectedConvoId) || conversations[0];

  const filtered = conversations.filter((c) => {
    return (
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConvo) return;

    onSendMessageReply(activeConvo.id, replyText);
    setReplyText('');
  };

  const applyCannedReply = (text: string) => {
    setReplyText(text);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[680px]">
      {/* Left Chat Threads List (320px) */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col justify-between shrink-0 bg-slate-50/50">
        <div>
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Live Customer Chats
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {conversations.length} Active
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[560px]">
            {filtered.map((convo) => {
              const isSelected = convo.id === activeConvo?.id;
              const lastMsg = convo.messages[convo.messages.length - 1];

              return (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConvoId(convo.id)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                    isSelected ? 'bg-white shadow-2xs border-l-4 border-emerald-600' : 'hover:bg-white/80'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full ${convo.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    {convo.contactName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {convo.contactName}
                      </span>
                      <span className="text-[10px] text-slate-400">{convo.lastMessageTime}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate leading-relaxed">
                      {lastMsg?.text || 'No messages yet'}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60">
                        {convo.label}
                      </span>

                      {convo.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Chat Thread & Composer */}
      {activeConvo ? (
        <div className="flex-1 flex flex-col justify-between bg-slate-50">
          {/* Active Chat Header */}
          <div className="h-16 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full ${activeConvo.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs`}
              >
                {activeConvo.contactName.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{activeConvo.contactName}</h4>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded">
                    {activeConvo.phone}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active on WhatsApp
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span className="text-slate-500 text-[11px]">Label:</span>
              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {activeConvo.label}
              </span>
            </div>
          </div>

          {/* Chat Messages Timeline */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3">
            {activeConvo.messages.map((msg) => {
              const isMe = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 shadow-xs text-xs relative ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isMe ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canned Quick Replies bar */}
          <div className="px-4 py-2 bg-white/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Quick replies:
            </span>
            {[
              'Yes, order is confirmed and on the way! 🛵',
              'Thank you for contacting Sengar Hub!',
              'We have received your payment receipt. ✅',
              'Let me connect you with our specialist right away.',
            ].map((canned, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyCannedReply(canned)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition cursor-pointer border border-slate-200/80"
              >
                {canned}
              </button>
            ))}
          </div>

          {/* Bottom Composer */}
          <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your WhatsApp reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
          Select a customer chat thread on the left to start replying.
        </div>
      )}
    </div>
  );
};
