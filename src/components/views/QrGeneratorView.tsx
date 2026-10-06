import React, { useState } from 'react';
import {
  QrCode,
  Link,
  Copy,
  Check,
  Download,
  ExternalLink,
  Smartphone,
  Sparkles,
  Palette,
  Code2,
  CheckCircle2,
  Eye,
  MessageSquare
} from 'lucide-react';
import { ClickToChatConfig, WhatsAppConfig } from '../../types/dashboard';
import { INITIAL_CLICK_TO_CHAT } from '../../data/mockData';

interface QrGeneratorViewProps {
  config: WhatsAppConfig;
}

export const QrGeneratorView: React.FC<QrGeneratorViewProps> = ({ config }) => {
  const [phone, setPhone] = useState(config.connectedNumber || INITIAL_CLICK_TO_CHAT.phone);
  const [prefilledMessage, setPrefilledMessage] = useState(INITIAL_CLICK_TO_CHAT.prefilledMessage);
  const [brandColor, setBrandColor] = useState('#25D366');
  const [showLogo, setShowLogo] = useState(true);
  const [widgetTitle, setWidgetTitle] = useState('Sengar WhatsApp Desk');
  const [widgetGreeting, setWidgetGreeting] = useState('Hi! How can we help you today?');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showWidgetPopup, setShowWidgetPopup] = useState(true);

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(prefilledMessage);
  const waLink = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  // Embeddable HTML/JS script
  const embedCode = `<!-- Sengar WhatsApp Floating Chat Widget -->
<script
  src="https://whatsappapi-1n7u.onrender.com/widget/whatsapp-chat.js"
  data-phone="${phone}"
  data-color="${brandColor}"
  data-title="${widgetTitle}"
  data-greeting="${widgetGreeting}"
  data-message="${prefilledMessage}">
</script>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(waLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">QR Code & Click-to-Chat Studio</h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Generate high-resolution WhatsApp QR codes, short direct links, and floating website chat widgets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy wa.me Link'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration Controls (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
            <Link className="w-4 h-4 text-emerald-600" />
            <span>Customize Link & QR Code</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Business Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+919761304821"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">Include country code (+91 for India, +1 for US, etc.)</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Default Pre-filled Message</label>
            <textarea
              rows={3}
              value={prefilledMessage}
              onChange={(e) => setPrefilledMessage(e.target.value)}
              placeholder="Hi! I am interested in your products and services..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">When customers scan the QR or tap the link, this text is pre-typed in their chat.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">QR Code & Widget Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span className="text-xs font-medium text-slate-700">Display WhatsApp Icon in Center</span>
              </label>
            </div>
          </div>

          {/* Quick Share Link Display */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Your Generated Click-to-Chat URL</span>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 break-all select-all">
              {waLink}
            </div>
          </div>

          {/* Embeddable Website Widget Box */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-600" />
                <span>Website Floating Widget Snippet</span>
              </h4>
              <button
                onClick={handleCopyCode}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
              >
                {copiedCode ? 'Copied to Clipboard!' : 'Copy Embed Code'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Paste this one-line script before the closing <code className="bg-slate-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag of your website.
            </p>
            <pre className="p-3 bg-slate-900 text-slate-200 text-[11px] font-mono rounded-xl overflow-x-auto leading-relaxed">
              {embedCode}
            </pre>
          </div>
        </div>

        {/* Right Column: Branded QR Code & Website Widget Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: High-Res Branded QR Code */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Branded QR Standee</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Ready to Print
              </span>
            </div>

            {/* Visual SVG QR Code Standee */}
            <div
              className="p-6 rounded-3xl border-2 shadow-md relative bg-white flex flex-col items-center"
              style={{ borderColor: brandColor }}
            >
              <div
                className="text-white text-xs font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-wider shadow-xs"
                style={{ backgroundColor: brandColor }}
              >
                Scan to Chat on WhatsApp
              </div>

              {/* Simulated Crisp QR Pattern */}
              <div className="relative p-3 bg-white rounded-2xl border border-slate-200 shadow-inner">
                <svg
                  className="w-48 h-48"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="white" />
                  {/* Position detection patterns */}
                  <rect x="10" y="10" width="50" height="50" fill={brandColor} rx="6" />
                  <rect x="20" y="20" width="30" height="30" fill="white" rx="4" />
                  <rect x="26" y="26" width="18" height="18" fill={brandColor} rx="2" />

                  <rect x="140" y="10" width="50" height="50" fill={brandColor} rx="6" />
                  <rect x="150" y="20" width="30" height="30" fill="white" rx="4" />
                  <rect x="156" y="26" width="18" height="18" fill={brandColor} rx="2" />

                  <rect x="10" y="140" width="50" height="50" fill={brandColor} rx="6" />
                  <rect x="20" y="150" width="30" height="30" fill="white" rx="4" />
                  <rect x="26" y="156" width="18" height="18" fill={brandColor} rx="2" />

                  {/* QR Data Grid simulated elements */}
                  <rect x="70" y="15" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="90" y="15" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="115" y="15" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="70" y="45" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="95" y="45" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="115" y="45" width="12" height="12" fill={brandColor} rx="2" />

                  <rect x="15" y="70" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="40" y="70" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="70" y="70" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="95" y="70" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="120" y="70" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="145" y="70" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="170" y="70" width="12" height="12" fill={brandColor} rx="2" />

                  <rect x="15" y="95" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="40" y="95" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="70" y="95" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="115" y="95" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="145" y="95" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="170" y="95" width="12" height="12" fill={brandColor} rx="2" />

                  <rect x="15" y="120" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="40" y="120" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="70" y="120" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="95" y="120" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="120" y="120" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="145" y="120" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="170" y="120" width="12" height="12" fill={brandColor} rx="2" />

                  <rect x="70" y="145" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="95" y="145" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="120" y="145" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="150" y="145" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="175" y="145" width="12" height="12" fill={brandColor} rx="2" />

                  <rect x="70" y="170" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="95" y="170" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="120" y="170" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="145" y="170" width="12" height="12" fill={brandColor} rx="2" />
                  <rect x="170" y="170" width="12" height="12" fill={brandColor} rx="2" />
                </svg>

                {showLogo && (
                  <div
                    className="absolute inset-0 m-auto w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs font-mono font-bold text-slate-800">{phone}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Instant WhatsApp Hub Connect</div>
            </div>

            <div className="flex gap-2 mt-4">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print Standee</span>
              </button>
            </div>
          </div>

          {/* Card 2: Interactive Website Floating Widget Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Website Floating Widget Interactive Mockup</span>
              </h4>
              <button
                onClick={() => setShowWidgetPopup(!showWidgetPopup)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {showWidgetPopup ? 'Hide Bubble' : 'Show Bubble'}
              </button>
            </div>

            {/* Mock Website Canvas */}
            <div className="h-60 bg-slate-100 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-between p-4">
              {/* Browser Bar */}
              <div className="bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex-1 text-center truncate">
                  https://www.your-business-website.com
                </div>
              </div>

              {/* Website content teaser */}
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                Your Website Header, Products, & Checkout Flow
              </div>

              {/* Floating Widget in bottom right */}
              <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                {showWidgetPopup && (
                  <div className="bg-white p-3.5 rounded-2xl shadow-lg border border-slate-200 max-w-xs animate-slide-up text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: brandColor }}
                      >
                        S
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{widgetTitle}</div>
                        <div className="text-[9px] text-emerald-600 font-medium">● Online • 2m reply</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed">
                      {widgetGreeting}
                    </div>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block w-full py-1.5 text-center text-white text-[11px] font-bold rounded-lg transition"
                      style={{ backgroundColor: brandColor }}
                    >
                      Start WhatsApp Chat
                    </a>
                  </div>
                )}

                <button
                  onClick={() => setShowWidgetPopup(!showWidgetPopup)}
                  className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: brandColor }}
                >
                  <MessageSquare className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
