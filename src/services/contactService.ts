import { authService } from './authService';

export interface DbContact {
  id: number;
  user_id?: number | null;
  name: string;
  phone: string;
  tag: string;
  notes?: string;
  last_contacted_at?: string;
  created_at?: string;
}

export const contactService = {
  async fetchContacts(): Promise<{ success: boolean; contacts: DbContact[]; error?: string }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/contacts', {
        method: 'GET',
        headers,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, contacts: json.contacts || [] };
      }
      return { success: false, contacts: [], error: json.error || 'Failed to fetch contacts' };
    } catch (err: any) {
      return { success: false, contacts: [], error: err.message || 'Network error fetching contacts' };
    }
  },

  async saveContact(contact: {
    name: string;
    phone: string;
    tag?: string;
    notes?: string;
  }): Promise<{ success: boolean; contact?: DbContact; error?: string }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers,
        body: JSON.stringify(contact),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, contact: json.contact };
      }
      return { success: false, error: json.error || 'Failed to save contact in database' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error saving contact' };
    }
  },

  async deleteContact(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers,
      });

      const json = await res.json();
      return { success: res.ok && json.success, error: json.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error deleting contact' };
    }
  },
};
