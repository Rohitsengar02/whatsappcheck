import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  SlidersHorizontal,
  Star,
  Tag,
  ChevronDown,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Download,
  X,
  Play,
  Check,
  User as LucideUser,
  ExternalLink,
  RefreshCw,
  Plus,
  UserPlus,
  ArrowDownLeft,
  Zap,
  Bot,
  Trash2,
  Cpu,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { InboxConversation, ChatMessage, ContactItem, WhatsAppConfig } from '../../types/dashboard';
import { messageService, DbMessage } from '../../services/messageService';
import { contactService, DbContact } from '../../services/contactService';
import { automationService, DbAutomationRule } from '../../services/automationService';
import { User } from '../../services/authService';
import { sanitizePhoneNumber } from '../../services/whatsappService';

interface LiveInboxViewProps {
  conversations: InboxConversation[];
  onSendMessageReply: (
    convoId: string,
    params:
      | string
      | {
          text?: string;
          mediaUrl?: string;
          mediaType?: 'image' | 'video' | 'audio' | 'document';
          fileName?: string;
          mimetype?: string;
        }
  ) => void;
  config?: WhatsAppConfig;
  contacts?: ContactItem[];
  currentUser?: User | null;
  onSendDirectMessage?: (params: {
    toPhone: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'document';
    fileName?: string;
    caption?: string;
    mimetype?: string;
  }) => Promise<any>;
}

