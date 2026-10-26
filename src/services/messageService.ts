import { authService } from './authService';

export interface DbMessage {
  id: number;
  user_id?: number | null;
  instance_name?: string;
  recipient_phone: string;
  message_type: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  file_name?: string;
  caption?: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  direction?: 'outgoing' | 'incoming';
  wa_message_id?: string;
  raw_response?: any;
  created_at?: string;
}

export const messageService = {
  async saveMessage(data: Partial<DbMessage>): Promise<{ success: boolean; data?: DbMessage; error?: string }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.error || 'Failed to persist message in database' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving message' };
    }
  },

  async fetchMessages(): Promise<{ success: boolean; messages: DbMessage[]; error?: string }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/messages', {
        method: 'GET',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, messages: json.messages || [] };
      }
      return { success: false, messages: [], error: json.error || 'Failed to fetch messages' };
    } catch (err: any) {
      return { success: false, messages: [], error: err.message || 'Network error fetching messages' };
    }
  },

  async deleteMessage(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      return { success: res.ok && json.success };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async simulateIncomingMessage(data: {
    recipient_phone: string;
    content?: string;
    media_url?: string;
    media_type?: string;
    file_name?: string;
    sender_name?: string;
  }): Promise<{
    success: boolean;
    data?: DbMessage;
    autoReply?: {
      matched: boolean;
      rule?: any;
      responseText?: string;
      mediaUrl?: string;
      savedMsg?: DbMessage;
    } | null;
    error?: string;
  }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/messages/simulate-incoming', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const json = await res.json();
      return {
        success: res.ok && json.success,
        data: json.data,
        autoReply: json.autoReply,
        error: json.error,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async registerButtonTrigger(data: {
    instance_name?: string;
    button_id: string;
    button_text: string;
    response_text: string;
  }): Promise<{ success: boolean; trigger?: any; error?: string }> {
    try {
      const res = await fetch('/api/messages/register-button-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return { success: res.ok && json.success, trigger: json.trigger, error: json.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async triggerButtonAction(data: {
    instance_name?: string;
    button_id: string;
    button_text: string;
    recipient_phone: string;
    custom_response?: string;
    server_url?: string;
    api_key?: string;
  }): Promise<{ success: boolean; responseText?: string; message?: string; error?: string }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/messages/trigger-button-action', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      const json = await res.json();
      return {
        success: res.ok && json.success,
        responseText: json.responseText,
        message: json.message,
        error: json.error,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async fetchTriggers(): Promise<{ success: boolean; triggers: any[]; error?: string }> {
    try {
      const res = await fetch('/api/messages/triggers');
      const json = await res.json();
      return { success: res.ok && json.success, triggers: json.triggers || [] };
    } catch (err: any) {
      return { success: false, triggers: [], error: err.message };
    }
  },

  async sendMessageDirect(params: {
    recipient_phone: string;
    text?: string;
    media_url?: string;
    media_type?: string;
    file_name?: string;
    caption?: string;
    mimetype?: string;
    instance_name?: string;
    server_url?: string;
    api_key?: string;
  }): Promise<{ success: boolean; data?: any; savedMessage?: DbMessage; error?: string }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      const json = await res.json();
      return {
        success: Boolean(json.success),
        data: json.data,
        savedMessage: json.savedMessage,
        error: json.error,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error sending WhatsApp message' };
    }
  },

  async syncWhatsAppMessages(): Promise<{ success: boolean; newCount?: number; autoReplies?: number; error?: string }> {
    try {
      const res = await fetch('/api/messages/sync-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      return {
        success: Boolean(json.success),
        newCount: json.newCount,
        autoReplies: json.autoReplies,
        error: json.error,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
