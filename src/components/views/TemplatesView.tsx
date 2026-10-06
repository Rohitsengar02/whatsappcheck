import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Check,
  Send,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Image as ImageIcon,
  Copy
} from 'lucide-react';
import { PRESET_TEMPLATES } from '../../data/templates';
import { MessageTemplate } from '../../types/whatsapp';

interface TemplatesViewProps {
  onUseTemplate: (template: MessageTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'orders', label: 'Orders & Receipts' },
    { id: 'marketing', label: 'Offers & Promos' },
    { id: 'verification', label: 'Security & OTP' },
    { id: 'support', label: 'Support & Greetings' },
  ];

  const filtered = PRESET_TEMPLATES.filter((tpl) => {
    const matchesCat = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Business WhatsApp Message Templates
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-approved formats for orders, promotional discounts, appointment reminders, and automated receipts.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {tpl.type === 'media' ? `${tpl.mediaType} template` : 'text template'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {tpl.variables.length} variables
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                {tpl.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {tpl.description}
              </p>

              {/* Message Body Preview */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {tpl.text || tpl.caption}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => copyText(tpl.text || tpl.caption || '', tpl.id)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === tpl.id ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => onUseTemplate(tpl)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Use in Sender</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