export const LiveInboxView: React.FC<LiveInboxViewProps> = ({
  conversations: _unusedConversations,
  onSendMessageReply,
  config,
  contacts = [],
  currentUser,
  onSendDirectMessage,
}) => {
  // Real conversation list built purely from saved contacts & real database messages (Zero fake demo messages)
  const [conversationsList, setConversationsList] = useState<InboxConversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string>(() => {
    try {
      return sessionStorage.getItem('sengar_wa_selected_convo') || '';
    } catch {
      return '';
    }
  });
  const selectedConvoIdRef = useRef<string>(selectedConvoId);

  useEffect(() => {
    selectedConvoIdRef.current = selectedConvoId;
    if (selectedConvoId) {
      try {
        sessionStorage.setItem('sengar_wa_selected_convo', selectedConvoId);
      } catch {}
    }
  }, [selectedConvoId]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'mine' | 'unassigned'>('all');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState('Rohit Sengar');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New Contact / Start Chat Modal state
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [newContactCountryCode, setNewContactCountryCode] = useState('+91');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactTag, setNewContactTag] = useState('Customer');
  const [newContactFirstMsg, setNewContactFirstMsg] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSaveNotice, setContactSaveNotice] = useState<string | null>(null);

  // Simulate receiver reply state
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulatedReplyText, setSimulatedReplyText] = useState('');
  const [isSimulatingReply, setIsSimulatingReply] = useState(false);

  // Attachment state (Video, PDF, Image, Audio)
  const [attachedFile, setAttachedFile] = useState<{
    file?: File;
    name: string;
    size: string;
    type: 'image' | 'video' | 'audio' | 'document';
    mimetype: string;
    dataUrl: string;
  } | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Right Sidebar Automation State
  const [showAutomationSidebar, setShowAutomationSidebar] = useState(false);
  const [automationRules, setAutomationRules] = useState<DbAutomationRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [automationTab, setAutomationTab] = useState<'rules' | 'create' | 'test'>('rules');

  // New Rule Form State
  const [ruleName, setRuleName] = useState('');
  const [ruleKeywords, setRuleKeywords] = useState('');
  const [ruleResponse, setRuleResponse] = useState('');
  const [ruleMatchType, setRuleMatchType] = useState<'contains' | 'exact'>('contains');
  const [ruleMediaUrl, setRuleMediaUrl] = useState('');
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [ruleNotice, setRuleNotice] = useState<string | null>(null);

  // Live Rule Tester State
  const [testKeywordInput, setTestKeywordInput] = useState('');
  const [testKeywordResult, setTestKeywordResult] = useState<{
    matched?: boolean;
    replyText?: string;
    ruleName?: string;
    matchedKeyword?: string;
  } | null>(null);
  const [isTestingKeyword, setIsTestingKeyword] = useState(false);

  // Load automation rules from Neon DB
  const loadAutomationRules = async () => {
    setIsLoadingRules(true);
    try {
      const res = await automationService.fetchRules();
      if (res.success && res.rules) {
        setAutomationRules(res.rules);
      }
    } catch (e) {
      console.warn('Error loading automation rules:', e);
    } finally {
      setIsLoadingRules(false);
    }
  };

  // Save new or updated rule
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !ruleKeywords.trim() || !ruleResponse.trim()) {
      setRuleNotice('Please provide a rule name, keywords, and response message.');
      return;
    }
    setIsSavingRule(true);
    setRuleNotice(null);
    try {
      const res = await automationService.saveRule({
        name: ruleName.trim(),
        keywords: ruleKeywords.trim(),
        response_text: ruleResponse.trim(),
        match_type: ruleMatchType,
        media_url: ruleMediaUrl.trim() || undefined,
        media_type: ruleMediaUrl.trim() ? 'document' : undefined,
        is_active: true,
      });
      if (res.success && res.rule) {
        setAutomationRules((prev) => [res.rule!, ...prev.filter((r) => r.id !== res.rule!.id)]);
        setRuleName('');
        setRuleKeywords('');
        setRuleResponse('');
        setRuleMediaUrl('');
        setAutomationTab('rules');
        setRuleNotice('Automation rule saved and activated successfully!');
        setTimeout(() => setRuleNotice(null), 3000);
      } else {
        setRuleNotice(res.error || 'Failed to save rule');
      }
    } catch (err: any) {
      setRuleNotice(err.message || 'Error saving rule');
    } finally {
      setIsSavingRule(false);
    }
  };

  // Toggle rule active status
  const handleToggleRule = async (id: number) => {
    try {
      const res = await automationService.toggleRule(id);
      if (res.success && res.rule) {
        setAutomationRules((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: res.rule!.is_active } : r))
        );
      }
    } catch (err) {
      console.warn('Error toggling rule:', err);
    }
  };

  // Delete rule
  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this automation rule?')) return;
    try {
      const res = await automationService.deleteRule(id);
      if (res.success) {
        setAutomationRules((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.warn('Error deleting rule:', err);
    }
  };

  // Test keyword against active rules
  const handleTestKeyword = () => {
    if (!testKeywordInput.trim()) return;
    setIsTestingKeyword(true);
    try {
      const normalized = testKeywordInput.trim().toLowerCase();
      let matchedRule: DbAutomationRule | undefined;
      let matchedKw = '';

      for (const rule of automationRules) {
        if (!rule.is_active) continue;
        const kws = rule.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
        const hit = kws.find((k) =>
          rule.match_type === 'exact' ? normalized === k : normalized.includes(k)
        );
        if (hit) {
          matchedRule = rule;
          matchedKw = hit;
          break;
        }
      }

      if (matchedRule) {
        setTestKeywordResult({
          matched: true,
          replyText: matchedRule.response_text,
          ruleName: matchedRule.name,
          matchedKeyword: matchedKw,
        });
      } else {
        setTestKeywordResult({
          matched: false,
          replyText: '⚠️ No active automation rule matched this keyword. Add or activate a keyword rule.',
        });
      }
    } finally {
      setIsTestingKeyword(false);
    }
  };

  // Trigger quick rule test on active conversation
  const handleTriggerRuleTestOnChat = (rule: DbAutomationRule) => {
    const firstKeyword = rule.keywords.split(',')[0]?.trim();
    if (!firstKeyword) return;
    handleSimulateReceiverReply(firstKeyword);
  };

  // Tracking sets to guarantee strictly single auto-reply delivery per incoming query
  const autoRepliedKeysRef = useRef<Set<string>>(new Set<string>());
  const inFlightPhonesRef = useRef<Set<string>>(new Set<string>());
  const automationRulesRef = useRef<DbAutomationRule[]>([]);
  // Timestamp map for recent replies per phone + text to prevent rapid double-trigger bursts within 15 seconds
  const recentTextReplyTimestampsRef = useRef<Map<string, number>>(new Map<string, number>());
  // Session start time: only auto-reply to messages that arrived recently (within last 3 minutes or during active session)
  const sessionStartTimeRef = useRef<number>(Date.now() - 120000);

  useEffect(() => {
    automationRulesRef.current = automationRules;
  }, [automationRules]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sengar_wa_autoreplied_keys');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          arr.forEach((k) => autoRepliedKeysRef.current.add(k));
        }
      }
    } catch {}
  }, []);

  const markKeyAsReplied = (key: string) => {
    if (!key) return;
    autoRepliedKeysRef.current.add(key);
    try {
      const list = Array.from(autoRepliedKeysRef.current).slice(-500);
      localStorage.setItem('sengar_wa_autoreplied_keys', JSON.stringify(list));
    } catch {}
  };

  const findMatchingRule = (text: string, rules: DbAutomationRule[]): DbAutomationRule | null => {
    if (!text) return null;
    const normalized = text.trim().toLowerCase();
    for (const rule of rules) {
      if (!rule.is_active) continue;
      const keywords = (rule.keywords || '')
        .split(/[,]+/)
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      if (keywords.length === 0) continue;

      const isMatch =
        rule.match_type === 'exact'
          ? keywords.some((k) => normalized === k)
          : keywords.some((k) => normalized.includes(k) || (k.length > 3 && normalized.includes(k)));

      if (isMatch) return rule;
    }
    return null;
  };

  // Autonomous Keyword Auto-Responder: Dispatches EXACTLY ONE WhatsApp reply to contact
  const triggerAutoReplyForIncomingMessage = async (
    phone: string,
    messageText: string,
    messageId?: string,
    preMatchedRule?: DbAutomationRule
  ) => {
    if (!messageText || !phone) return;
    const cleanPhone = sanitizePhoneNumber(phone) || phone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('+') ? phone : `+${cleanPhone}`;
    const normalizedText = messageText.trim().toLowerCase();

    // Deduplication keys
    const idKey = messageId ? `${cleanPhone}_id_${messageId}` : '';
    const recentTextKey = `${cleanPhone}_${normalizedText}`;

    // 1. Guard against in-flight sends or previously replied messages
    if (inFlightPhonesRef.current.has(cleanPhone)) {
      console.log(`[Auto-Responder] Suppressed duplicate: reply already in-flight for ${cleanPhone}`);
      return;
    }

    if (
      (messageId && autoRepliedKeysRef.current.has(messageId)) ||
      (idKey && autoRepliedKeysRef.current.has(idKey))
    ) {
      console.log(`[Auto-Responder] Suppressed duplicate: message ${messageId} from ${cleanPhone} already answered`);
      return;
    }

    const lastReplyTime = recentTextReplyTimestampsRef.current.get(recentTextKey) || 0;
    if (Date.now() - lastReplyTime < 15000) {
      console.log(`[Auto-Responder] Suppressed duplicate: "${messageText}" was answered within last 15s for ${cleanPhone}`);
      return;
    }

    const rulesToSearch =
      automationRulesRef.current.length > 0 ? automationRulesRef.current : automationRules;

    const matchedRule = preMatchedRule || findMatchingRule(messageText, rulesToSearch);
    if (!matchedRule || !matchedRule.is_active) {
      return;
    }

    // 2. Lock immediately before ANY async dispatch
    inFlightPhonesRef.current.add(cleanPhone);
    if (messageId) markKeyAsReplied(messageId);
    if (idKey) markKeyAsReplied(idKey);
    recentTextReplyTimestampsRef.current.set(recentTextKey, Date.now());

    console.log(
      `[Auto-Responder] Dispatching strictly 1 reply for rule "${matchedRule.name}" to ${cleanPhone}`
    );

    const responseText = matchedRule.response_text;
    const autoLocalId = `auto_${Date.now()}`;
    const autoMsg: ChatMessage = {
      id: autoLocalId,
      sender: 'user',
      text: responseText,
      mediaUrl: matchedRule.media_url || undefined,
      mediaType: (matchedRule.media_type as any) || (matchedRule.media_url ? 'document' : undefined),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending' as any,
      direction: 'outgoing',
    };

    // 3. Immediately append outgoing message to chat timeline so it acts as barrier for subsequent checks
    setConversationsList((prev) =>
      prev.map((c) => {
        const cClean = c.phone.replace(/\D/g, '');
        if (cClean === cleanPhone) {
          // Avoid appending if identical text was already appended
          const hasIdenticalRecent = c.messages.slice(-2).some((m) => m.text === responseText);
          if (hasIdenticalRecent) return c;
          return {
            ...c,
            lastMessageTime: autoMsg.timestamp,
            messages: [...c.messages, autoMsg],
          };
        }
        return c;
      })
    );

    try {
      // 4. Dispatch to recipient WhatsApp using onSendDirectMessage or sendMessageDirect
      let isDelivered = false;
      let waMessageId: string | null = null;
      if (onSendDirectMessage) {
        const sendResult = await onSendDirectMessage({
          toPhone: fullPhone,
          text: responseText,
          mediaUrl: matchedRule.media_url || undefined,
          mediaType: (matchedRule.media_type as any) || (matchedRule.media_url ? 'document' : undefined),
        });
        isDelivered = Boolean(sendResult?.success);
        waMessageId = sendResult?.data?.key?.id || null;
      } else {
        const directRes = await messageService.sendMessageDirect({
          recipient_phone: fullPhone,
          text: responseText,
          media_url: matchedRule.media_url || undefined,
          media_type: matchedRule.media_type || (matchedRule.media_url ? 'document' : 'text'),
        });
        isDelivered = Boolean(directRes?.success);
        waMessageId = directRes?.data?.key?.id || null;
      }

      // 5. Update local message status to delivered in chat
      setConversationsList((prev) =>
        prev.map((c) => {
          const cClean = c.phone.replace(/\D/g, '');
          if (cClean === cleanPhone) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === autoLocalId ? { ...m, status: 'delivered' } : m
              ),
            };
          }
          return c;
        })
      );

      // 6. Increment trigger count in state
      setAutomationRules((prev) =>
        prev.map((r) =>
          r.id === matchedRule.id ? { ...r, trigger_count: (r.trigger_count || 0) + 1 } : r
        )
      );
    } catch (err) {
      console.warn('[Auto-Responder Error]:', err);
    } finally {
      // Release in-flight lock after cool-down
      setTimeout(() => {
        inFlightPhonesRef.current.delete(cleanPhone);
      }, 3500);
    }
  };

  const isInitialLoadRef = useRef(true);

  // Load real contacts and messages from Neon PostgreSQL database
  const loadDatabaseData = async (isManualRefresh = false) => {
    if (isInitialLoadRef.current || isManualRefresh) {
      setIsLoading(true);
    }
    try {
      // 0. Trigger real-time sync with Evolution API to ingest any incoming receiver messages
      try {
        await messageService.syncWhatsAppMessages();
      } catch {}

      // 1. Fetch saved contacts from Neon DB
      const contactsRes = await contactService.fetchContacts();
      const dbContacts: DbContact[] = contactsRes.success ? contactsRes.contacts : [];

      // 2. Fetch saved messages from Neon DB (kept in sync in real-time by server engine)
      const messagesRes = await messageService.fetchMessages();
      const dbMessages: DbMessage[] = messagesRes.success ? messagesRes.messages : [];

      // 3. Build unified clean contact map
      const contactMap = new Map<string, InboxConversation>();

      // A) Add contacts from database
      dbContacts.forEach((c) => {
        const clean = sanitizePhoneNumber(c.phone) || c.phone.replace(/\D/g, '');
        if (!clean) return;

        contactMap.set(clean, {
          id: `convo_${clean}`,
          contactName: c.name,
          phone: c.phone.startsWith('+') ? c.phone : `+${c.phone}`,
          unreadCount: 0,
          avatarColor: 'bg-emerald-600',
          label: (c.tag || 'CUSTOMER').toUpperCase(),
          lastMessageTime: c.last_contacted_at ? new Date(c.last_contacted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          messages: [],
        });
      });

      // B) Also merge any contacts from props if not yet in map
      contacts.forEach((c) => {
        const clean = sanitizePhoneNumber(c.phone) || c.phone.replace(/\D/g, '');
        if (clean && !contactMap.has(clean)) {
          contactMap.set(clean, {
            id: `convo_${clean}`,
            contactName: c.name,
            phone: c.phone.startsWith('+') ? c.phone : `+${c.phone}`,
            unreadCount: 0,
            avatarColor: 'bg-teal-600',
            label: (c.tag || 'LEAD').toUpperCase(),
            lastMessageTime: 'Recently',
            messages: [],
          });
        }
      });

      // C) Group real messages into their respective contact thread
      // Sort chronologically ASC (oldest first, newest last) with ID tie-breaker so replies always sort after queries
      const sortedDbMessages = [...dbMessages].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (timeA !== timeB) return timeA - timeB;
        return Number(a.id || 0) - Number(b.id || 0);
      });

      sortedDbMessages.forEach((msg) => {
        const clean = sanitizePhoneNumber(msg.recipient_phone) || msg.recipient_phone.replace(/\D/g, '');
        if (!clean) return;

        // If contact doesn't exist yet, create one for this phone
        if (!contactMap.has(clean)) {
          contactMap.set(clean, {
            id: `convo_${clean}`,
            contactName: msg.recipient_phone,
            phone: msg.recipient_phone,
            unreadCount: 0,
            avatarColor: 'bg-blue-600',
            label: 'DIRECT CHAT',
            lastMessageTime: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            messages: [],
          });
        }

        const convo = contactMap.get(clean)!;
        const isIncoming = msg.direction === 'incoming';
        const chatMsg: ChatMessage & { wa_message_id?: string; raw_id?: number | string; created_at_raw?: string } = {
          id: `db_${msg.id}`,
          sender: isIncoming ? 'contact' : 'user',
          text: msg.content || msg.caption || '',
          mediaUrl: msg.media_url || undefined,
          mediaType: (msg.media_type as any) || (msg.media_url ? 'image' : undefined),
          fileName: msg.file_name || undefined,
          timestamp: msg.created_at
            ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          status: (msg.status as any) || 'delivered',
          direction: msg.direction as any,
          wa_message_id: msg.wa_message_id || undefined,
          raw_id: msg.id,
          created_at_raw: msg.created_at,
        };

        // Add if not already present or identical duplicate
        const isDuplicateInConvo = convo.messages.some(
          (m) =>
            m.id === chatMsg.id ||
            (m.sender === chatMsg.sender &&
              m.text === chatMsg.text &&
              chatMsg.text.length > 0 &&
              m.timestamp === chatMsg.timestamp)
        );
        if (!isDuplicateInConvo) {
          convo.messages.push(chatMsg);
          convo.lastMessageTime = chatMsg.timestamp;
        }
      });

      const conversationArray = Array.from(contactMap.values());

      // Sort conversations so ones with messages or recent contact are at the top
      conversationArray.sort((a, b) => b.messages.length - a.messages.length);

      // Non-destructive merge with previous state so local messages NEVER disappear
      setConversationsList((prevList) => {
        const mergedArray = conversationArray.map((newConvo) => {
          const prevConvo = prevList.find(
            (p) =>
              p.id === newConvo.id ||
              p.phone.replace(/\D/g, '') === newConvo.phone.replace(/\D/g, '')
          );
          if (!prevConvo) return newConvo;

          // Preserve any local messages (e.g. m.id starts with 'local_', 'init_', 'auto_', 'sim_') that are not yet returned from DB
          const localMessages = prevConvo.messages.filter(
            (m) =>
              m.id.startsWith('local_') ||
              m.id.startsWith('init_') ||
              m.id.startsWith('auto_') ||
              m.id.startsWith('sim_')
          );
          const pendingMessages = localMessages.filter((localM) => {
            return !newConvo.messages.some(
              (dbM) =>
                dbM.text === localM.text &&
                dbM.mediaUrl === localM.mediaUrl
            );
          });

          return {
            ...newConvo,
            isStarred: prevConvo.isStarred ?? newConvo.isStarred,
            assignedTo: prevConvo.assignedTo ?? newConvo.assignedTo,
            messages: [...newConvo.messages, ...pendingMessages],
            lastMessageTime:
              pendingMessages.length > 0
                ? pendingMessages[pendingMessages.length - 1].timestamp
                : newConvo.lastMessageTime,
          };
        });

        // Also preserve locally created contacts not yet returned from the database
        const dbPhones = new Set(mergedArray.map((c) => c.phone.replace(/\D/g, '')));
        const extraLocalConvos = prevList.filter(
          (c) => !dbPhones.has(c.phone.replace(/\D/g, ''))
        );

        return [...mergedArray, ...extraLocalConvos];
      });

      // Auto-reply to any unanswered incoming messages that match active keyword automation rules (strictly 1 dispatch)
      conversationArray.forEach((convo) => {
        if (convo.messages.length > 0) {
          const lastMsg: any = convo.messages[convo.messages.length - 1];
          const isIncoming =
            lastMsg.sender === 'contact' || lastMsg.direction === 'incoming';
          const isOutgoing =
            lastMsg.sender === 'user' || lastMsg.direction === 'outgoing';

          // Strictly skip if conversation is already answered
          if (isOutgoing || !isIncoming || !lastMsg.text) return;

          // Check if message is recent (within last 3 minutes)
          const msgCreatedRaw = lastMsg.created_at_raw;
          const msgTimestampMs = msgCreatedRaw ? new Date(msgCreatedRaw).getTime() : Date.now();
          const isRecent = Date.now() - msgTimestampMs < 180000;
          if (!isRecent) return;

          const clean = convo.phone.replace(/\D/g, '');
          const normalized = lastMsg.text.trim().toLowerCase();
          const incomingId = lastMsg.wa_message_id || (lastMsg.raw_id ? String(lastMsg.raw_id) : lastMsg.id) || '';
          const msgIdKey = incomingId ? `${clean}_id_${incomingId}` : '';
          const recentTextKey = `${clean}_${normalized}`;

          // Guard against in-flight or already answered messages
          if (inFlightPhonesRef.current.has(clean)) return;
          if (incomingId && autoRepliedKeysRef.current.has(incomingId)) return;
          if (msgIdKey && autoRepliedKeysRef.current.has(msgIdKey)) return;
          if (autoRepliedKeysRef.current.has(lastMsg.id)) return;

          const lastReplyTime = recentTextReplyTimestampsRef.current.get(recentTextKey) || 0;
          if (Date.now() - lastReplyTime < 15000) return;

          const matched = findMatchingRule(lastMsg.text, automationRulesRef.current);
          if (matched && matched.is_active) {
            console.log(
              `[Auto-Responder] Unanswered keyword "${lastMsg.text}" from ${convo.phone}. Triggering single reply "${matched.name}"`
            );
            // Lock immediately before async execution
            inFlightPhonesRef.current.add(clean);
            if (incomingId) markKeyAsReplied(incomingId);
            if (msgIdKey) markKeyAsReplied(msgIdKey);
            markKeyAsReplied(lastMsg.id);
            recentTextReplyTimestampsRef.current.set(recentTextKey, Date.now());

            triggerAutoReplyForIncomingMessage(convo.phone, lastMsg.text, incomingId, matched);
          }
        }
      });

      // Auto select conversation: strictly preserve currently selected conversation
      setSelectedConvoId((prev) => {
        // 1. If user already selected a conversation and it exists in conversationArray, KEEP IT!
        if (prev && conversationArray.some((c) => c.id === prev)) {
          return prev;
        }
        // 2. Try match by phone digits if ID format differed
        if (prev) {
          const prevClean = prev.replace(/^convo_/, '').replace(/\D/g, '');
          const match = conversationArray.find((c) => c.phone.replace(/\D/g, '') === prevClean);
          if (match) return match.id;
        }
        // 3. Fallback to synchronous ref if state was not yet initialized
        if (selectedConvoIdRef.current) {
          const refClean = selectedConvoIdRef.current.replace(/^convo_/, '').replace(/\D/g, '');
          const match = conversationArray.find(
            (c) => c.id === selectedConvoIdRef.current || c.phone.replace(/\D/g, '') === refClean
          );
          if (match) return match.id;
        }
        // 4. Only if no conversation is selected at all, pick the first
        return conversationArray[0]?.id || '';
      });
    } catch (e) {
      console.warn('Error syncing database contacts & messages', e);
    } finally {
      setIsLoading(false);
      isInitialLoadRef.current = false;
    }
  };

  // Run on mount and periodically every 2.5 seconds for live WhatsApp real-time updates (faster receiving)
  useEffect(() => {
    loadDatabaseData();
    loadAutomationRules();
    const interval = setInterval(() => loadDatabaseData(false), 2500);
    return () => clearInterval(interval);
  }, []);

  const activeConvo =
    conversationsList.find((c) => c.id === selectedConvoId) ||
    conversationsList.find(
      (c) => c.phone.replace(/\D/g, '') === selectedConvoId.replace(/^convo_/, '').replace(/\D/g, '')
    ) ||
    conversationsList[0];

  const prevMsgCountRef = useRef<number>(0);
  const prevSelectedConvoRef = useRef<string>('');

  // Scroll to bottom when selecting a new conversation or when active conversation receives new messages
  useEffect(() => {
    const activeMsgCount = activeConvo?.messages?.length || 0;
    const isNewConvo = prevSelectedConvoRef.current !== selectedConvoId;
    const hasNewMsg = activeMsgCount > prevMsgCountRef.current;

    if (isNewConvo || hasNewMsg) {
      chatBottomRef.current?.scrollIntoView({ behavior: isNewConvo ? 'auto' : 'smooth' });
    }

    prevSelectedConvoRef.current = selectedConvoId;
    prevMsgCountRef.current = activeMsgCount;
  }, [selectedConvoId, activeConvo?.messages?.length]);

  // Check if active contact's latest message is an unanswered incoming message matching a keyword rule
  const lastActiveMsg = activeConvo?.messages[activeConvo.messages.length - 1];
  const isLastMsgFromContact =
    lastActiveMsg &&
    (lastActiveMsg.sender === 'contact' || (lastActiveMsg as any).direction === 'incoming');
  const activeIncomingId = (lastActiveMsg as any)?.wa_message_id || lastActiveMsg?.id;
  const isAlreadyReplied = Boolean(
    activeIncomingId &&
      (autoRepliedKeysRef.current.has(activeIncomingId) ||
        autoRepliedKeysRef.current.has(`${activeConvo?.phone.replace(/\D/g, '')}_id_${activeIncomingId}`))
  );
  const activeIncomingRuleMatch =
    isLastMsgFromContact && !isAlreadyReplied && lastActiveMsg?.text
      ? {
          rule: findMatchingRule(lastActiveMsg.text, automationRules),
          lastMsgText: lastActiveMsg.text,
          msgId: activeIncomingId,
        }
      : null;

  // Filter conversations based on search and selected filter tab
  const filteredConversations = conversationsList.filter((c) => {
    const matchesSearch =
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.label.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'unread') return c.unreadCount > 0;
    if (activeFilter === 'mine') return c.assignedTo === 'Rohit Sengar' || !c.assignedTo;
    if (activeFilter === 'unassigned') return c.assignedTo === 'Unassigned';
    return true;
  });

  // Handle File Upload (Video, PDF, Image, Audio)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let detectedType: 'image' | 'video' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) detectedType = 'image';
    else if (file.type.startsWith('video/')) detectedType = 'video';
    else if (file.type.startsWith('audio/')) detectedType = 'audio';
    else detectedType = 'document';

    const sizeInKb = file.size / 1024;
    const formattedSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${Math.round(sizeInKb)} KB`;

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        file,
        name: file.name,
        size: formattedSize,
        type: detectedType,
        mimetype: file.type || (detectedType === 'document' ? 'application/pdf' : 'application/octet-stream'),
        dataUrl: reader.result as string,
      });
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      console.error('Error reading attached file');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClearAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Create New Contact & Start Conversation
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      setContactSaveNotice('Please enter contact name and phone number.');
      return;
    }

    setIsSavingContact(true);
    setContactSaveNotice(null);

    const fullPhone = newContactPhone.trim().startsWith('+')
      ? newContactPhone.trim()
      : `${newContactCountryCode}${newContactPhone.trim().replace(/^0+/, '')}`;

    const cleanPhone = sanitizePhoneNumber(fullPhone) || fullPhone.replace(/\D/g, '');

    try {
      // 1. Save contact into Neon PostgreSQL database under user profile
      const res = await contactService.saveContact({
        name: newContactName.trim(),
        phone: `+${cleanPhone}`,
        tag: newContactTag,
      });

      // 2. If first message is entered, dispatch to WhatsApp
      if (newContactFirstMsg.trim() && onSendDirectMessage) {
        await onSendDirectMessage({
          toPhone: `+${cleanPhone}`,
          text: newContactFirstMsg.trim(),
        });
      }

      // 3. Create or find conversation item and select it
      const newConvoId = `convo_${cleanPhone}`;
      const newConvo: InboxConversation = {
        id: newConvoId,
        contactName: newContactName.trim(),
        phone: `+${cleanPhone}`,
        unreadCount: 0,
        avatarColor: 'bg-emerald-600',
        label: newContactTag.toUpperCase(),
        lastMessageTime: 'Just now',
        messages: newContactFirstMsg.trim()
          ? [
              {
                id: `init_${Date.now()}`,
                sender: 'user',
                text: newContactFirstMsg.trim(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'delivered',
              },
            ]
          : [],
      };

      setConversationsList((prev) => {
        const filtered = prev.filter((c) => c.phone.replace(/\D/g, '') !== cleanPhone);
        return [newConvo, ...filtered];
      });

      setSelectedConvoId(newConvoId);

      // Reset modal fields
      setNewContactName('');
      setNewContactPhone('');
      setNewContactFirstMsg('');
      setShowNewContactModal(false);
    } catch (err: any) {
      setContactSaveNotice(`Failed to save contact: ${err?.message || 'Error'}`);
    } finally {
      setIsSavingContact(false);
    }
  };

  // Send WhatsApp Reply (Text, Video, PDF, Image, Audio)
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!replyText.trim() && !attachedFile) || !activeConvo) return;

    setIsSending(true);
    const textToSend = replyText.trim();
    const mediaToSend = attachedFile;

    // 1. Create optimistic local message
    const localMsgId = `local_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: localMsgId,
      sender: 'user',
      text: textToSend,
      mediaUrl: mediaToSend?.dataUrl,
      mediaType: mediaToSend?.type,
      fileName: mediaToSend?.name,
      fileSize: mediaToSend?.size,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending' as any,
    };

    // 2. Append to chat timeline immediately for instant UI feedback
    setConversationsList((prev) =>
      prev.map((c) =>
        c.id === activeConvo.id
          ? {
              ...c,
              unreadCount: 0,
              lastMessageTime: newMsg.timestamp,
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    // 3. Reset composer fields right away
    setReplyText('');
    handleClearAttachment();
    setShowEmojiPicker(false);

    try {
      // 4. Dispatch directly to WhatsApp
      let dispatchResult: any = null;
      if (onSendDirectMessage) {
        dispatchResult = await onSendDirectMessage({
          toPhone: activeConvo.phone,
          text: textToSend,
          mediaUrl: mediaToSend?.dataUrl,
          mediaType: mediaToSend?.type,
          fileName: mediaToSend?.name,
          caption: textToSend,
          mimetype: mediaToSend?.mimetype,
        });
      } else if (onSendMessageReply) {
        dispatchResult = await onSendMessageReply(
          activeConvo.id,
          mediaToSend
            ? {
                text: textToSend,
                mediaUrl: mediaToSend.dataUrl,
                mediaType: mediaToSend.type,
                fileName: mediaToSend.name,
                mimetype: mediaToSend.mimetype,
              }
            : textToSend
        );
      } else {
        dispatchResult = await messageService.sendMessageDirect({
          recipient_phone: activeConvo.phone,
          text: textToSend,
          media_url: mediaToSend?.dataUrl,
          media_type: mediaToSend?.type,
          file_name: mediaToSend?.name,
          caption: textToSend,
          mimetype: mediaToSend?.mimetype,
        });
      }

      const isDelivered = Boolean(dispatchResult?.success);

      // Update local message status
      setConversationsList((prev) =>
        prev.map((c) =>
          c.id === activeConvo.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === localMsgId
                    ? { ...m, status: isDelivered ? 'delivered' : 'failed' }
                    : m
                ),
              }
            : c
        )
      );

      // 5. Ensure contact is persisted in Neon PostgreSQL
      try {
        await contactService.saveContact({
          name: activeConvo.contactName,
          phone: activeConvo.phone,
          tag: activeConvo.label,
        });
      } catch (err) {
        console.warn('Notice: contact auto-save', err);
      }

      // 6. Refresh database sync after 1 second so persisted message is synced
      setTimeout(() => {
        loadDatabaseData();
      }, 1000);
    } catch (err) {
      console.error('Error sending reply:', err);
      setConversationsList((prev) =>
        prev.map((c) =>
          c.id === activeConvo.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === localMsgId ? { ...m, status: 'failed' } : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const applyQuickReply = (text: string) => {
    setReplyText(text);
  };

  const toggleStarConvo = (convoId: string) => {
    setConversationsList((prev) =>
      prev.map((c) => (c.id === convoId ? { ...c, isStarred: !c.isStarred } : c))
    );
  };

  // Handle receiver reply simulation with instant keyword auto-response
  const handleSimulateReceiverReply = async (textToSimulate?: string) => {
    if (!activeConvo) return;
    const text = (textToSimulate || simulatedReplyText).trim();
    if (!text) return;

    const clean = activeConvo.phone.replace(/\D/g, '');
    const normalized = text.toLowerCase();
    const recentTextKey = `${clean}_${normalized}`;

    // Mark recent text timestamp to avoid bursts
    recentTextReplyTimestampsRef.current.set(recentTextKey, Date.now());

    setIsSimulatingReply(true);
    try {
      const simRes = await messageService.simulateIncomingMessage({
        recipient_phone: activeConvo.phone,
        content: text,
        sender_name: activeConvo.contactName,
      });

      // Mark the incoming simulated message ID as replied so loadDatabaseData doesn't re-trigger it
      if (simRes?.data?.id) {
        markKeyAsReplied(`id_${simRes.data.id}`);
        markKeyAsReplied(`${clean}_id_${simRes.data.id}`);
        markKeyAsReplied(`db_${simRes.data.id}`);
      }
      if (simRes?.data?.wa_message_id) {
        markKeyAsReplied(`id_${simRes.data.wa_message_id}`);
        markKeyAsReplied(`${clean}_id_${simRes.data.wa_message_id}`);
      }

      // Update local state immediately with incoming receiver message bubble on the left
      const incomingMsg: ChatMessage = {
        id: simRes?.data?.id ? `db_${simRes.data.id}` : `sim_${Date.now()}`,
        sender: 'contact',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
        direction: 'incoming',
      };

      const newMsgs: ChatMessage[] = [incomingMsg];

      // If instant keyword auto-responder was triggered, display outgoing automated reply in real time!
      if (simRes?.autoReply?.matched && simRes.autoReply.responseText) {
        newMsgs.push({
          id: `auto_${Date.now() + 1}`,
          sender: 'user',
          text: simRes.autoReply.responseText,
          mediaUrl: simRes.autoReply.mediaUrl,
          mediaType: simRes.autoReply.mediaUrl ? 'document' : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
          direction: 'outgoing',
        });
      }

      setConversationsList((prev) =>
        prev.map((c) => {
          if (c.id !== activeConvo.id) return c;
          const existingIds = new Set(c.messages.map((m) => m.id));
          const toAdd = newMsgs.filter((m) => !existingIds.has(m.id));
          return {
            ...c,
            lastMessageTime: newMsgs[newMsgs.length - 1].timestamp,
            messages: [...c.messages, ...toAdd],
          };
        })
      );

      setSimulatedReplyText('');
      setShowSimulateModal(false);

      setTimeout(() => {
        loadDatabaseData();
        loadAutomationRules();
      }, 1000);
    } catch (err) {
      console.warn('Error simulating reply:', err);
    } finally {
      setIsSimulatingReply(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col lg:flex-row h-[780px] font-sans antialiased relative">
      {/* LEFT COLUMN: LIVE CUSTOMER CHATS (380px) */}
      <div className="w-full lg:w-[380px] border-r border-slate-200 flex flex-col justify-between shrink-0 bg-white">
        <div className="flex flex-col h-full">
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
            {/* Title, Active badge, and + New Chat button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#25d366]/15 flex items-center justify-center text-[#25d366]">
                  <MessageSquare className="w-4 h-4 fill-[#25d366]" />
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Live Customer Chats</h2>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d]">
                  {conversationsList.length} Active
                </span>

                {/* + New Contact Button */}
                <button
                  type="button"
                  onClick={() => setShowNewContactModal(true)}
                  className="px-2.5 py-1 bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                  title="Create new contact and start conversation"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Search Input with Filter Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/10 transition"
                />
              </div>
              <button
                type="button"
                onClick={() => loadDatabaseData(true)}
                className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 transition cursor-pointer shrink-0"
                title="Refresh contacts & messages from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Filter Pills matching screenshot */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-0.5">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d]'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({conversationsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFilter === 'unread'
                    ? 'bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d] font-bold'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Unread ({conversationsList.filter((c) => c.unreadCount > 0).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('mine')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFilter === 'mine'
                    ? 'bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d] font-bold'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Mine ({conversationsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unassigned')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeFilter === 'unassigned'
                    ? 'bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d] font-bold'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Unassigned (0)
              </button>
            </div>
          </div>

          {/* Contact List */}
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                  <UserPlus className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">No contacts in database yet</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click the button below to add your first customer contact and start chatting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewContactModal(true)}
                  className="px-3.5 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Contact</span>
                </button>
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const isSelected =
                  convo.id === selectedConvoId ||
                  convo.id === activeConvo?.id ||
                  convo.phone.replace(/\D/g, '') === activeConvo?.phone?.replace(/\D/g, '');
                const lastMsg = convo.messages[convo.messages.length - 1];

                return (
                  <div
                    key={convo.id}
                    onClick={() => {
                      setSelectedConvoId(convo.id);
                      selectedConvoIdRef.current = convo.id;
                      try {
                        sessionStorage.setItem('sengar_wa_selected_convo', convo.id);
                      } catch {}
                      setConversationsList((prev) =>
                        prev.map((c) => (c.id === convo.id ? { ...c, unreadCount: 0 } : c))
                      );
                    }}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer select-none ${
                      isSelected ? 'bg-slate-50/90 border-l-4 border-[#22c55e]' : 'hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    {/* Avatar Circle with initials */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full ${
                          convo.avatarColor || 'bg-emerald-600'
                        } text-white font-bold text-xs flex items-center justify-center shadow-2xs`}
                      >
                        {convo.contactName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'WA'}
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-white absolute bottom-0 right-0" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{convo.contactName}</span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">
                          {convo.lastMessageTime}
                        </span>
                      </div>

                      <p className="text-[11.5px] text-slate-500 truncate leading-snug">
                        {lastMsg?.mediaUrl ? (
                          <span className="text-[#65a30d] font-semibold flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {lastMsg.fileName || (lastMsg.mediaType ? `${lastMsg.mediaType.toUpperCase()} File` : 'Attachment')}
                          </span>
                        ) : lastMsg?.text ? (
                          lastMsg.text
                        ) : (
                          <span className="italic text-slate-400">No messages yet • Start chat</span>
                        )}
                      </p>

                      {/* Tag pill */}
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                          {convo.label}
                        </span>

                        {convo.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#22c55e] text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE CHAT TIMELINE & MEDIA COMPOSER */}
      {activeConvo ? (
        <div className="flex-1 flex flex-col justify-between bg-[#efeae2]/40 relative min-w-0">
          {/* Header */}
          <div className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 shadow-2xs z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full ${
                  activeConvo.avatarColor || 'bg-emerald-600'
                } text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0`}
              >
                {activeConvo.contactName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'WA'}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 truncate leading-tight">
                    {activeConvo.contactName}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {activeConvo.phone}
                  </span>
                </div>
                <div className="text-[11px] text-[#22c55e] font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                  <span>Active on WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Automation Button */}
              <button
                type="button"
                onClick={() => setShowAutomationSidebar(!showAutomationSidebar)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                  showAutomationSidebar
                    ? 'border-[#84cc16] bg-[#ecfccb] text-[#3f6212] ring-2 ring-[#84cc16]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="Configure Keywords and Automated Message Responses"
              >
                <Zap
                  className={`w-3.5 h-3.5 ${
                    showAutomationSidebar ? 'text-[#65a30d] fill-[#84cc16]' : 'text-amber-500 fill-amber-400'
                  }`}
                />
                <span>Automation</span>
                {automationRules.filter((r) => r.is_active).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#84cc16] text-white text-[10px] font-black">
                    {automationRules.filter((r) => r.is_active).length}
                  </span>
                )}
              </button>

              {/* Simulate Receiver Reply Button */}
              <button
                type="button"
                onClick={() => setShowSimulateModal(true)}
                className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Test receiver incoming response from customer side"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                <span className="hidden sm:inline">Receive Reply</span>
              </button>

              <button
                type="button"
                onClick={() => toggleStarConvo(activeConvo.id)}
                className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer ${
                  activeConvo.isStarred ? 'text-amber-500 bg-amber-50 border-amber-200' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Star conversation"
              >
                <Star className="w-4 h-4 fill-current" />
              </button>

              <button
                type="button"
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Tag contact"
              >
                <Tag className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Assign Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAssignMenu(!showAssignMenu)}
                  className="px-3.5 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-slate-900 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LucideUser className="w-3.5 h-3.5" />
                  <span>{assignedAgent}</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                </button>

                {showAssignMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-fadeIn">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Assign to Agent
                    </div>
                    {['Rohit Sengar', 'Agent Priya', 'Agent Vikram', 'Unassigned'].map((agent) => (
                      <button
                        key={agent}
                        type="button"
                        onClick={() => {
                          setAssignedAgent(agent);
                          setShowAssignMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-xs text-left transition cursor-pointer flex items-center justify-between ${
                          assignedAgent === agent
                            ? 'bg-[#ecfccb] text-[#3f6212] font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{agent}</span>
                        {assignedAgent === agent && <Check className="w-3 h-3 text-[#65a30d]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Keyword Rule Match Notification Banner */}
          {activeIncomingRuleMatch?.rule && (
            <div className="bg-[#f7fee7] border-b border-[#d9f99d] px-6 py-2.5 flex items-center justify-between text-xs text-[#3f6212] shrink-0 z-10 animate-fadeIn">
              <div className="flex items-center gap-2 min-w-0">
                <Zap className="w-4 h-4 text-[#84cc16] fill-[#84cc16] shrink-0 animate-bounce" />
                <span className="truncate">
                  Receiver asked <strong>"{activeIncomingRuleMatch.lastMsgText}"</strong> — Auto-Rule: <strong>{activeIncomingRuleMatch.rule.name}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  triggerAutoReplyForIncomingMessage(
                    activeConvo.phone,
                    activeIncomingRuleMatch.lastMsgText,
                    activeIncomingRuleMatch.msgId
                  )
                }
                className="px-3 py-1 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold rounded-lg transition shadow-2xs text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Send className="w-3 h-3 fill-white" />
                <span>Dispatch Auto-Reply</span>
              </button>
            </div>
          )}

          {/* Chat Messages Timeline */}
          <div
            className="flex-1 p-6 overflow-y-auto space-y-4 relative"
            style={{
              backgroundImage: `radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          >
            {/* Centered Date Badge */}
            <div className="flex justify-center select-none">
              <span className="text-[11px] text-slate-500 bg-white/90 px-3 py-1 rounded-md shadow-2xs font-semibold border border-slate-200/50">
                Today
              </span>
            </div>

            {/* Zero Fake Messages: If empty, show clean empty state */}
            {activeConvo.messages.length === 0 ? (
              <div className="max-w-md mx-auto my-12 bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#ecfccb] text-[#3f6212] mx-auto flex items-center justify-center font-bold text-sm">
                  {activeConvo.contactName.slice(0, 2).toUpperCase()}
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Conversation with {activeConvo.contactName}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No messages exchanged yet. Send a WhatsApp text, or attach a video, image, or document below to start chatting live.
                </p>
                <div className="pt-2 font-mono text-[11px] text-[#22c55e] font-semibold">
                  Recipient: {activeConvo.phone}
                </div>
              </div>
            ) : (
              activeConvo.messages.map((msg) => {
                const isMe = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[76%] rounded-2xl p-3.5 shadow-2xs text-xs relative space-y-1.5 ${
                        isMe
                          ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs'
                          : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200/60'
                      }`}
                    >
                      {/* Sender identification for receiver messages */}
                      {!isMe && (
                        <div className="text-[10.5px] font-bold text-emerald-800 flex items-center gap-1.5 pb-0.5 select-none">
                          <span>{activeConvo.contactName}</span>
                          <span className="text-[9px] font-normal text-slate-400 font-mono">({activeConvo.phone})</span>
                        </div>
                      )}
                      {/* Media message rendering: Video, Image, PDF, Audio */}
                      {msg.mediaUrl && (
                        <div className="rounded-xl overflow-hidden border border-black/5 bg-black/5 mb-1.5">
                          {/* 1. Image */}
                          {msg.mediaType === 'image' && (
                            <img
                              src={msg.mediaUrl}
                              alt="Attached image"
                              className="w-full h-auto object-cover max-h-56 rounded-lg cursor-pointer hover:opacity-95 transition"
                              onClick={() => window.open(msg.mediaUrl, '_blank')}
                            />
                          )}

                          {/* 2. Video */}
                          {msg.mediaType === 'video' && (
                            <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
                              {msg.mediaUrl.startsWith('data:video') || msg.mediaUrl.startsWith('http') ? (
                                <video src={msg.mediaUrl} controls className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <div className="flex flex-col items-center justify-center text-white p-4">
                                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs mb-1.5">
                                    <Play className="w-5 h-5 fill-white ml-0.5" />
                                  </div>
                                  <span className="text-xs font-semibold">{msg.fileName || 'WhatsApp Video'}</span>
                                  <span className="text-[10px] text-white/60">{msg.fileSize || 'MP4 Video'}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 3. Document / PDF */}
                          {(msg.mediaType === 'document' || msg.mediaType === 'pdf') && (
                            <div className="p-3 bg-white/95 rounded-lg border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 shrink-0">
                                  <FileText className="w-4 h-4 stroke-[2]" />
                                  <span className="text-[7.5px] font-black uppercase leading-none mt-0.5">PDF</span>
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-800 truncate">
                                    {msg.fileName || 'Document.pdf'}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-medium">
                                    {msg.fileSize || 'PDF Document'} • WhatsApp File
                                  </div>
                                </div>
                              </div>
                              <a
                                href={msg.mediaUrl}
                                download={msg.fileName || 'document.pdf'}
                                target="_blank"
                                rel="noreferrer"
                                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition shrink-0"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}

                          {/* 4. Audio */}
                          {msg.mediaType === 'audio' && (
                            <div className="p-2.5 bg-white/95 rounded-lg border border-slate-200 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#25d366] text-white flex items-center justify-center shrink-0">
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="w-3/5 h-full bg-[#25d366] rounded-full" />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>{msg.fileName || 'Voice audio'}</span>
                                  <span>0:42</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text Body */}
                      {msg.text && (
                        <p className="leading-relaxed whitespace-pre-wrap text-slate-800 text-xs">
                          {msg.text}
                        </p>
                      )}

                      {/* Timestamp & checkmarks */}
                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] ${
                          isMe ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          msg.status === 'failed' ? (
                            <span className="text-rose-500 text-[10px] font-bold" title="Delivery failed">⚠️</span>
                          ) : msg.status === 'sending' || msg.status === 'pending' ? (
                            <Clock className="w-3 h-3 text-slate-400 animate-pulse" />
                          ) : (
                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.2]" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Replies Bar */}
          <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none select-none">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick Replies:
            </span>

            {[
              { text: 'Yes, order is confirmed', active: true },
              { text: 'Thank you for contacting us!', active: false },
              { text: 'We have received your payment', active: false },
              { text: 'Let me connect you with our specialist', active: false },
            ].map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyQuickReply(reply.text)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition cursor-pointer ${
                  reply.active
                    ? 'bg-[#ecfccb] text-[#3f6212] font-semibold border border-[#d9f99d]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 font-medium'
                }`}
              >
                {reply.text}
              </button>
            ))}

            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0 ml-auto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Composer Bar with Media Paperclip & Circular Send Button */}
          <div className="p-4 bg-white border-t border-slate-200">
            {/* Attachment preview chip if a file is selected */}
            {attachedFile && (
              <div className="mb-2 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      attachedFile.type === 'video'
                        ? 'bg-purple-100 text-purple-600'
                        : attachedFile.type === 'document'
                        ? 'bg-rose-100 text-rose-600'
                        : attachedFile.type === 'audio'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {attachedFile.type === 'video' && <Video className="w-4 h-4" />}
                    {attachedFile.type === 'document' && <FileText className="w-4 h-4" />}
                    {attachedFile.type === 'audio' && <Music className="w-4 h-4" />}
                    {attachedFile.type === 'image' && <ImageIcon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {attachedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {attachedFile.type.toUpperCase()} • {attachedFile.size}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearAttachment}
                  className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Hidden File Input for Video, PDF, Images, Audio */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,application/pdf,.pdf,.doc,.docx,.xlsx,.txt,audio/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <form onSubmit={handleSendReply} className="flex items-center gap-3">
              {/* Emoji Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5 stroke-[1.8]" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xl z-30 flex items-center gap-1.5 flex-wrap w-60 animate-fadeIn">
                    {['👋', '🚀', '🍕', '🎉', '✅', '📦', '💬', '🔥', '⭐', '❤️', '💡', '📞'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setReplyText((prev) => `${prev} ${emoji}`);
                          setShowEmojiPicker(false);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-base cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Input Field */}
              <input
                type="text"
                placeholder="Type your WhatsApp reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/10 transition"
              />

              {/* Paperclip Media Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isReadingFile}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Attach Video, PDF, Image, or Audio"
              >
                {isReadingFile ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#84cc16]" />
                ) : (
                  <Paperclip className="w-5 h-5 stroke-[1.8]" />
                )}
              </button>

              {/* Circular Green Send Button */}
              <button
                type="submit"
                disabled={(!replyText.trim() && !attachedFile) || isSending}
                className="w-11 h-11 rounded-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-md shadow-[#22c55e]/25 transition cursor-pointer active:scale-95"
                title="Send WhatsApp message"
              >
                <Send className={`w-4 h-4 ml-0.5 fill-white stroke-[1.5] ${isSending ? 'animate-bounce' : ''}`} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <MessageSquare className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-slate-800">Select or create a contact to start conversation</p>
            <p className="text-xs text-slate-500 max-w-sm">
              All messages are saved directly into your database. Click "+ New" to add a new contact or choose one from the list.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewContactModal(true)}
            className="px-4 py-2.5 bg-[#84cc16] hover:bg-[#65a30d] text-white font-bold rounded-xl text-xs transition shadow-md shadow-[#84cc16]/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Contact & Start Chat</span>
          </button>
        </div>
      )}

      {/* Floating Right Edge Automation Toggle Button (When sidebar is collapsed) */}
      {!showAutomationSidebar && (
        <button
          type="button"
          onClick={() => setShowAutomationSidebar(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-[#f7fee7] border border-r-0 border-slate-200 hover:border-[#84cc16] py-3.5 px-2 rounded-l-xl shadow-lg text-slate-600 hover:text-[#3f6212] transition cursor-pointer flex flex-col items-center gap-1.5 group select-none"
          title="Open Keyword Automation Sidebar"
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-400 group-hover:scale-110 transition" />
          <span className="text-[10px] font-black tracking-wider [writing-mode:vertical-rl] rotate-180 uppercase text-slate-500 group-hover:text-[#3f6212]">
            Automation
          </span>
          {automationRules.filter((r) => r.is_active).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#84cc16] text-white text-[9px] font-black flex items-center justify-center">
              {automationRules.filter((r) => r.is_active).length}
            </span>
          )}
        </button>
      )}

      {/* RIGHT SIDEBAR: KEYWORD AUTOMATIONS DRAWER / PANEL */}
      {showAutomationSidebar && (
        <div className="w-full lg:w-[380px] xl:w-[410px] border-l border-slate-200 flex flex-col justify-between shrink-0 bg-white z-20 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-white space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#ecfccb] text-[#3f6212] flex items-center justify-center shadow-2xs">
                  <Zap className="w-4 h-4 fill-[#84cc16]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Keyword Automation</h3>
                  <p className="text-[10.5px] text-slate-400">Instant 24/7 WhatsApp auto-reply</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d]">
                  {automationRules.filter((r) => r.is_active).length} Active
                </span>
                <button
                  type="button"
                  onClick={() => setShowAutomationSidebar(false)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
                  title="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Performance Banner */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-lime-50 to-emerald-50 border border-emerald-200/70 text-[11px] text-emerald-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2]" />
              <span className="font-medium">
                <strong>Sub-second engine:</strong> Incoming receiver messages matching keywords get replies in real time.
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold select-none">
              <button
                type="button"
                onClick={() => setAutomationTab('rules')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center ${
                  automationTab === 'rules'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Rules ({automationRules.length})
              </button>
              <button
                type="button"
                onClick={() => setAutomationTab('create')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                  automationTab === 'create'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Rule</span>
              </button>
              <button
                type="button"
                onClick={() => setAutomationTab('test')}
                className={`flex-1 py-1.5 rounded-lg transition cursor-pointer text-center ${
                  automationTab === 'test'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Test Live
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200">
            {/* TAB 1: RULES LIST */}
            {automationTab === 'rules' && (
              <div className="space-y-3">
                {isLoadingRules && (
                  <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#84cc16]" />
                    <span className="text-xs">Loading rules from Neon DB...</span>
                  </div>
                )}

                {ruleNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{ruleNotice}</span>
                  </div>
                )}

                {automationRules.length === 0 && !isLoadingRules ? (
                  <div className="p-8 text-center text-slate-400 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                      <Bot className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">No automation rules yet</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Create your first keyword trigger to auto-respond to customer inquiries instantly.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutomationTab('create')}
                      className="px-3.5 py-1.5 bg-[#84cc16] hover:bg-[#65a30d] text-white text-xs font-bold rounded-xl transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Rule</span>
                    </button>
                  </div>
                ) : (
                  automationRules.map((rule) => {
                    const kws = rule.keywords
                      .split(/[,]+/)
                      .map((k) => k.trim())
                      .filter(Boolean);

                    return (
                      <div
                        key={rule.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          rule.is_active
                            ? 'bg-white border-slate-200 shadow-2xs hover:border-[#84cc16]/50'
                            : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                        }`}
                      >
                        {/* Title and Active Toggle */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 truncate">{rule.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                                {rule.match_type === 'exact' ? 'Exact Match' : 'Contains'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                🔥 {rule.trigger_count || 0} hits
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id)}
                            className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                              rule.is_active ? 'bg-[#22c55e] justify-end' : 'bg-slate-300 justify-start'
                            }`}
                            title={rule.is_active ? 'Click to Pause Rule' : 'Click to Activate Rule'}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                          </button>
                        </div>

                        {/* Keyword Chips */}
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {kws.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#f7fee7] text-[#3f6212] border border-[#d9f99d]"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>

                        {/* Response Text preview bubble */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed font-sans mb-3 line-clamp-3">
                          {rule.response_text}
                          {rule.media_url && (
                            <span className="block mt-1 text-[10px] text-[#65a30d] font-bold">
                              📎 Attachment: {rule.media_url.slice(0, 32)}...
                            </span>
                          )}
                        </div>

                        {/* Rule Card Footer Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          {/* Test in active chat button */}
                          <button
                            type="button"
                            onClick={() => handleTriggerRuleTestOnChat(rule)}
                            disabled={!activeConvo}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed text-indigo-700 font-bold transition flex items-center gap-1 cursor-pointer"
                            title={
                              activeConvo
                                ? `Simulate customer texting "${kws[0] || 'keyword'}" on active chat`
                                : 'Select a contact to test on live chat'
                            }
                          >
                            <ArrowDownLeft className="w-3 h-3 text-indigo-600 stroke-[2.5]" />
                            <span>Test on Chat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                            title="Delete rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: CREATE NEW RULE */}
            {automationTab === 'create' && (
              <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
                {ruleNotice && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    {ruleNotice}
                  </div>
                )}

                {/* Rule Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rule Name *</label>
                  <input
                    type="text"
                    required
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. Pricing & Quotation Bot"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/10"
                  />
                </div>

                {/* Keywords input with live preview */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trigger Keywords (Comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={ruleKeywords}
                    onChange={(e) => setRuleKeywords(e.target.value)}
                    placeholder="e.g. price, pricing, cost, quote, catalog"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/10 font-mono text-xs"
                  />
                  {ruleKeywords.trim() && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ruleKeywords
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ecfccb] text-[#3f6212] border border-[#d9f99d]"
                          >
                            #{kw}
                          </span>
                        ))}
                    </div>
                  )}
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    When customer sends any of these keywords, the response fires automatically.
                  </p>
                </div>

                {/* Match Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Match Type</label>
                  <select
                    value={ruleMatchType}
                    onChange={(e) => setRuleMatchType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] bg-white cursor-pointer"
                  >
                    <option value="contains">Contains Keyword (e.g. "What is your price?") - Recommended</option>
                    <option value="exact">Exact Match (Message must strictly equal keyword)</option>
                  </select>
                </div>

                {/* Automated Message Response */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Message Response *</label>
                    <div className="flex items-center gap-1">
                      {['👋', '📄', '📦', '✅', '⭐', '💳'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setRuleResponse((prev) => `${prev} ${em}`)}
                          className="hover:scale-125 transition cursor-pointer text-xs"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={ruleResponse}
                    onChange={(e) => setRuleResponse(e.target.value)}
                    placeholder="Enter the automated WhatsApp response..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/10 text-xs leading-relaxed"
                  />
                </div>

                {/* Optional Media URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Media Attachment URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={ruleMediaUrl}
                    onChange={(e) => setRuleMediaUrl(e.target.value)}
                    placeholder="https://example.com/pricing-brochure.pdf"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Optional link to brochure PDF, image, or price catalog file.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSavingRule}
                  className="w-full py-2.5 px-4 bg-[#84cc16] hover:bg-[#65a30d] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-[#84cc16]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isSavingRule ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Neon DB...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Save & Activate Rule</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: LIVE TESTER */}
            {automationTab === 'test' && (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed text-[11.5px]">
                  Test your active keyword rules in real time. Type a customer query below to verify instant matching and response speed.
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">Simulate Customer Message</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testKeywordInput}
                      onChange={(e) => setTestKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTestKeyword()}
                      placeholder="e.g. Can you tell me the price?"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleTestKeyword}
                      disabled={isTestingKeyword || !testKeywordInput.trim()}
                      className="px-3 py-2 bg-[#84cc16] hover:bg-[#65a30d] disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer shrink-0"
                    >
                      {isTestingKeyword ? 'Testing...' : 'Test Match'}
                    </button>
                  </div>
                </div>

                {/* Quick Test Keywords */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Samples:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['price', 'hello', 'order status', 'support'].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => {
                          setTestKeywordInput(sample);
                        }}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10.5px] font-medium transition cursor-pointer"
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result Display */}
                {testKeywordResult && (
                  <div
                    className={`p-3.5 rounded-2xl border transition animate-fadeIn space-y-2 ${
                      testKeywordResult.matched
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {testKeywordResult.matched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Matched Rule: {testKeywordResult.ruleName}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>No Match Found</span>
                        </>
                      )}
                    </div>

                    {testKeywordResult.matchedKeyword && (
                      <div className="text-[11px] text-emerald-800">
                        Triggered by keyword: <strong>#{testKeywordResult.matchedKeyword}</strong>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-white border border-black/5 text-[11px] leading-relaxed">
                      {testKeywordResult.replyText}
                    </div>

                    {testKeywordResult.matched && activeConvo && (
                      <button
                        type="button"
                        onClick={() => handleSimulateReceiverReply(testKeywordInput)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Send Test in Active Chat ({activeConvo.contactName})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW CONTACT & START CONVERSATION MODAL */}
      {showNewContactModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ecfccb] text-[#3f6212] flex items-center justify-center">
                  <UserPlus className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Create Contact & Start Chat</h3>
                  <p className="text-[11px] text-slate-400">Save to Neon PostgreSQL & open conversation thread</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewContactModal(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error / Alert notice */}
            {contactSaveNotice && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {contactSaveNotice}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
              {/* Contact Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Full Name *</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/10"
                />
              </div>

              {/* Phone Number with country selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                <div className="flex items-center border border-slate-200 rounded-xl focus-within:border-[#84cc16] focus-within:ring-2 focus-within:ring-[#84cc16]/10 overflow-hidden">
                  <select
                    value={newContactCountryCode}
                    onChange={(e) => setNewContactCountryCode(e.target.value)}
                    className="px-2.5 py-2 bg-slate-50 border-r border-slate-200 text-slate-700 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="+91">🇮🇳 +91 (India)</option>
                    <option value="+1">🇺🇸 +1 (USA)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+971">🇦🇪 +971 (UAE)</option>
                    <option value="+55">🇧🇷 +55 (Brazil)</option>
                    <option value="+49">🇩🇪 +49 (Germany)</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 px-3 py-2 font-mono text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tag / Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category / Tag</label>
                <select
                  value={newContactTag}
                  onChange={(e) => setNewContactTag(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] bg-white cursor-pointer"
                >
                  <option value="Customer">Customer</option>
                  <option value="VIP Lead">VIP Lead</option>
                  <option value="Order Inquiry">Order Inquiry</option>
                  <option value="Support">Support</option>
                  <option value="Sales">Sales</option>
                  <option value="New Lead">New Lead</option>
                </select>
              </div>

              {/* First Message (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Message (Optional)</label>
                <textarea
                  rows={2}
                  value={newContactFirstMsg}
                  onChange={(e) => setNewContactFirstMsg(e.target.value)}
                  placeholder="Type a message to send immediately on WhatsApp..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#84cc16] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewContactModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingContact}
                  className="px-4 py-2 bg-[#84cc16] hover:bg-[#65a30d] disabled:opacity-50 text-white font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingContact ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save & Start Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATE INCOMING RECEIVER REPLY MODAL */}
      {showSimulateModal && activeConvo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Receive WhatsApp Message
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    From {activeConvo.contactName} ({activeConvo.phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Choose a quick reply from the customer or enter a custom message. It will be recorded as an incoming message from <strong>{activeConvo.contactName}</strong> and displayed immediately in the chat thread.
            </p>

            {/* Quick response buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Customer Replies:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  'Hello! I received your message. Thank you! 👍',
                  'Could you please send me your product catalog / pricing?',
                  'Confirmed! Please process my order as discussed. 📦',
                  'I have a question regarding my account.',
                ].map((quickText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSimulatingReply}
                    onClick={() => handleSimulateReceiverReply(quickText)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/60 text-slate-700 text-left text-xs transition cursor-pointer flex items-center justify-between group"
                  >
                    <span>{quickText}</span>
                    <ArrowDownLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reply Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimulateReceiverReply();
              }}
              className="space-y-3 pt-2 border-t border-slate-100"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or Type Custom Customer Reply:
                </label>
                <textarea
                  rows={2}
                  value={simulatedReplyText}
                  onChange={(e) => setSimulatedReplyText(e.target.value)}
                  placeholder="e.g. Yes, I'm ready to proceed..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!simulatedReplyText.trim() || isSimulatingReply}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSimulatingReply ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  )}
                  <span>Receive as Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
