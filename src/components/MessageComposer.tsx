import React, { useState } from 'react';
import {
  Send,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Video,
  Music,
  Code2,
  Trash2,
  Paperclip,
  Check,
  Terminal,
  Bold,
  Italic,
  Strikethrough,
  Smile,
  ExternalLink
} from 'lucide-react';

interface MessageComposerProps {
  messageType: 'text' | 'media';
  setMessageType: (type: 'text' | 'media') => void;
  textMessage: string;
  setTextMessage: (text: string) => void;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  setMediaType: (type: 'image' | 'video' | 'audio' | 'document') => void;
  mediaUrl: string;
  setMediaUrl: (url: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  caption: string;
  setCaption: (caption: string) => void;
  onSendMessage: () => void;
  isSending: boolean;
  onCopyCurl: () => void;
  isCurlCopied: boolean;
  onClear: () => void;
  targetPhone: string;
}

const SAMPLE_MEDIA_PRESETS = [
  {
    label: '🧾 Sample PDF Document',
    type: 'document' as const,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'sample_document.pdf',
    caption: 'Official document attachment.',
  },
  {
    label: '🍔 Gourmet Burger Image',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80',
    fileName: 'burger.jpg',
    caption: 'Craving something delicious? Check out our special menu today!',
  },
  {
    label: '🍕 Artisan Pizza Image',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80',
    fileName: 'artisan_pizza.jpg',
    caption: 'Wood-fired oven pizza with fresh mozzarella and basil.',
  },
  {
    label: '🎥 Food Teaser Video',
    type: 'video' as const,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    fileName: 'bitechez_promo.mp4',
    caption: 'Watch how we prepare our signature dishes.',
  },
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  messageType,
  setMessageType,
  textMessage,
  setTextMessage,
  mediaType,
  setMediaType,
  mediaUrl,
  setMediaUrl,
  fileName,
  setFileName,
  caption,
  setCaption,
  onSendMessage,
  isSending,
  onCopyCurl,
  isCurlCopied,
  onClear,
  targetPhone,
}) => {
  const insertFormatting = (prefix: string, suffix: string, isForCaption = false) => {
    if (isForCaption) {
      setCaption(`${caption}${prefix}text${suffix}`);
    } else {
      setTextMessage(`${textMessage}${prefix}text${suffix}`);
    }
  };

  const insertEmoji = (emoji: string, isForCaption = false) => {
    if (isForCaption) {
      setCaption(caption + emoji);
    } else {
      setTextMessage(textMessage + emoji);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header and Type Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Message Payload Composer</h3>
              <p className="text-xs text-zinc-400">Compose text or media payload to dispatch via Evolution API</p>
            </div>
          </div>

          {/* Toggle Plain Text vs Media */}
          <div className="flex items-center p-1 bg-zinc-950 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMessageType('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                messageType === 'text'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Plain Text</span>
            </button>
            <button
              type="button"
              onClick={() => setMessageType('media')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                messageType === 'media'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Media & PDF</span>
            </button>
          </div>
        </div>

        {/* Text Mode */}
        {messageType === 'text' && (
          <div className="space-y-3">
            {/* Formatting Toolbar */}
            <div className="flex items-center justify-between gap-2 text-xs text-zinc-400 pb-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
                  title="Bold: *text*"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('_', '_')}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
                  title="Italic: _text_"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('~', '~')}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
                  title="Strikethrough: ~text~"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('```', '```')}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white"
                  title="Monospace code: ```text```"
                >
                  <Code2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-zinc-600 px-1">|</span>
                {['🍕', '🍔', '🎉', '🛵', '🧾', '✅'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-zinc-800 rounded text-xs"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-zinc-500">
                {textMessage.length} characters
              </div>
            </div>

            <textarea
              rows={7}
              placeholder="Type your WhatsApp message here... (Markdown supported: *bold*, _italic_, ~strike~, ```code```)"
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
            />
          </div>
        )}

        {/* Media Mode */}
        {messageType === 'media' && (
          <div className="space-y-3.5">
            {/* Media Type Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Media Type:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'image', label: 'Image', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                  { id: 'document', label: 'Document (PDF)', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
                  { id: 'video', label: 'Video', icon: <Video className="w-3.5 h-3.5" /> },
                  { id: 'audio', label: 'Audio', icon: <Music className="w-3.5 h-3.5" /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMediaType(item.id as any)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      mediaType === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Media Presets */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-zinc-500 text-[11px]">Quick Samples:</span>
              {SAMPLE_MEDIA_PRESETS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMediaType(sample.type);
                    setMediaUrl(sample.url);
                    setFileName(sample.fileName);
                    setCaption(sample.caption);
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[11px] transition"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Media URL Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Public Media URL</span>
                {mediaUrl && (
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-teal-400 hover:underline flex items-center gap-0.5"
                  >
                    Test URL <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </label>
              <input
                type="url"
                placeholder="https://... (e.g. image, Cloudflare R2 PDF, or mp4)"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* File Name & Mime */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">File Name</label>
              <input
                type="text"
                placeholder="e.g. BiteChez_Invoice_5482.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Media Caption */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Caption (Optional)</span>
                <span className="text-[11px] text-zinc-500">{caption.length} chars</span>
              </label>
              <textarea
                rows={3}
                placeholder="Caption text displayed under the media in WhatsApp..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* Trigger Button & Action Bar */}
      <div className="pt-5 mt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Clear button */}
          <button
            type="button"
            onClick={onClear}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl transition"
            title="Reset message"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Copy cURL button */}
          <button
            type="button"
            onClick={onCopyCurl}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition border border-zinc-700/80"
            title="Copy exact cURL terminal command"
          >
            {isCurlCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">cURL Copied!</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy cURL</span>
              </>
            )}
          </button>
        </div>

        {/* The Main TRIGGER BUTTON */}
        <button
          type="button"
          onClick={onSendMessage}
          disabled={isSending || (messageType === 'text' ? !textMessage.trim() : !mediaUrl.trim())}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-950/60 transition active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
          <span>
            {isSending
              ? 'Dispatching via Evolution API...'
              : `Trigger WhatsApp ${messageType === 'text' ? 'Message' : 'Media'}`}
          </span>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono hidden md:inline">
            ⌘+Enter
          </span>
        </button>
      </div>
    </div>
  );
};
