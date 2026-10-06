import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  Check,
  Search,
  Sliders,
  Shuffle
} from 'lucide-react';
import { PRESET_TEMPLATES } from '../data/templates';
import { MessageTemplate } from '../types/whatsapp';

interface TemplatePickerProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (template: MessageTemplate, resolvedText: string, resolvedCaption?: string) => void;
  variableValues: Record<string, string>;
  onVariableChange: (key: string, value: string) => void;
  onRandomizeVariables: () => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  variableValues,
  onVariableChange,
  onRandomizeVariables,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'orders', label: 'BiteChez Orders' },
    { id: 'documents', label: 'Invoices & PDF' },
    { id: 'marketing', label: 'Food Promos & Media' },
    { id: 'verification', label: 'OTP & 2FA' },
    { id: 'support', label: 'Support & Greeting' },
  ];

  const filteredTemplates = PRESET_TEMPLATES.filter((tpl) => {
    const matchesCat = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedTemplate = PRESET_TEMPLATES.find((t) => t.id === selectedTemplateId) || PRESET_TEMPLATES[0];

  const resolveTemplateVariables = (tpl: MessageTemplate, values: Record<string, string>) => {
    let text = tpl.text;
    let caption = tpl.caption || '';

    tpl.variables.forEach((v) => {
      const val = values[v.key] ?? v.defaultValue;
      const regex = new RegExp(`{{${v.key}}}`, 'g');
      text = text.replace(regex, val);
      caption = caption.replace(regex, val);
    });

    return { text, caption };
  };

  const handleCardClick = (tpl: MessageTemplate) => {
    const resolved = resolveTemplateVariables(tpl, variableValues);
    onSelectTemplate(tpl, resolved.text, resolved.caption);
  };

  const getTypeIcon = (tpl: MessageTemplate) => {
    if (tpl.type === 'text') return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    if (tpl.mediaType === 'document') return <FileSpreadsheet className="w-3.5 h-3.5 text-rose-400" />;
    if (tpl.mediaType === 'video') return <Video className="w-3.5 h-3.5 text-purple-400" />;
    return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Preset Message Templates</h3>
            <p className="text-xs text-zinc-400">Pre-built WhatsApp payloads for orders, invoices, and promos</p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
              activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredTemplates.map((tpl) => {
          const isSelected = tpl.id === selectedTemplateId;
          return (
            <div
              key={tpl.id}
              onClick={() => handleCardClick(tpl)}
              className={`text-left p-3 rounded-xl border transition cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40'
                  : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getTypeIcon(tpl)}
                    <span className="text-[11px] font-semibold text-zinc-300 group-hover:text-white truncate">
                      {tpl.title}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                    {tpl.type === 'media' ? tpl.mediaType : 'text'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-2 pt-1 border-t border-emerald-800/40 flex items-center justify-between text-[10px] text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active Template
                  </span>
                  <span>{tpl.variables.length} variables</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic Template Variables Editor (if selected template has variables) */}
      {selectedTemplate && selectedTemplate.variables.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 bg-zinc-950/60 -mx-5 -mb-5 p-5 rounded-b-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white">
                Customize Template Variables for &quot;{selectedTemplate.title}&quot;
              </span>
            </div>
            <button
              type="button"
              onClick={onRandomizeVariables}
              className="text-xs text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition"
              title="Generate fresh test values (Order ID, OTP, names)"
            >
              <Shuffle className="w-3 h-3" />
              <span>Randomize Data</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {selectedTemplate.variables.map((variable) => (
              <div key={variable.key} className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                  <span>{variable.label}</span>
                  <code className="text-[10px] text-zinc-500 font-mono">&#123;&#123;{variable.key}&#125;&#125;</code>
                </label>
                <input
                  type="text"
                  value={variableValues[variable.key] ?? variable.defaultValue}
                  onChange={(e) => onVariableChange(variable.key, e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
