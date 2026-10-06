export interface WhatsAppConfig {
  baseUrl: string;
  instance: string;
  apiKey: string;
  connectedNumber: string;
  mediaBucket: string;
  useProxy: boolean;
}

export const DEFAULT_CONFIG: WhatsAppConfig = {
  baseUrl: '',
  instance: '',
  apiKey: '',
  connectedNumber: '',
  mediaBucket: '',
  useProxy: false,
};

export type ConnectionStateStatus = 'open' | 'connecting' | 'close' | 'refused' | 'unknown' | 'error';

export interface ConnectionStateData {
  status: ConnectionStateStatus;
  stateText: string;
  instanceName: string;
  lastChecked: number;
  latencyMs?: number;
  rawResponse?: any;
  error?: string;
}

export interface ContactItem {
  id: string;
  name: string;
  phone: string;
  tag: 'Customer' | 'VIP' | 'Lead' | 'Pending Followup' | 'Team';
  lastMessage?: string;
  lastContactedAt?: string;
}

export interface ScheduledMessageItem {
  id: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  scheduledTime: string;
  repeatRule: 'none' | 'daily' | 'weekly' | 'hourly';
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: 'keyword' | 'welcome' | 'off_hours';
  keywords: string[];
  responseType: 'text' | 'media';
  responseText: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document';
  isActive: boolean;
  matchType: 'contains' | 'exact';
  triggerCount: number;
}

export interface BroadcastCampaign {
  id: string;
  title: string;
  recipients: string[];
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document';
  delaySeconds: number;
  status: 'draft' | 'running' | 'completed' | 'paused';
  sentCount: number;
  totalCount: number;
  createdAt: string;
}

export interface MessageLogItem {
  id: string;
  recipientPhone: string;
  recipientName?: string;
  type: 'text' | 'media' | 'broadcast' | 'automation' | 'scheduled' | 'inbox' | 'poll' | 'cart';
  content: string;
  mediaUrl?: string;
  status: 'delivered' | 'sent' | 'failed';
  timestamp: string;
  error?: string;
}

// 1. Drip Sequences
export interface DripStep {
  id: string;
  stepNumber: number;
  delayHours: number;
  title: string;
  message: string;
  mediaUrl?: string;
}

export interface DripSequence {
  id: string;
  name: string;
  description: string;
  triggerEvent: 'on_contact_added' | 'on_lead_signup' | 'on_order_completed';
  steps: DripStep[];
  enrolledCount: number;
  completedCount: number;
  isActive: boolean;
}

// 2. Catalog & Invoicing
export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
}

// 3. Groups Manager
export interface WhatsAppGroup {
  id: string;
  name: string;
  memberCount: number;
  category: 'VIP Customers' | 'Community' | 'Announcements' | 'Internal Team';
  inviteLink: string;
  lastActive: string;
}

// 4. Cart Recovery
export interface AbandonedCartLead {
  id: string;
  customerName: string;
  phone: string;
  cartItems: string;
  cartTotal: number;
  abandonedAt: string;
  recoveryStatus: 'pending' | 'reminded' | 'recovered' | 'dismissed';
}

// 5. Polls & Surveys
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface WhatsAppPoll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  isMultipleChoice: boolean;
  createdAt: string;
  status: 'active' | 'closed';
}

// 6. Live Team Inbox
export interface ChatMessage {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface InboxConversation {
  id: string;
  contactName: string;
  phone: string;
  unreadCount: number;
  avatarColor: string;
  label: 'New Lead' | 'VIP Lead' | 'Urgent' | 'Order Inquiry' | 'Resolved';
  lastMessageTime: string;
  messages: ChatMessage[];
}

// 7 New Super Features:
// Feature 1: Auto Message & Smart Responder Studio
export type AutoTriggerType = 'welcome' | 'away' | 'keyword' | 'faq' | 'instant_lead';

export interface AutoMessageRule {
  id: string;
  title: string;
  triggerType: AutoTriggerType;
  keywords?: string[];
  scheduleHours?: string; // e.g. "After 8:00 PM & Weekends"
  delaySeconds: number;
  responseText: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document';
  quickChips?: string[];
  isActive: boolean;
  triggerCount: number;
  lastTriggered?: string;
}

// Feature 2: AI WhatsApp Copilot & Message Humanizer
export interface AiPromptTemplate {
  id: string;
  title: string;
  category: 'Sales & Conversion' | 'Payment Reminders' | 'Customer Care' | 'Festive & Offers' | 'Anti-Ban Humanizer';
  iconName: string;
  description: string;
  sampleInput: string;
  suggestedPrompt: string;
  generatedSample: string;
}

// Feature 3: QR Code & Click-to-Chat Studio
export interface ClickToChatConfig {
  phone: string;
  prefilledMessage: string;
  buttonLabel: string;
  widgetGreeting: string;
  brandColor: string;
  callToAction: string;
}

// Feature 4: Interactive CTA Buttons & List Menus
export interface InteractiveButtonItem {
  id: string;
  type: 'reply' | 'url' | 'call';
  label: string;
  payloadOrUrl: string;
}

export interface InteractiveMenuListSection {
  title: string;
  rows: { id: string; title: string; description: string }[];
}

export interface InteractiveMessagePreset {
  id: string;
  title: string;
  category: 'Quick Actions' | 'Product Catalog Menu' | 'Service Booking' | 'Customer Support Routing';
  bodyText: string;
  footerText?: string;
  buttons?: InteractiveButtonItem[];
  menuSections?: InteractiveMenuListSection[];
}

// Feature 5: Smart Number Cleanser & WhatsApp Validator
export interface ValidatedNumberItem {
  id: string;
  rawInput: string;
  formattedNumber: string;
  countryCode: string;
  isValidWhatsApp: boolean;
  status: 'valid' | 'invalid' | 'checking';
  jid?: string;
  checkedAt: string;
}

// Feature 6: Webhooks Live Receiver & Event Stream
export interface WebhookEventLog {
  id: string;
  event: 'MESSAGES_UPSERT' | 'MESSAGES_UPDATE' | 'CONNECTION_UPDATE' | 'CALL_OFFER';
  senderPhone: string;
  senderName: string;
  messageText: string;
  timestamp: string;
  instance: string;
  rawPayload: Record<string, any>;
}

// Feature 7: Support Tickets & SLA Escalation Board
export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  category: 'Order Issue' | 'Payment Query' | 'Delivery Status' | 'Product Inquiry' | 'General';
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Waiting on Customer' | 'Resolved';
  assignedAgent: string;
  createdAt: string;
  slaDue: string;
  lastMessageSnippet: string;
}
