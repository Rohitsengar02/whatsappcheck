import { authService } from './authService';

export interface DbAutomationRule {
  id: number;
  user_id?: number | null;
  name: string;
  keywords: string;
  response_text: string;
  media_url?: string | null;
  media_type?: string | null;
  match_type: 'contains' | 'exact';
  is_active: boolean;
  trigger_count: number;
  created_at?: string;
}

export const automationService = {
  async fetchRules(): Promise<{
    success: boolean;
    rules: DbAutomationRule[];
    error?: string;
  }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/automations', {
        method: 'GET',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, rules: json.rules || [] };
      }
      return { success: false, rules: [], error: json.error || 'Failed to fetch rules' };
    } catch (err: any) {
      return { success: false, rules: [], error: err.message || 'Network error fetching rules' };
    }
  },

  async saveRule(rule: {
    id?: number;
    name: string;
    keywords: string | string[];
    response_text: string;
    media_url?: string;
    media_type?: string;
    match_type?: 'contains' | 'exact';
    is_active?: boolean;
  }): Promise<{
    success: boolean;
    rule?: DbAutomationRule;
    error?: string;
    message?: string;
  }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/automations', {
        method: 'POST',
        headers,
        body: JSON.stringify(rule),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, rule: json.rule, message: json.message };
      }
      return { success: false, error: json.error || 'Failed to save automation rule' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving automation rule' };
    }
  },

  async toggleRule(id: number): Promise<{
    success: boolean;
    rule?: DbAutomationRule;
    error?: string;
  }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/automations/${id}/toggle`, {
        method: 'PATCH',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, rule: json.rule };
      }
      return { success: false, error: json.error || 'Failed to toggle rule' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error toggling rule' };
    }
  },

  async deleteRule(id: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/automations/${id}`, {
        method: 'DELETE',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed to delete rule' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error deleting rule' };
    }
  },

  async testKeyword(test_text: string): Promise<{
    success: boolean;
    matched: boolean;
    rule?: DbAutomationRule;
    replyText?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/automations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_text }),
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, matched: false, error: err.message };
    }
  },
};
