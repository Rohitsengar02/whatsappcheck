import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Copy,
  Check,
  Send,
  Globe,
  RotateCcw,
  Zap,
  ArrowRight,
  Smile,
  Flame,
  CreditCard,
  Gift,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { AiPromptTemplate, ContactItem } from '../../types/dashboard';
import { INITIAL_AI_PROMPTS } from '../../data/mockData';

interface AiCopilotViewProps {
  onLoadIntoSender: (message: string) => void;
  onSendDirect: (phone: string, message: string) => void;
  contacts: ContactItem[];
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({
  onLoadIntoSender,
  onSendDirect,
  contacts,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<AiPromptTemplate>(INITIAL_AI_PROMPTS[0]);
  const [inputText, setInputText] = useState(INITIAL_AI_PROMPTS[0].sampleInput);
  const [tone, setTone] = useState<'sales' | 'friendly' | 'urgent' | 'corporate' | 'hinglish'>('sales');
  const [language, setLanguage] = useState<'english' | 'hinglish' | 'hindi' | 'spanish' | 'arabic'>('english');
  const [useSpintax, setUseSpintax] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState(INITIAL_AI_PROMPTS[0].generatedSample);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetPhone, setTargetPhone] = useState(contacts[0]?.phone || '+919761304821');

  const handleSelectTemplate = (tpl: AiPromptTemplate) => {
    setSelectedTemplate(tpl);
    setInputText(tpl.sampleInput);
    setGeneratedOutput(tpl.generatedSample);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let result = '';
      const clean = inputText.trim() || 'Exciting update for all customers!';

      if (tone === 'urgent') {
        result = `⚡ *URGENT UPDATE / LIMITED TIME ONLY* ⚡\n\n${clean}\n\n⏳ *Offer expiring in less than 4 hours!*\nOnly a few slots left.\n\n👉 *Reply "CLAIM" right now to lock your spot!*`;
      } else if (tone === 'hinglish') {
        result = `नमस्ते! 🌟 आपके लिए एक special update:\n\n${clean}\n\n🔥 *Best prices aur fastest delivery guaranteed!*\n\nAur koi jankari chahiye toh direct reply karein ya call karein. Have a great day! 🙏`;
      } else if (tone === 'corporate') {
        result = `Dear Valued Partner,\n\nWe trust this message finds you well.\n\n${clean}\n\nPlease let us know if you require a formal quotation or documentation.\n\nBest regards,\n*Sengar Business Operations*`;
      } else if (tone === 'friendly') {
        result = `Hey there! 😊 Hope you are having an awesome day.\n\nJust wanted to share a quick update:\n${clean}\n\nLet us know if you have any questions! Chat soon. 💬`;
      } else {
        // default sales
        result = `✨ *Exclusive Announcement from Sengar Hub!* ✨\n\n${clean}\n\n⭐ *Key Benefits*:\n• Premium 100% Quality Assurance\n• Express Priority Dispatch\n• Dedicated WhatsApp Support\n\n📲 *Reply "YES" to grab this before stock runs out!*`;
      }

      if (useSpintax) {
        result = `{Hello|Hi|Greetings} {valued customer|friend|there}! 🌟\n\n` + result;
      }

      if (language === 'hindi') {
        result = `नमस्ते! 🙏\n\n${result}\n\nअधिक जानकारी के लिए कृपया रिप्लाई करें।`;
      }

      setGeneratedOutput(result);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">AI WhatsApp Copilot & Anti-Ban Humanizer</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Generate high-converting sales pitches, festive wishes, and anti-ban Spintax messages tailored for WhatsApp algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Anti-Ban Humanizer Active</span>
          </span>
        </div>
      </div>

      {/* Preset Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {INITIAL_AI_PROMPTS.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => handleSelectTemplate(tpl)}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
              selectedTemplate.id === tpl.id
                ? 'bg-purple-50/50 border-purple-400 shadow-xs ring-1 ring-purple-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-1">
                {tpl.category}
              </div>
              <h4 className="font-bold text-slate-900 text-xs leading-snug">{tpl.title}</h4>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{tpl.description}</p>
          </button>
        ))}
      </div>

      {/* Main Studio Editor: Input + Live Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prompt Input & Tone Controls (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-purple-600" />
              <span>Prompt & Raw Idea Input</span>
            </h3>
            <span className="text-xs text-purple-600 font-semibold">{selectedTemplate.category}</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              What do you want to announce or communicate?
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Announce a 20% discount on all pizza and burger orders this weekend for loyalty members..."
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500 focus:bg-white"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Voice & Tone:</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'sales', label: '🔥 Sales / FOMO' },
                { id: 'friendly', label: '😊 Warm & Casual' },
                { id: 'urgent', label: '⚡ Urgent 24h' },
                { id: 'corporate', label: '👔 Executive VIP' },
                { id: 'hinglish', label: '🇮🇳 Hinglish Blend' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as any)}
                  className={`px-2 py-2 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                    tone === t.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Anti-Ban & Language Toggles */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Spintax Anti-Ban Syntax</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Rotates phrases like <code className="text-purple-600 font-mono">{"{Hi|Hello|Hey}"}</code> to prevent broadcast filtering.
                </div>
              </div>
              <input
                type="checkbox"
                checked={useSpintax}
                onChange={(e) => setUseSpintax(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Language Adapter:</span>
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-purple-500 cursor-pointer"
              >
                <option value="english">English (Global)</option>
                <option value="hinglish">Hinglish (India E-com)</option>
                <option value="hindi">Hindi (हिंदी)</option>
                <option value="spanish">Spanish (Español)</option>
                <option value="arabic">Arabic (العربية)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Polishing Message with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Optimized WhatsApp Message</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Preview & Direct Send (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-slate-900 text-sm">WhatsApp Output Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Formatted Message Bubble Preview */}
            <div className="mt-4 p-5 bg-[#EFEAE2] rounded-2xl border border-slate-300/60 shadow-inner relative font-sans">
              <div className="bg-white rounded-2xl rounded-tr-xs p-4 shadow-xs text-xs text-slate-800 whitespace-pre-line leading-relaxed max-w-lg">
                {generatedOutput}
                <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1">
                  <span>10:48 AM</span>
                  <span className="text-blue-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onLoadIntoSender(generatedOutput)}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Load in Direct Sender</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSendDirect(targetPhone, generatedOutput)}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send to {targetPhone}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Target Phone:</span>
              <input
                type="text"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="+919761304821"
                className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
