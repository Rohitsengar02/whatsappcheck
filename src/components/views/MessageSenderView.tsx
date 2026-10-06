import React, { useState } from 'react';
import {
  Send,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  Bold,
  Italic,
  Strikethrough,
  Code2,
  Users,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ContactItem, WhatsAppConfig } from '../../types/dashboard';
import { PRESET_TEMPLATES } from '../../data/templates';
import { sanitizePhoneNumber, formatPhoneDisplay } from '../../services/whatsappService';
import { PhonePreview } from '../PhonePreview';

interface MessageSenderViewProps {
  config: WhatsAppConfig;
  contacts: ContactItem[];
  onSendMessage: (params: {
    toPhone: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'document';
    fileName?: string;
    caption?: string;
  }) => Promise<void>;
  isSending: boolean;
  onVerifyNumber: (phone: string) => Promise<boolean>;
  isVerifying: boolean;
}

export const MessageSenderView: React.FC<MessageSenderViewProps> = ({
  config,
  contacts,
  onSendMessage,
  isSending,
  onVerifyNumber,
  isVerifying,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<null | boolean>(null);

  // Message fields
  const [messageType, setMessageType] = useState<'text' | 'media'>('text');
  const [textMessage, setTextMessage] = useState(
    'Hello! Thank you for reaching out to us on WhatsApp. How can we help you today?'
  );
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'document'>('image');
  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
  );
  const [fileName, setFileName] = useState('photo.jpg');
  const [caption, setCaption] = useState('Check out our special brochure!');

  const handleApplyContact = (contact: ContactItem) => {
    setPhoneNumber(contact.phone);
    setVerificationStatus(null);
  };

  const handleApplyTemplate = (tplId: string) => {
    const tpl = PRESET_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    if (tpl.type === 'text') {
      setMessageType('text');
      setTextMessage(tpl.text);
    } else {
      setMessageType('media');
      if (tpl.mediaType) setMediaType(tpl.mediaType);
      if (tpl.mediaUrl) setMediaUrl(tpl.mediaUrl);
      if (tpl.fileName) setFileName(tpl.fileName);
      setCaption(tpl.caption || '');
    }
  };

  const handleVerify = async () => {
    if (!phoneNumber) return;
    const exists = await onVerifyNumber(phoneNumber);
    setVerificationStatus(exists);
  };

  const handleSend = () => {
    if (messageType === 'text') {
      onSendMessage({
        toPhone: phoneNumber,
        text: textMessage,
      });
    } else {
      onSendMessage({
        toPhone: phoneNumber,
        mediaUrl,
        mediaType,
        fileName,
        caption,
      });
    }
  };

  const insertFormat = (prefix: string, suffix: string) => {
    setTextMessage((prev) => `${prev} ${prefix}text${suffix}`);
  };

  const insertEmoji = (emoji: string) => {
    setTextMessage((prev) => `${prev} ${emoji}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Form: Recipient, Template, and Composer (7 cols) */}
      <div className="lg:col-span-7 space-y-5">
        {/* Step 1: Recipient Phone */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recipient Phone Number</h3>
                <p className="text-xs text-slate-500">Enter international WhatsApp mobile number</p>
              </div>
            </div>

            {/* Quick Contact Picker */}
            {contacts.length > 0 && (
              <div className="relative">
                <select
                  aria-label="Pick from saved contacts"
                  onChange={(e) => {
                    const c = contacts.find((contact) => contact.id === e.target.value);
                    if (c) handleApplyContact(c);
                  }}
                  defaultValue=""
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="" disabled>
                    Pick Saved Contact
                  </option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="tel"
                placeholder="+1 555 123 4567 or +91 98765 43210"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setVerificationStatus(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleVerify}
              disabled={isVerifying || !phoneNumber}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 border border-slate-200"
            >
              <ShieldCheck className={`w-4 h-4 text-emerald-600 ${isVerifying ? 'animate-pulse' : ''}`} />
              <span>{isVerifying ? 'Validating...' : 'Verify on WhatsApp'}</span>
            </button>
          </div>

          {/* Validation Status Indicator */}
          {verificationStatus !== null && (
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              {verificationStatus ? (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified! Active WhatsApp number ready for delivery.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-semibold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Not found on WhatsApp network. Please verify country code.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Templates Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Quick Templates
            </h3>
            <span className="text-xs text-slate-400">1-click fill into composer</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_TEMPLATES.slice(0, 6).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl.id)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Message Content Composer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Message Content</h3>
                <p className="text-xs text-slate-500">Compose text or attach media</p>
              </div>
            </div>

            {/* Type selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMessageType('text')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  messageType === 'text'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setMessageType('media')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  messageType === 'media'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Media / PDF
              </button>
            </div>
          </div>

          {/* Text Mode */}
          {messageType === 'text' && (
            <div className="space-y-2">
              {/* Toolbar */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertFormat('*', '*')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat('_', '_')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormat('~', '~')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-slate-300 px-1">|</span>
                  {['🍕', '🎉', '✅', '📦', '👋', '🌟'].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => insertEmoji(e)}
                      className="p-1 hover:bg-slate-100 rounded text-xs"
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400">{textMessage.length} characters</span>
              </div>

              <textarea
                rows={6}
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                placeholder="Write your WhatsApp message here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white leading-relaxed"
              />
            </div>
          )}

          {/* Media Mode */}
          {messageType === 'media' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Attachment Type:</span>
                <div className="flex items-center gap-1">
                  {(['image', 'document', 'video'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMediaType(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                        mediaType === t
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Public Media / PDF URL
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/file.jpg or .pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="photo.jpg or invoice.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional caption displayed under the media..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Trigger Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setTextMessage('');
                setCaption('');
              }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
              title="Clear message"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !phoneNumber || (messageType === 'text' ? !textMessage : !mediaUrl)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-95 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-bounce' : ''}`} />
              <span>{isSending ? 'Dispatching to WhatsApp...' : 'Send WhatsApp Message'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Phone Mockup Preview (5 cols) */}
      <div className="lg:col-span-5 sticky top-24">
        <PhonePreview
          recipientPhone={phoneNumber || '+1234567890'}
          senderPhone={config.connectedNumber || 'Sengar Business'}
          messageType={messageType}
          textMessage={textMessage}
          mediaType={mediaType}
          mediaUrl={mediaUrl}
          fileName={fileName}
          caption={caption}
        />
      </div>
    </div>
  );
};
