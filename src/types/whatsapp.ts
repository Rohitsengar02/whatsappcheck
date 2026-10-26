export interface WhatsAppConfig {
  baseUrl: string;
  instance: string;
  apiKey: string;
  connectedNumber: string;
  mediaBucket: string;
  useProxy: boolean;
}

export const DEFAULT_CONFIG: WhatsAppConfig = {
  baseUrl: 'https://www.bitechez.com',
  instance: 'user_rjx6ebs',
  apiKey: '429683C4C977415CAAFCCE10F7D57E11',
  connectedNumber: '919761304821',
  mediaBucket: '',
  useProxy: true,
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

export interface WhatsAppNumberVerification {
  number: string;
  exists: boolean;
  jid?: string;
  name?: string;
  raw?: any;
}

export interface TemplateVariable {
  key: string;
  label: string;
  defaultValue: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  description: string;
  category: 'orders' | 'marketing' | 'verification' | 'support' | 'documents';
  type: 'text' | 'media';
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  fileName?: string;
  caption?: string;
  text: string;
  variables: TemplateVariable[];
}

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  title: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  endpoint: string;
  fullUrl: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  status: number;
  statusText: string;
  durationMs: number;
  responseBody: any;
  isError: boolean;
  curl: string;
}
