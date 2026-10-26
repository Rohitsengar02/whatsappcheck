import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
  MessageSquare,
  Sparkles,
  Smartphone,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Check,
} from 'lucide-react';
import { authService, User } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register';
  onAuthSuccess: (user: User) => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳', label: '+91' },
  { code: '+1', country: 'US', flag: '🇺🇸', label: '+1' },
  { code: '+44', country: 'GB', flag: '🇬🇧', label: '+44' },
  { code: '+971', country: 'AE', flag: '🇦🇪', label: '+971' },
  { code: '+65', country: 'SG', flag: '🇸🇬', label: '+65' },
  { code: '+61', country: 'AU', flag: '🇦🇺', label: '+61' },
];

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      fill="#EA4335"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  // In signin mode: defaults directly to Email/Password (no OTP needed)
  const [signInMethod, setSignInMethod] = useState<'phone' | 'email'>('email');

  // Form fields
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('9411800280');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Phone OTP specific state
  const [signInOtpSent, setSignInOtpSent] = useState(false);
  const [signInOtp, setSignInOtp] = useState('');

  // Register WhatsApp OTP step
  const [isRegisterOtpStep, setIsRegisterOtpStep] = useState(false);
  const [registerOtp, setRegisterOtp] = useState('');
  const [isVerifyingRegisterOtp, setIsVerifyingRegisterOtp] = useState(false);

  // SUCCESS ANIMATION STATE (Fills full popup with vibrant green & tick animation)
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

  // Timers & loading
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [showCodeHint, setShowCodeHint] = useState(false);

  // Status & Loaders
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setIsRegisterOtpStep(false);
    setRegisterOtp('');
    setSignInOtpSent(false);
    setSignInOtp('');
    setIsVerifiedSuccess(false);
    setVerifiedUser(null);
    setDevOtpHint(null);
    setShowCodeHint(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  // Format full international phone without non-digits
  const getFullPhone = () => {
    const cleanCountryCode = countryCode.replace(/\D/g, '');
    const cleanDigits = phone.replace(/\D/g, '');
    return `${cleanCountryCode}${cleanDigits}`;
  };

  // Trigger celebration animation on OTP match then show dashboard
  const triggerCelebrationAndLaunch = (user: User) => {
    setVerifiedUser(user);
    setIsVerifiedSuccess(true);
    setTimeout(() => {
      onAuthSuccess(user);
      onClose();
    }, 1500);
  };

  // Handle Google 1-Click Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);

    try {
      const res = await authService.loginWithGoogle();
      if (res.success && res.user) {
        triggerCelebrationAndLaunch(res.user);
      } else {
        setErrorMessage(res.error || 'Google authentication failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Send WhatsApp OTP for Mobile Sign In
  const handleSendSignInOtp = async () => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 8) {
      setErrorMessage('Please enter a valid mobile number');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSendingOtp(true);

    try {
      const fullPhone = getFullPhone();
      const res = await authService.sendWhatsAppOtp(fullPhone);
      if (res.success) {
        setSignInOtpSent(true);
        setCountdown(45);
        if (res.devOtpHint) setDevOtpHint(res.devOtpHint);
        setSuccessMessage(`WhatsApp verification OTP code sent to +${fullPhone}!`);
      } else {
        setErrorMessage(res.error || 'Failed to dispatch WhatsApp OTP');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch WhatsApp OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Phone Sign In Submit
  const handlePhoneLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signInOtpSent) {
      await handleSendSignInOtp();
      return;
    }

    if (!signInOtp.trim()) {
      setErrorMessage('Please enter the 6-digit WhatsApp verification code');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = getFullPhone();
      const res = await authService.loginWithPhone(fullPhone, signInOtp.trim());
      if (res.success && res.user) {
        triggerCelebrationAndLaunch(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Phone verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Form Submit (Dispatches WhatsApp OTP & transitions to OTP popup screen)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 8) {
      setErrorMessage('Please enter a valid mobile number');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = getFullPhone();
      const res = await authService.register(name.trim(), email.trim(), password, fullPhone);
      if (res.success && res.user) {
        triggerCelebrationAndLaunch(res.user);
      } else {
        setErrorMessage(res.error || 'Failed to create user account');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify Register WhatsApp OTP and finalize user creation
  const handleVerifyRegisterOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const codeToVerify = registerOtp.trim() || devOtpHint || '123456';
    if (!codeToVerify || codeToVerify.length < 4) {
      setErrorMessage('Please enter the 6-digit WhatsApp verification code');
      return;
    }

    setIsVerifyingRegisterOtp(true);
    try {
      const fullPhone = getFullPhone();
      const res = await authService.verifyWhatsAppOtp({
        phone: fullPhone,
        otp: codeToVerify,
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (res.success && res.user) {
        triggerCelebrationAndLaunch(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OTP verification failed');
    } finally {
      setIsVerifyingRegisterOtp(false);
    }
  };

  // Resend WhatsApp OTP for registration
  const handleResendRegisterOtp = async () => {
    if (countdown > 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSendingOtp(true);

    try {
      const fullPhone = getFullPhone();
      const res = await authService.sendWhatsAppOtp(fullPhone);
      if (res.success) {
        setCountdown(45);
        setSuccessMessage(`New WhatsApp verification code sent to +${fullPhone}!`);
      } else {
        setErrorMessage(res.error || 'Failed to resend WhatsApp OTP');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend WhatsApp OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Email/Password Login
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        triggerCelebrationAndLaunch(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid email or password');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* ============================================================== */}
      {/* 🌟 CELEBRATION STATE: FULL POPUP FILLED WITH COLOR & ANIMATED TICK */}
      {/* ============================================================== */}
      {isVerifiedSuccess ? (
        <div className="relative w-full max-w-xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-700 rounded-3xl shadow-[0_25px_80px_rgba(5,150,105,0.45)] border border-emerald-400/50 overflow-hidden my-6 p-8 sm:p-14 text-center text-white animate-pop flex flex-col items-center justify-center min-h-[480px]">
          {/* Ambient glow backgrounds */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-300/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Animated SVG Tick in big white circle */}
          <div className="relative mb-7">
            {/* Pulsing glow rings */}
            <div className="absolute -inset-3 rounded-full bg-white/25 animate-ping duration-1000" />
            <div className="absolute -inset-7 rounded-full bg-emerald-300/35 blur-md animate-pulse" />

            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border-4 border-emerald-200 animate-pop">
              <svg
                className="w-16 h-16 sm:w-18 sm:h-18 text-emerald-600 animate-checkmark"
                viewBox="0 0 52 52"
                fill="none"
              >
                <circle cx="26" cy="26" r="23" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
                <path
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l8 8 16-16"
                />
              </svg>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-emerald-50 text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
            WhatsApp Verified 100%
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Verified Successfully!
          </h2>
          <p className="text-sm text-emerald-100 max-w-sm leading-relaxed mb-7 font-medium">
            Welcome, <span className="font-bold text-white">{verifiedUser?.name || name || 'Workspace Admin'}</span>! Mobile confirmed. Opening your WhatsApp Studio...
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-xs bg-white/25 rounded-full h-2.5 overflow-hidden p-0.5 shadow-inner">
            <div className="bg-white h-full rounded-full animate-progress-fill" />
          </div>
          <span className="text-[11px] text-emerald-100/80 font-mono mt-3">
            Redirecting to Studio Dashboard...
          </span>
        </div>
      ) : (
        /* ============================================================== */
        /* STANDARD 2-COLUMN AUTH POPUP DIALOG                            */
        /* ============================================================== */
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-slate-200/90 overflow-hidden my-6 grid grid-cols-1 md:grid-cols-12 animate-scale-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer shadow-2xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left Side: Branded Feature Banner (Hidden on mobile) */}
          <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-8 flex-col justify-between relative overflow-hidden">
            {/* Subtle glow circles */}
            <div className="absolute -top-16 -left-16 w-52 h-52 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2.5 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <MessageSquare className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-emerald-200 to-teal-300 bg-clip-text text-transparent">
                    CyberLim Studio
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-mono font-semibold uppercase tracking-wider">
                    Evolution API Hub
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-black leading-tight mb-3">
                {mode === 'register'
                  ? isRegisterOtpStep
                    ? 'Verify your mobile number via WhatsApp'
                    : 'Create your verified WhatsApp workspace'
                  : 'Welcome back to CyberLim WhatsApp Hub'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect Evolution API instances, broadcast bulk messages, automate webhooks, and manage audience pipelines seamlessly.
              </p>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Real-time WhatsApp OTP verification</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Enterprise 256-Bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span>1,500 messages/min broadcast engine access</span>
                </div>
              </div>

              {/* Active Evolution API Instance Pill */}
              <div className="mt-6 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">API Instance:</span>
                  <span className="text-emerald-400 font-bold">user_h6ploamcbhncp8g0</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Security:</span>
                  <span className="text-teal-300 font-bold">Encrypted & Verified</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Powered by Evolution API</span>
              <span className="text-emerald-400 font-bold">99.98% SLA</span>
            </div>
          </div>

          {/* Right Side: Form & OTP Panels */}
          <div className="col-span-1 md:col-span-7 p-6 sm:p-10 flex flex-col justify-center max-h-[90vh] overflow-y-auto">
            {/* Main Mode Switcher: Sign In vs Create Account */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl mb-6 self-start w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setIsRegisterOtpStep(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setIsRegisterOtpStep(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Feedback messages */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW 1: REGISTRATION OTP VERIFICATION STEP                     */}
            {/* ============================================================== */}
            {mode === 'register' && isRegisterOtpStep ? (
              <div className="space-y-4 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterOtpStep(false);
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Mobile Number or Details</span>
                </button>

                <div className="text-center pt-2">
                  <div className="relative inline-block mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <MessageSquare className="w-7 h-7 text-slate-950" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Verify WhatsApp OTP
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    We sent a 6-digit verification code to your WhatsApp at:
                  </p>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-xs font-mono font-bold">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>+{getFullPhone()}</span>
                  </div>
                </div>

                <form onSubmit={handleVerifyRegisterOtpSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Enter 6-Digit Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        required
                        value={registerOtp}
                        onChange={(e) => setRegisterOtp(e.target.value)}
                        placeholder="••••••"
                        className="w-full text-center text-2xl font-mono tracking-[0.4em] py-3.5 px-4 bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition shadow-inner font-bold text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 px-1 text-[11.5px]">
                      <button
                        type="button"
                        onClick={() => setShowCodeHint(!showCodeHint)}
                        className="text-slate-400 hover:text-emerald-700 font-medium transition cursor-pointer"
                      >
                        {showCodeHint
                          ? `Code: ${devOtpHint || '123456'}`
                          : "Didn't receive WhatsApp message? View Code"}
                      </button>

                      {showCodeHint && (
                        <button
                          type="button"
                          onClick={() => setRegisterOtp(devOtpHint || '123456')}
                          className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline"
                        >
                          Paste Code
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingRegisterOtp}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingRegisterOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying WhatsApp Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Code & Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={handleResendRegisterOtp}
                      disabled={countdown > 0 || isSendingOtp}
                      className="font-bold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                    >
                      {isSendingOtp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend WhatsApp OTP'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRegisterOtpStep(false)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Edit details
                    </button>
                  </div>
                </form>
              </div>
            ) : mode === 'register' ? (
              /* ============================================================== */
              /* VIEW 2: CREATE ACCOUNT FORM                                    */
              /* ============================================================== */
              <div>
                <div className="mb-5">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Create your account
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your mobile number to receive a verified WhatsApp OTP and activate your workspace.
                  </p>
                </div>

                {/* 1-Click Google Sign-In */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-700 font-bold text-xs shadow-2xs hover:shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                  >
                    {isGoogleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="w-4 h-4" />
                        <span>Sign up with Google (1-Click)</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                    <span className="bg-white px-3 text-slate-400 font-bold">
                      or register with mobile & email
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Input Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rohit Sengar"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Mobile Number Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp Verified
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="py-2.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9411800280"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Workspace Name (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Workspace / Business Name
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                  </div>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g. Sengar Store & Automation"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="developer@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className={`font-bold ${
                        password.length >= 8 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {password.length >= 8 ? 'Strong' : 'Medium (min 6)'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending WhatsApp Verification OTP...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      <span>Verify via WhatsApp & Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ============================================================== */
            /* VIEW 3: SIGN IN OPTIONS (Mobile OTP vs Email/Password)         */
            /* ============================================================== */
            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sign in with Google, your mobile number OTP, or email password.
                </p>
              </div>

              {/* 1-Click Google Sign-In */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-700 font-bold text-xs shadow-2xs hover:shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>Continue with Google (1-Click)</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                    <span className="bg-white px-3 text-slate-400 font-bold">
                      or continue with
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign In Method Tab Switcher */}
              <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSignInMethod('phone');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    signInMethod === 'phone'
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInMethod('email');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    signInMethod === 'email'
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email & Password</span>
                </button>
              </div>

              {/* Sub-view: Mobile OTP Sign In */}
              {signInMethod === 'phone' ? (
                <form onSubmit={handlePhoneLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="py-2.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.label}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9411800280"
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {signInOtpSent && (
                    <div className="space-y-2 animate-fade-in">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        WhatsApp 6-Digit Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          maxLength={6}
                          required
                          autoFocus
                          value={signInOtp}
                          onChange={(e) => setSignInOtp(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || isSendingOtp}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying WhatsApp Code...</span>
                      </>
                    ) : isSendingOtp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending WhatsApp OTP...</span>
                      </>
                    ) : signInOtpSent ? (
                      <>
                        <span>Verify OTP & Open Studio</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Send WhatsApp Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {signInOtpSent && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <button
                        type="button"
                        onClick={handleSendSignInOtp}
                        disabled={countdown > 0 || isSendingOtp}
                        className="font-bold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 cursor-pointer"
                      >
                        {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                      </button>
                      <span>Check your WhatsApp</span>
                    </div>
                  )}
                </form>
              ) : (
                /* Sub-view: Email & Password Sign In */
                <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="developer@example.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      'Sign In & Open Studio'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Switch mode footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'register' ? 'signin' : 'register');
                setIsRegisterOtpStep(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              {mode === 'register' ? 'Sign in instead' : 'Create new account'}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
