import React, { useState } from 'react';
import {
  CheckCheck,
  Phone,
  Video as VideoIcon,
  MoreVertical,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Sun,
  Moon,
  Shield,
  Smartphone,
  ExternalLink,
  MousePointerClick,
  Sparkles,
  Bot
} from 'lucide-react';
import { formatPhoneDisplay } from '../services/whatsappService';

interface PhonePreviewProps {
  recipientPhone: string;
  senderPhone: string;
  messageType: 'text' | 'media' | 'buttons';
  textMessage: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  fileName?: string;
  caption?: string;
  buttonsTitle?: string;
  buttonsFooter?: string;
  buttons?: {
    id: string;
    label: string;
    type: 'reply' | 'url' | 'call';
    payloadOrUrl?: string;
    autoResponse?: string;
  }[];
  onButtonClick?: (btn: any) => void;
  simulatedReply?: string | null;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  recipientPhone,
  senderPhone,
  messageType,
  textMessage,
  mediaType = 'image',
  mediaUrl = '',
  fileName = '',
  caption = '',
  buttonsTitle = '',
  buttonsFooter = '',
  buttons = [],
  onButtonClick,
  simulatedReply,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Render markdown text (bold, italic, strikethrough)
  const renderFormattedText = (raw: string) => {
    if (!raw) return <span className="text-zinc-500 italic">Message preview will appear here...</span>;

    const lines = raw.split('\n');

    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*[^*]+\*|_[^_]+_|~[^~]+~)/g);

      return (
        <span key={lineIdx} className="block min-h-[1.2em]">
          {parts.map((part, partIdx) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={partIdx} className="font-bold">{part.slice(1, -1)}</strong>;
            }
            if (part.startsWith('_') && part.endsWith('_')) {
              return <em key={partIdx} className="italic">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('~') && part.endsWith('~')) {
              return <s key={partIdx} className="line-through">{part.slice(1, -1)}</s>;
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </span>
      );
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Live WhatsApp Chat Simulator</h3>
            <p className="text-xs text-zinc-400">Realistic client preview of how messages render on device</p>
          </div>
        </div>

        {/* Theme toggle for WhatsApp phone */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
          title="Toggle WhatsApp Dark/Light UI"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Phone Mockup Frame */}
      <div className="w-full max-w-[340px] rounded-[36px] p-2.5 bg-zinc-950 border-[3px] border-zinc-700 shadow-2xl relative">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-end px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-900/60"></div>
        </div>

        {/* Screen Container */}
        <div className="w-full rounded-[28px] overflow-hidden flex flex-col h-[520px] relative select-none">
          {/* WhatsApp Chat Header */}
          <div
            className={`pt-7 pb-2.5 px-3 flex items-center justify-between z-10 transition-colors shadow-sm ${
              isDarkMode ? 'bg-[#202c33] text-white' : 'bg-[#008069] text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 cursor-pointer" />
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                {(senderPhone || 'WA').slice(0, 2)}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold flex items-center gap-1">
                  <span className="truncate max-w-[120px]">{senderPhone || 'BiteChez WhatsApp'}</span>
                  <Shield className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[10px] opacity-75 font-mono">
                  {recipientPhone ? formatPhoneDisplay(recipientPhone) : '+91 94118 00280'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/80">
              <VideoIcon className="w-4 h-4" />
              <Phone className="w-3.5 h-3.5" />
              <MoreVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* WhatsApp Chat Wallpaper & Bubbles Area */}
          <div
            className={`flex-1 p-3 overflow-y-auto flex flex-col justify-end transition-colors ${
              isDarkMode ? 'bg-[#0b141a]' : 'bg-[#efeae2]'
            }`}
            style={{
              backgroundImage: isDarkMode
                ? 'radial-gradient(#1f2c34 1px, transparent 1px)'
                : 'radial-gradient(#dfd8cc 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            {/* Encryption Notice */}
            <div className="mx-auto mb-3 max-w-[260px] text-center">
              <div
                className={`text-[9px] px-2 py-1 rounded-lg shadow-sm leading-tight inline-block ${
                  isDarkMode
                    ? 'bg-[#182229] text-[#ffd279] border border-[#222d34]'
                    : 'bg-[#ffeecd] text-[#54656f]'
                }`}
              >
                🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.
              </div>
            </div>

            {/* Outgoing Message Bubble */}
            <div className="flex justify-end mb-2">
              <div
                className={`max-w-[88%] rounded-2xl rounded-tr-xs p-2.5 shadow-sm text-xs relative ${
                  isDarkMode
                    ? 'bg-[#005c4b] text-[#e9edef]'
                    : 'bg-[#d9fdd3] text-[#111b21]'
                }`}
              >
                {/* Media Attachment View */}
                {messageType === 'media' && (
                  <div className="mb-2">
                    {mediaType === 'image' && (
                      <div className="rounded-xl overflow-hidden bg-black/20 border border-black/10">
                        {mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt="Media"
                            className="w-full max-h-40 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-28 flex items-center justify-center text-xs text-zinc-400">
                            Image Preview
                          </div>
                        )}
                      </div>
                    )}

                    {mediaType === 'document' && (
                      <div
                        className={`p-2.5 rounded-xl flex items-center gap-2.5 border ${
                          isDarkMode
                            ? 'bg-[#025143] border-[#086655]'
                            : 'bg-[#c5f5bd] border-[#b0ebb2]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0 leading-tight">
                          <div className="text-[11px] font-bold truncate">
                            {fileName || 'Document.pdf'}
                          </div>
                          <div className="text-[9px] opacity-70 mt-0.5">
                            PDF Document • WhatsApp Cloud
                          </div>
                        </div>
                        <Download className="w-4 h-4 opacity-75 shrink-0" />
                      </div>
                    )}

                    {mediaType === 'video' && (
                      <div className="rounded-xl overflow-hidden bg-black/40 h-36 flex flex-col items-center justify-center relative border border-black/20">
                        <VideoIcon className="w-8 h-8 opacity-80" />
                        <span className="text-[10px] mt-1 opacity-70 font-mono">
                          {fileName || 'video.mp4'}
                        </span>
                      </div>
                    )}

                    {mediaType === 'audio' && (
                      <div
                        className={`p-2.5 rounded-xl flex items-center gap-2 border ${
                          isDarkMode ? 'bg-[#025143]' : 'bg-[#c5f5bd]'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs">
                          ▶
                        </div>
                        <div className="flex-1 h-1.5 bg-black/20 rounded-full"></div>
                        <span className="text-[10px] opacity-80">0:18</span>
                      </div>
                    )}

                    {/* Caption for Media */}
                    {caption && (
                      <div className="mt-1.5 text-[11px] leading-relaxed break-words">
                        {renderFormattedText(caption)}
                      </div>
                    )}
                  </div>
                )}

                {/* Plain Text View */}
                {messageType === 'text' && (
                  <div className="text-[11px] leading-relaxed break-words font-sans">
                    {renderFormattedText(textMessage)}
                  </div>
                )}

                {/* Interactive Buttons View Content */}
                {messageType === 'buttons' && (
                  <div className="space-y-1">
                    {mediaUrl && (
                      <div className="rounded-xl overflow-hidden mb-1.5 bg-black/20 border border-black/10">
                        <img
                          src={mediaUrl}
                          alt="Product Header"
                          className="w-full max-h-36 object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {buttonsTitle && (
                      <div className={`font-bold text-xs mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {buttonsTitle}
                      </div>
                    )}
                    <div className="text-[11px] leading-relaxed break-words font-sans">
                      {renderFormattedText(textMessage)}
                    </div>
                    {buttonsFooter && (
                      <div className="text-[10px] opacity-70 italic mt-0.5">
                        {buttonsFooter}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Timestamp & Checkmarks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
                  <span>{currentTime}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            </div>

            {/* Native WhatsApp Button Cards (Stacked Below Bubble matching native WhatsApp UI) */}
            {messageType === 'buttons' && buttons && buttons.length > 0 && (
              <div className="flex flex-col items-end mb-2 w-full">
                <div className="w-[88%] space-y-1.5">
                  {buttons.map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => onButtonClick && onButtonClick(btn)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm cursor-pointer ${
                        isDarkMode
                          ? 'bg-[#202c33] hover:bg-[#2a3942] text-[#53bdeb] border border-[#2f3b43]'
                          : 'bg-white hover:bg-slate-50 text-[#00a884] border border-slate-200'
                      }`}
                      title={btn.autoResponse ? `Click to trigger: "${btn.autoResponse}"` : undefined}
                    >
                      <MousePointerClick className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Simulated Incoming Automated Response Bubble */}
            {simulatedReply && (
              <div className="flex justify-start mb-2 animate-fadeIn">
                <div
                  className={`max-w-[88%] rounded-2xl rounded-tl-xs p-2.5 shadow-sm text-xs relative ${
                    isDarkMode
                      ? 'bg-[#202c33] text-[#e9edef]'
                      : 'bg-white text-[#111b21]'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 mb-1">
                    <Bot className="w-3 h-3" />
                    <span>Automated Reply</span>
                  </div>
                  <div className="text-[11px] leading-relaxed break-words font-sans">
                    {renderFormattedText(simulatedReply)}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
                    <span>{currentTime}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Bottom Composer Mockup */}
          <div
            className={`p-2 flex items-center gap-2 border-t text-xs ${
              isDarkMode
                ? 'bg-[#202c33] border-[#2f3b43] text-zinc-400'
                : 'bg-[#f0f2f5] border-zinc-300 text-zinc-500'
            }`}
          >
            <div className="flex-1 px-3 py-1.5 rounded-full bg-black/10 text-[11px]">
              Type a message...
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">
              🎙️
            </div>
          </div>
        </div>
      </div>

      {/* Target Info Under Mockup */}
      <div className="mt-3 text-center text-xs text-zinc-400">
        <span>Recipient: </span>
        <strong className="text-white font-mono">
          {recipientPhone ? formatPhoneDisplay(recipientPhone) : 'Not specified'}
        </strong>
      </div>
    </div>
  );
};
