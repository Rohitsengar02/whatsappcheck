import React, { useState } from 'react';
import {
  Menu,
  MousePointerClick,
  Plus,
  Send,
  Trash2,
  ExternalLink,
  Phone,
  CheckCircle2,
  Smartphone,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { ContactItem, InteractiveButtonItem, InteractiveMessagePreset, WhatsAppConfig } from '../../types/dashboard';
import { INITIAL_INTERACTIVE_PRESETS } from '../../data/mockData';

interface InteractiveButtonsViewProps {
  config: WhatsAppConfig;
  contacts: ContactItem[];
  onSendToPhone: (phone: string, text: string) => void;
}

export const InteractiveButtonsView: React.FC<InteractiveButtonsViewProps> = ({
  config,
  contacts,
  onSendToPhone,
}) => {
  const [presets, setPresets] = useState<InteractiveMessagePreset[]>(INITIAL_INTERACTIVE_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<InteractiveMessagePreset>(INITIAL_INTERACTIVE_PRESETS[0]);
  const [targetPhone, setTargetPhone] = useState(contacts[0]?.phone || config.connectedNumber || '+919761304821');

  // Custom Builder State
  const [bodyText, setBodyText] = useState(selectedPreset.bodyText);
  const [footerText, setFooterText] = useState(selectedPreset.footerText || '');
  const [buttons, setButtons] = useState<InteractiveButtonItem[]>(selectedPreset.buttons || []);

  // Simulator Click State
  const [lastClickedButton, setLastClickedButton] = useState<string | null>(null);
  const [showListMenuPopup, setShowListMenuPopup] = useState(false);

  const handleSelectPreset = (preset: InteractiveMessagePreset) => {
    setSelectedPreset(preset);
    setBodyText(preset.bodyText);
    setFooterText(preset.footerText || '');
    setButtons(preset.buttons || []);
    setLastClickedButton(null);
    setShowListMenuPopup(false);
  };

  const handleAddButton = () => {
    if (buttons.length >= 3) return; // WhatsApp allows max 3 quick action buttons per message
    const newBtn: InteractiveButtonItem = {
      id: 'btn_' + Date.now(),
      type: 'reply',
      label: 'Quick Option ' + (buttons.length + 1),
      payloadOrUrl: 'ACTION_' + (buttons.length + 1),
    };
    setButtons([...buttons, newBtn]);
  };

  const handleRemoveButton = (id: string) => {
    setButtons(buttons.filter((b) => b.id !== id));
  };

  const handleUpdateButton = (id: string, field: keyof InteractiveButtonItem, value: any) => {
    setButtons(
      buttons.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSendLive = () => {
    // Generate text representation with action prompts for live delivery
    let fullMsg = `${bodyText}\n\n`;
    if (buttons.length > 0) {
      fullMsg += `*Quick Reply Options:*\n` + buttons.map((b, i) => `${i + 1}️⃣ [${b.label}]`).join('\n') + `\n\n`;
    }
    if (footerText) {
      fullMsg += `_${footerText}_`;
    }
    onSendToPhone(targetPhone, fullMsg);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <MousePointerClick className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Interactive Buttons & List Menus</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Build high-converting WhatsApp CTA buttons, website clickouts, phone call triggers, and interactive sectioned list menus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
            WhatsApp Interactive Protocol v2
          </span>
        </div>
      </div>

      {/* Preset Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              selectedPreset.id === p.id
                ? 'bg-blue-50/50 border-blue-400 shadow-xs ring-1 ring-blue-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">{p.category}</div>
              <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
            </div>
            <div className="text-xs text-slate-500 mt-2 truncate">{p.bodyText}</div>
          </button>
        ))}
      </div>

      {/* Main Grid: Interactive Builder + Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Interactive Message Composer</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Max 3 Buttons</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Message Body Content</label>
            <textarea
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter main message description..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Footer Caption (Optional)</label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="e.g. Powered by BiteChez Hub"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-blue-500"
            />
          </div>

          {/* Buttons Config */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">Call-to-Action Buttons ({buttons.length}/3)</label>
              {buttons.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddButton}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Button</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {buttons.map((btn, index) => (
                <div
                  key={btn.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2 sm:items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <select
                      value={btn.type}
                      onChange={(e) => handleUpdateButton(btn.id, 'type', e.target.value)}
                      className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-blue-500"
                    >
                      <option value="reply">Quick Reply</option>
                      <option value="url">URL Link</option>
                      <option value="call">Call Phone</option>
                    </select>

                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => handleUpdateButton(btn.id, 'label', e.target.value)}
                      placeholder="Button text"
                      className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-blue-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={btn.payloadOrUrl}
                      onChange={(e) => handleUpdateButton(btn.id, 'payloadOrUrl', e.target.value)}
                      placeholder={btn.type === 'url' ? 'https://...' : btn.type === 'call' ? '+91...' : 'PAYLOAD_KEY'}
                      className="w-36 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-blue-500 font-mono text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveButton(btn.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {buttons.length === 0 && (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No interactive buttons configured yet. Click "Add Button" above.
                </div>
              )}
            </div>
          </div>

          {/* Sectioned List Menu Notice */}
          {selectedPreset.menuSections && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Menu className="w-4 h-4 text-blue-700" />
                <span>Sectioned List Menu Included</span>
              </div>
              <p className="text-blue-700 text-[11px]">
                This preset features a native WhatsApp List Menu with {selectedPreset.menuSections.reduce((a, s) => a + s.rows.length, 0)} selectable catalog choices. Tap "View Menu" in the phone simulation to preview.
              </p>
            </div>
          )}

          {/* Direct Send Controls */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 shrink-0">Recipient:</span>
              <input
                type="text"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="+919761304821"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <button
              onClick={handleSendLive}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send Interactive Message</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Phone Mockup with Clickable Buttons (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Interactive Tap Simulator</span>
              </h4>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                Click buttons below
              </span>
            </div>

            {/* Realistic Phone Bubble */}
            <div className="bg-[#E5DDD5] p-4 rounded-2xl border border-slate-300 shadow-inner font-sans space-y-2">
              <div className="bg-white rounded-2xl rounded-tr-xs shadow-xs overflow-hidden max-w-[95%]">
                {/* Body Text */}
                <div className="p-3.5 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                  {bodyText}
                </div>

                {/* Footer Text */}
                {footerText && (
                  <div className="px-3.5 pb-2 text-[10px] text-slate-400">
                    {footerText}
                  </div>
                )}

                {/* Time & Double Tick */}
                <div className="px-3.5 pb-2 text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                  <span>10:55 AM</span>
                  <span className="text-blue-500 font-bold">✓✓</span>
                </div>

                {/* Interactive Action Buttons */}
                {buttons.length > 0 && (
                  <div className="border-t border-slate-200 divide-y divide-slate-100 bg-white">
                    {buttons.map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setLastClickedButton(`Button Tapped: "${btn.label}" (${btn.type})`)}
                        className="w-full py-2.5 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {btn.type === 'url' ? (
                          <ExternalLink className="w-3.5 h-3.5" />
                        ) : btn.type === 'call' ? (
                          <Phone className="w-3.5 h-3.5" />
                        ) : (
                          <MousePointerClick className="w-3.5 h-3.5" />
                        )}
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* List Menu Trigger Button */}
                {selectedPreset.menuSections && (
                  <div className="border-t border-slate-200 bg-white">
                    <button
                      onClick={() => setShowListMenuPopup(!showListMenuPopup)}
                      className="w-full py-2.5 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Menu className="w-3.5 h-3.5" />
                      <span>☰ View Menu Options</span>
                    </button>
                  </div>
                )}
              </div>

              {/* List Menu Popup Overlay */}
              {showListMenuPopup && selectedPreset.menuSections && (
                <div className="bg-white rounded-2xl p-3 shadow-lg border border-slate-200 animate-slide-up space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="font-bold text-slate-800">Choose Option</span>
                    <button
                      onClick={() => setShowListMenuPopup(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  {selectedPreset.menuSections.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sec.title}</div>
                      {sec.rows.map((row) => (
                        <button
                          key={row.id}
                          onClick={() => {
                            setLastClickedButton(`Menu Selected: "${row.title}"`);
                            setShowListMenuPopup(false);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200 cursor-pointer"
                        >
                          <div className="font-semibold text-slate-900 text-xs">{row.title}</div>
                          {row.description && <div className="text-[10px] text-slate-500">{row.description}</div>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Click Event Feedback */}
            {lastClickedButton && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lastClickedButton}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
