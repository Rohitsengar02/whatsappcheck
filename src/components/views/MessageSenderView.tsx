import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Database,
  RefreshCw,
  Server,
  UserCheck,
  AlertCircle,
  Clock,
  Check,
  ArrowRight,
  MousePointerClick,
  Plus,
  Bot,
  Zap,
  ArrowLeft,
  Eye,
  ChevronDown,
  CloudUpload,
  Smile,
  User as LucideUser,
  Video,
  Phone,
  CheckCheck,
  MoreVertical,
  ChevronRight,
  Play,
  X,
  Music,
  Download,
  Link,
} from 'lucide-react';
import { ContactItem, WhatsAppConfig, ConnectionStateData, InteractiveButtonItem } from '../../types/dashboard';
import { PRESET_TEMPLATES } from '../../data/templates';
import {
  sanitizePhoneNumber,
  formatPhoneDisplay,
  sendButtonsMessage,
  sendPollMessage,
  sendListMessage,
} from '../../services/whatsappService';
import { messageService, DbMessage } from '../../services/messageService';
import { User } from '../../services/authService';
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
    mimetype?: string;
  }) => Promise<any>;
  isSending: boolean;
  onVerifyNumber: (phone: string) => Promise<boolean>;
  isVerifying: boolean;
  currentUser?: User | null;
  connectionState?: ConnectionStateData | null;
  onOpenConnect?: () => void;
}

