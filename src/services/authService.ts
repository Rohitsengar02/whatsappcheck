export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  instance_name?: string;
  api_key?: string;
  server_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  waSuccess?: boolean;
  devOtpHint?: string;
  error?: string;
}

export interface VerifyOtpParams {
  phone: string;
  otp: string;
  name?: string;
  email?: string;
  password?: string;
}

const TOKEN_KEY = 'sengar_wa_auth_token';
const USER_KEY = 'sengar_wa_auth_user';

export const authService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSession(token: string, user: User) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth session', e);
    }
  },

  logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  async register(name: string, email: string, password: string, phone?: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        this.setSession(data.token, data.user);
        return { success: true, message: data.message, user: data.user, token: data.token };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        this.setSession(data.token, data.user);
        return { success: true, message: data.message, user: data.user, token: data.token };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  async loginWithGoogle(userProfile?: { name: string; email: string }): Promise<AuthResponse> {
    try {
      const payload = userProfile || {
        name: 'Google User',
        email: `google.user.${Date.now().toString(36)}@gmail.com`,
      };
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        this.setSession(data.token, data.user);
        return { success: true, message: data.message, user: data.user, token: data.token };
      }
      return { success: false, error: data.error || 'Google login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  async sendWhatsAppOtp(phone: string): Promise<SendOtpResponse> {
    try {
      const res = await fetch('/api/auth/send-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message,
          waSuccess: data.waSuccess,
          devOtpHint: data.devOtpHint,
        };
      }
      return { success: false, error: data.error || 'Failed to dispatch WhatsApp verification code' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  async verifyWhatsAppOtp(params: VerifyOtpParams): Promise<AuthResponse> {
    try {
      if (!params.otp || params.otp.length < 4) {
        return { success: false, error: 'Please enter a valid verification code' };
      }

      const res = await fetch('/api/auth/verify-whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        this.setSession(data.token, data.user);
        return { success: true, message: data.message, user: data.user, token: data.token };
      }
      return { success: false, error: data.error || 'Invalid or expired verification code' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  },

  async loginWithPhone(phone: string, otp: string, name?: string): Promise<AuthResponse> {
    return this.verifyWhatsAppOtp({ phone, otp, name });
  },

  async fetchMe(): Promise<{ success: boolean; user?: User; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      if (res.status === 401 || res.status === 403) {
        this.logout();
      }
      return { success: false, error: data.error || 'Failed to authenticate user' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },

  async updateProfile(updates: {
    name?: string;
    phone?: string;
    instance_name?: string;
    api_key?: string;
    server_url?: string;
  }): Promise<AuthResponse> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, error: data.error || 'Update failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },
};