export const MessageSenderView: React.FC<MessageSenderViewProps> = ({
  config,
  contacts,
  onSendMessage,
  isSending,
  onVerifyNumber,
  isVerifying,
  currentUser,
  connectionState,
  onOpenConnect,
}) => {
  // Country code & Phone input state matching CyberLim UI
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone ? currentUser.phone.replace(/^(\+91|91)/, '') : '9876543210');
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showButtonsConfig, setShowButtonsConfig] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const countryOptions = [
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+55', flag: '🇧🇷', name: 'Brazil' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
  ];

  const [verificationStatus, setVerificationStatus] = useState<null | boolean>(null);

  // Message mode: 'text' | 'media' | 'buttons'
  const [messageType, setMessageType] = useState<'text' | 'media' | 'buttons'>('buttons');

  // Text Mode state
  const [textMessage, setTextMessage] = useState('');

  // Media Mode state
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | 'document'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [caption, setCaption] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [mediaSourceTab, setMediaSourceTab] = useState<'upload' | 'url'>('upload');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Interactive Buttons state
  const [buttonsTitle, setButtonsTitle] = useState('How Would You Like to Proceed?');
  const [buttonsFooter, setButtonsFooter] = useState('CyberLim WhatsApp API');
  const [interactiveButtons, setInteractiveButtons] = useState<InteractiveButtonItem[]>([
    {
      id: 'btn_edit_details',
      label: 'Edit Details',
      type: 'reply',
      payloadOrUrl: 'EDIT_DETAILS',
      autoResponse: '✏️ Please reply with your updated details or dates.',
    },
    {
      id: 'btn_view_cycles',
      label: 'View Upcoming Cycles',
      type: 'reply',
      payloadOrUrl: 'VIEW_CYCLES',
      autoResponse: '📅 Next predicted cycle: 04 Jul 2022. Fertile window: 17 Jun - 22 Jun.',
    },
    {
      id: 'btn_close_conv',
      label: 'Close Conversation',
      type: 'reply',
      payloadOrUrl: 'CLOSE_CONVERSATION',
      autoResponse: '👋 Conversation closed. Feel free to message us anytime you need help!',
    },
  ]);

  // Automated reply simulation state
  const [simulatedReply, setSimulatedReply] = useState<string | null>(null);
  const [isTriggeringAutoReply, setIsTriggeringAutoReply] = useState(false);
  const [lastTriggerNotice, setLastTriggerNotice] = useState<string | null>(null);
  const [buttonDeliveryMode, setButtonDeliveryMode] = useState<'native' | 'poll' | 'list'>('native');
  const [includeButtonImage, setIncludeButtonImage] = useState(true);
  const [buttonImageUrl, setButtonImageUrl] = useState(
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'
  );
  const [isSendingLocal, setIsSendingLocal] = useState(false);

  // Database messages state
  const [dbMessages, setDbMessages] = useState<DbMessage[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isConnected = connectionState?.status === 'open';

  // Load database messages on mount
  const loadDatabaseMessages = async () => {
    setIsLoadingDb(true);
    try {
      const res = await messageService.fetchMessages();
      if (res.success) {
        setDbMessages(res.messages);
      }
    } catch (e) {
      console.warn('Failed to load DB messages', e);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    loadDatabaseMessages();
  }, []);

  const getFullPhoneNumber = () => {
    if (!phoneNumber) return '';
    const clean = phoneNumber.trim();
    if (clean.startsWith('+')) return clean;
    return `${countryCode}${clean.replace(/^0+/, '')}`;
  };

  const handleApplyContact = (contact: ContactItem) => {
    const raw = contact.phone.replace(/[\s\-\(\)]/g, '');
    if (raw.startsWith('+')) {
      const match = countryOptions.find((c) => raw.startsWith(c.code));
      if (match) {
        setCountryCode(match.code);
        setPhoneNumber(raw.slice(match.code.length));
      } else {
        setPhoneNumber(raw);
      }
    } else if (raw.startsWith('91') && raw.length > 10) {
      setCountryCode('+91');
      setPhoneNumber(raw.slice(2));
    } else {
      setPhoneNumber(raw);
    }
    setVerificationStatus(null);
    setShowContactPicker(false);
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

  const handleFileSelected = (file: File) => {
    if (!file) return;

    let detectedType: 'image' | 'video' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) {
      detectedType = 'image';
    } else if (file.type.startsWith('video/')) {
      detectedType = 'video';
    } else if (file.type.startsWith('audio/')) {
      detectedType = 'audio';
    } else {
      detectedType = 'document';
    }

    setMediaType(detectedType);
    setFileName(file.name);
    setMimeType(file.type || (detectedType === 'document' ? 'application/pdf' : 'application/octet-stream'));

    const sizeInKb = file.size / 1024;
    const formatted = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;
    setFileSize(formatted);

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setMediaUrl(reader.result as string);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      console.error('Failed to read file');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClearMedia = () => {
    setMediaUrl('');
    setFileName('');
    setFileSize('');
    setMimeType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVerify = async () => {
    const full = getFullPhoneNumber();
    if (!full) return;
    const exists = await onVerifyNumber(full);
    setVerificationStatus(exists);
  };

  // Add Interactive Button
  const handleAddButton = () => {
    if (interactiveButtons.length >= 3) return; // WhatsApp max 3 buttons
    const newIdx = interactiveButtons.length + 1;
    const newBtn: InteractiveButtonItem = {
      id: `btn_${Date.now()}_${newIdx}`,
      label: `Option ${newIdx} 💬`,
      type: 'reply',
      payloadOrUrl: `ACTION_${newIdx}`,
      autoResponse: `🤖 Automated reply for Option ${newIdx}: Thanks for reaching out! A representative will connect shortly.`,
    };
    setInteractiveButtons([...interactiveButtons, newBtn]);
  };

  const handleRemoveButton = (id: string) => {
    setInteractiveButtons(interactiveButtons.filter((b) => b.id !== id));
  };

  const handleUpdateButton = (id: string, field: keyof InteractiveButtonItem, value: any) => {
    setInteractiveButtons(
      interactiveButtons.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Simulate or execute button tap that sends the automated response
  const handleButtonClick = async (btn: InteractiveButtonItem) => {
    if (btn.type === 'url') {
      if (btn.payloadOrUrl) window.open(btn.payloadOrUrl, '_blank');
      return;
    }

    const autoReplyText = btn.autoResponse || `🤖 Automated Reply: You clicked "${btn.label}".`;
    setSimulatedReply(autoReplyText);

    // If recipient number is available and instance is configured, dispatch the automated response to WhatsApp
    const full = getFullPhoneNumber();
    const cleanNumber = sanitizePhoneNumber(full);
    if (cleanNumber && config.instance) {
      setIsTriggeringAutoReply(true);
      try {
        const res = await messageService.triggerButtonAction({
          instance_name: config.instance,
          button_id: btn.id,
          button_text: btn.label,
          recipient_phone: cleanNumber,
          custom_response: autoReplyText,
          server_url: config.baseUrl || 'https://www.bitechez.com',
          api_key: config.apiKey,
        });

        if (res.success) {
          setLastTriggerNotice(`Automated reply for "${btn.label}" dispatched to +${cleanNumber} and recorded in database!`);
          setTimeout(() => setLastTriggerNotice(null), 5000);
          loadDatabaseMessages();
        }
      } catch (err: any) {
        console.warn('Button trigger execution warning:', err);
      } finally {
        setIsTriggeringAutoReply(false);
      }
    }
  };

  // Dispatch Main Direct Message
  const handleSend = async () => {
    const full = getFullPhoneNumber();
    const cleanNumber = sanitizePhoneNumber(full);
    if (!cleanNumber) return;

    if (!textMessage.trim() && !mediaUrl) {
      setLastTriggerNotice('⚠️ Please enter a message text or attach a media file (video, pdf, image).');
      setTimeout(() => setLastTriggerNotice(null), 3500);
      return;
    }

    setIsSendingLocal(true);
    try {
      if (mediaUrl && mediaUrl.trim()) {
        await onSendMessage({
          toPhone: full,
          mediaUrl: mediaUrl.trim(),
          mediaType,
          fileName: fileName || (mediaType === 'document' ? 'document.pdf' : mediaType === 'video' ? 'video.mp4' : 'image.jpg'),
          caption: textMessage,
          mimetype: mimeType || undefined,
        });
      } else {
        await onSendMessage({
          toPhone: full,
          text: textMessage,
        });
      }

      setLastTriggerNotice(`✅ WhatsApp message dispatched to ${full}!`);
      setTimeout(() => setLastTriggerNotice(null), 4000);
    } catch (err: any) {
      setLastTriggerNotice(`❌ Delivery error: ${err?.message || 'Failed to dispatch'}`);
    } finally {
      setIsSendingLocal(false);
    }

    setTimeout(() => {
      loadDatabaseMessages();
    }, 1200);
  };

  const handleDeleteDbMessage = async (id: number) => {
    setDeleteId(id);
    try {
      await messageService.deleteMessage(id);
      setDbMessages((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setDeleteId(null);
    }
  };

  const insertFormat = (prefix: string, suffix: string) => {
    setTextMessage((prev) => `${prev} ${prefix}text${suffix}`);
  };

  const insertEmoji = (emoji: string) => {
    setTextMessage((prev) => `${prev} ${emoji}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header matching CyberLim screenshot */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer shrink-0"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Send Message</h1>
          <p className="text-xs text-slate-500 font-medium">Send a WhatsApp message instantly to any number.</p>
        </div>
      </div>

      {/* Trigger Notification Alert */}
      {lastTriggerNotice && (
        <div className="p-3.5 rounded-xl bg-lime-50 border border-lime-200 text-lime-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
          <span>{lastTriggerNotice}</span>
        </div>
      )}

      {/* Main Composer Grid: Left 3-Step Composer (7 cols) + Right Message Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Step 1 Recipient, Step 2 Message & Buttons, Step 3 Media, CTA Button */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          {/* STEP 1: Recipient */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[#22c55e] text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Recipient</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter the WhatsApp number you want to send a message to.</p>
              </div>
            </div>

            {/* Input with Country selector & Contact button */}
            <div className="relative">
              <div className="border border-slate-200 rounded-xl flex items-center bg-white p-1 hover:border-slate-300 focus-within:border-[#84cc16] focus-within:ring-2 focus-within:ring-[#84cc16]/10 transition">
                {/* Country Code Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryMenu(!showCountryMenu)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer shrink-0"
                  >
                    <span className="text-sm leading-none">
                      {countryOptions.find((c) => c.code === countryCode)?.flag || '🇮🇳'}
                    </span>
                    <span>{countryCode}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Country Selector Dropdown */}
                  {showCountryMenu && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1.5 animate-fadeIn">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Country Code
                      </div>
                      {countryOptions.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(c.code);
                            setShowCountryMenu(false);
                          }}
                          className={`w-full px-3 py-1.5 text-xs flex items-center justify-between text-left transition cursor-pointer ${
                            countryCode === c.code ? 'bg-[#ecfccb] text-[#3f6212] font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-6 w-px bg-slate-200 my-auto shrink-0" />

                {/* Phone Number Input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setVerificationStatus(null);
                  }}
                  placeholder="9876543210"
                  className="flex-1 px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                />

                {/* Contact Book Picker Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowContactPicker(!showContactPicker)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                    title="Select from Contacts"
                  >
                    <Users className="w-4 h-4 stroke-[1.8]" />
                  </button>

                  {/* Contacts Dropdown */}
                  {showContactPicker && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1.5 max-h-60 overflow-y-auto animate-fadeIn">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Saved Contacts ({contacts.length})
                      </div>
                      {contacts.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-400 italic">No saved contacts yet</div>
                      ) : (
                        contacts.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleApplyContact(c)}
                            className="w-full px-3 py-2 text-left hover:bg-slate-50 flex flex-col transition cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-800">{c.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">{c.phone}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Number verification status pill if verified */}
              {verificationStatus !== null && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {verificationStatus ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active WhatsApp Number Verified
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1 font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      Number not detected on WhatsApp
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Message */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[#22c55e] text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Message</h3>
                <p className="text-xs text-slate-500 mt-0.5">Type your message below.</p>
              </div>
            </div>

            {/* Textarea container matching CyberLim reference */}
            <div className="border border-slate-200 rounded-xl bg-white p-3 space-y-2 hover:border-slate-300 focus-within:border-[#84cc16] focus-within:ring-2 focus-within:ring-[#84cc16]/10 transition relative">
              <textarea
                rows={4}
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed bg-transparent"
              />

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                    title="Add Emoji"
                  >
                    <Smile className="w-4 h-4 stroke-[1.8]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                    title="Attach File"
                  >
                    <Paperclip className="w-4 h-4 stroke-[1.8]" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-8 left-0 bg-white border border-slate-200 rounded-xl p-2 shadow-lg z-30 flex items-center gap-1.5 flex-wrap w-56 animate-fadeIn">
                      {['👋', '🚀', '🍕', '🎉', '✅', '📦', '💬', '🔥', '⭐', '❤️', '💡', '📞'].map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => {
                            insertEmoji(e);
                            setShowEmojiPicker(false);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-sm cursor-pointer"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {textMessage.length}/4096
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: Media (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#22c55e] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Media (Optional)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Attach a Video, PDF document, Image or Audio.</p>
                </div>
              </div>

              {/* Quick Type Filter Chips */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMediaType('image');
                    if (!mediaUrl) fileInputRef.current?.click();
                  }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                    mediaType === 'image' && mediaUrl ? 'bg-white shadow-2xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Attach Image (JPG, PNG, WebP)"
                >
                  <ImageIcon className="w-3 h-3 text-blue-500" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaType('video');
                    if (!mediaUrl) fileInputRef.current?.click();
                  }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                    mediaType === 'video' && mediaUrl ? 'bg-white shadow-2xs text-purple-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Attach Video (MP4, WebM)"
                >
                  <Video className="w-3 h-3 text-purple-500" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaType('document');
                    if (!mediaUrl) fileInputRef.current?.click();
                  }}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                    mediaType === 'document' && mediaUrl ? 'bg-white shadow-2xs text-rose-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Attach PDF or Document"
                >
                  <FileText className="w-3 h-3 text-rose-500" />
                  <span>PDF / Doc</span>
                </button>
              </div>
            </div>

            {/* Upload File vs Public URL toggle */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setMediaSourceTab('upload')}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  mediaSourceTab === 'upload' ? 'bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaSourceTab('url')}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  mediaSourceTab === 'url' ? 'bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Media URL</span>
              </button>
            </div>

            {mediaSourceTab === 'upload' ? (
              <>
                {/* Hidden File Input supporting Video, PDF, Images, and Audio */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,application/pdf,.pdf,.doc,.docx,.xlsx,.txt,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                />

                {/* Dropzone Container */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelected(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center gap-1.5 transition cursor-pointer group ${
                    isDragging
                      ? 'border-[#84cc16] bg-lime-50'
                      : 'border-slate-200 hover:border-[#84cc16] bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#ecfccb] text-slate-600 group-hover:text-[#65a30d] flex items-center justify-center transition">
                    {isReadingFile ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-[#65a30d]" />
                    ) : (
                      <CloudUpload className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {isReadingFile ? 'Encoding file...' : (
                      <>
                        Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supports Video (MP4), PDF Documents, Images (PNG, JPG), Audio (max 50 MB)
                  </div>
                </div>
              </>
            ) : (
              /* Public URL input mode */
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Direct Media URL</label>
                  <input
                    type="url"
                    value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      setMediaUrl(url);
                      if (url.match(/\.(mp4|mov|webm|3gp)($|\?)/i)) {
                        setMediaType('video');
                        setFileName(url.split('/').pop()?.split('?')[0] || 'video.mp4');
                      } else if (url.match(/\.(pdf|doc|docx|xlsx|txt)($|\?)/i)) {
                        setMediaType('document');
                        setFileName(url.split('/').pop()?.split('?')[0] || 'document.pdf');
                      } else if (url.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i)) {
                        setMediaType('image');
                        setFileName(url.split('/').pop()?.split('?')[0] || 'image.jpg');
                      }
                    }}
                    placeholder="https://example.com/video.mp4 or document.pdf"
                    className="w-full mt-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#84cc16]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">Media Type</label>
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value as any)}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#84cc16]"
                    >
                      <option value="image">Image (JPG, PNG)</option>
                      <option value="video">Video (MP4)</option>
                      <option value="document">PDF / Document</option>
                      <option value="audio">Audio (MP3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">File Name (optional)</label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="e.g. catalog.pdf or intro.mp4"
                      className="w-full mt-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#84cc16]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Selected File Card */}
            {mediaUrl ? (
              <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between bg-white shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      mediaType === 'video'
                        ? 'bg-purple-100 text-purple-600'
                        : mediaType === 'document'
                        ? 'bg-rose-100 text-rose-600'
                        : mediaType === 'audio'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {mediaType === 'video' && <Video className="w-5 h-5" />}
                    {mediaType === 'document' && <FileText className="w-5 h-5" />}
                    {mediaType === 'audio' && <Music className="w-5 h-5" />}
                    {mediaType === 'image' && <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                        {fileName || (mediaType === 'video' ? 'video.mp4' : mediaType === 'document' ? 'document.pdf' : 'image.jpg')}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          mediaType === 'video'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : mediaType === 'document'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : mediaType === 'audio'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {mediaType === 'document' ? 'PDF / DOC' : mediaType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      {fileSize && <span>{fileSize}</span>}
                      {mimeType && <span className="font-mono text-[10px] text-slate-400">{mimeType}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer font-medium"
                    title="Change file"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleClearMedia}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Big Action Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || isSendingLocal || !phoneNumber}
            className="w-full py-3.5 bg-[#84cc16] hover:bg-[#65a30d] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-[#84cc16]/20 transition cursor-pointer"
          >
            <Send className={`w-4 h-4 ${isSending || isSendingLocal ? 'animate-bounce' : ''}`} />
            <span>
              {isSending || isSendingLocal
                ? 'Dispatching to WhatsApp...'
                : 'Send Message'}
            </span>
          </button>
        </div>

        {/* Right Column: Message Preview card matching CyberLim reference */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 sticky top-24">
          {/* Header */}
          <div className="flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-none">Message Preview</h3>
              <p className="text-xs text-slate-500 mt-1">This is how your message will appear on WhatsApp.</p>
            </div>
          </div>

          {/* WhatsApp Phone Mockup Card */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-[#efeae2]">
            {/* WhatsApp Teal Header (#075e54) */}
            <div className="bg-[#075e54] text-white px-3.5 py-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-2 min-w-0">
                <ArrowLeft className="w-4 h-4 text-white/90 shrink-0" />
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 overflow-hidden">
                  <LucideUser className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {phoneNumber
                      ? phoneNumber.startsWith('+')
                        ? phoneNumber
                        : `${countryCode} ${phoneNumber}`
                      : '+91 98765 43210'}
                  </div>
                  <div className="text-[10px] text-emerald-200 leading-tight">online</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-white/90 shrink-0">
                <Video className="w-4 h-4 cursor-pointer" />
                <Phone className="w-4 h-4 cursor-pointer" />
                <MoreVertical className="w-4 h-4 cursor-pointer" />
              </div>
            </div>

            {/* WhatsApp Chat Area */}
            <div
              className="p-4 min-h-[460px] flex flex-col justify-between relative bg-[#efeae2]"
              style={{
                backgroundImage: `radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            >
              <div className="space-y-3">
                {/* Date Badge */}
                <div className="flex justify-center">
                  <span className="text-[10px] text-slate-600 bg-white/90 px-3 py-1 rounded-md shadow-2xs font-medium">
                    Today
                  </span>
                </div>

                {/* Outgoing Message Bubble (#d9fdd3) */}
                <div className="max-w-[88%] ml-auto space-y-1.5">
                  <div className="bg-[#d9fdd3] text-slate-900 rounded-2xl rounded-tr-xs p-3 shadow-2xs text-xs relative space-y-2">
                    {/* Media Preview: Image, Video, Document/PDF, or Audio */}
                    {mediaUrl && (
                      <div className="rounded-xl overflow-hidden border border-black/5 bg-black/5">
                        {/* 1. IMAGE PREVIEW */}
                        {mediaType === 'image' && (
                          <img
                            src={mediaUrl}
                            alt="Preview"
                            className="w-full h-auto object-cover max-h-56 rounded-lg"
                            onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                          />
                        )}

                        {/* 2. VIDEO PREVIEW */}
                        {mediaType === 'video' && (
                          <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video flex items-center justify-center group">
                            {mediaUrl.startsWith('data:video') || mediaUrl.startsWith('http') ? (
                              <video
                                src={mediaUrl}
                                controls
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs mb-2">
                                  <Play className="w-6 h-6 fill-white ml-0.5" />
                                </div>
                                <span className="text-xs font-semibold">{fileName || 'WhatsApp Video'}</span>
                                <span className="text-[10px] text-white/60 mt-0.5">{fileSize || 'MP4 Video'}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3. DOCUMENT / PDF PREVIEW */}
                        {mediaType === 'document' && (
                          <div className="p-3 bg-white/90 rounded-lg border border-slate-200/60 flex items-center justify-between gap-3 shadow-2xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 shrink-0">
                                <FileText className="w-5 h-5 stroke-[2]" />
                                <span className="text-[8px] font-black tracking-tighter uppercase leading-none mt-0.5">PDF</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-800 truncate">
                                  {fileName || 'Document.pdf'}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {fileSize || 'PDF Document'} • WhatsApp File
                                </div>
                              </div>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                              <Download className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}

                        {/* 4. AUDIO PREVIEW */}
                        {mediaType === 'audio' && (
                          <div className="p-3 bg-white/90 rounded-lg border border-slate-200/60 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#25d366] text-white flex items-center justify-center shrink-0">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div className="w-2/5 h-full bg-[#25d366] rounded-full" />
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-400">
                                <span>{fileName || 'Voice audio'}</span>
                                <span>0:38</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Body Text / Caption */}
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-800 text-xs">
                      {textMessage || (!mediaUrl ? 'Write your message here...' : '')}
                    </div>

                    {/* Bubble Footer: Timestamp & Blue Checkmarks */}
                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 mt-1">
                      <span>10:30 AM</span>
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.2]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-400 bg-white/70 px-2 py-0.5 rounded-full">
                  🔒 End-to-end encrypted simulator
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: SENT MESSAGES DATABASE HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Sent Messages & Automated Replies Database History
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {dbMessages.length} Records Saved
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live records persisted in Neon PostgreSQL linked to your active session.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDatabaseMessages}
            disabled={isLoadingDb}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
            <span>Refresh Database</span>
          </button>
        </div>

        <div className="p-0 overflow-x-auto">
          {dbMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Database className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">No sent messages recorded in database yet</p>
              <p className="text-[11px] text-slate-400">
                Send a WhatsApp message or test an interactive button above to see it saved into Neon PostgreSQL.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Content / Automated Action</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Instance</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {dbMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {msg.recipient_phone}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          msg.message_type === 'video'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : msg.message_type === 'document' || msg.message_type === 'pdf'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : msg.message_type === 'image'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : msg.message_type === 'audio'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {msg.message_type === 'video' && <Video className="w-2.5 h-2.5" />}
                        {msg.message_type === 'image' && <ImageIcon className="w-2.5 h-2.5" />}
                        {(msg.message_type === 'document' || msg.message_type === 'pdf') && <FileText className="w-2.5 h-2.5" />}
                        {msg.message_type === 'audio' && <Music className="w-2.5 h-2.5" />}
                        <span>{msg.message_type}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs" title={msg.content || msg.caption || msg.file_name || ''}>
                      <div className="flex items-center gap-1.5 truncate">
                        {msg.file_name && (
                          <span className="font-semibold text-slate-800 shrink-0">
                            📎 {msg.file_name}
                          </span>
                        )}
                        <span className="truncate">
                          {msg.content || msg.caption || (msg.media_url ? 'Media attachment' : '-')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${msg.status === 'delivered' || msg.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                      >
                        <Check className="w-3 h-3" />
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {msg.instance_name || 'default'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Just now'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteDbMessage(msg.id)}
                        disabled={deleteId === msg.id}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        title="Delete from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
