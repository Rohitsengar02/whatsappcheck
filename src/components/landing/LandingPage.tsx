import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  QrCode,
  Send,
  Code2,
  Radio,
  FileText,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Copy,
  Check,
  Smartphone,
  Users,
  Settings,
  BarChart3,
  Globe,
  ShoppingCart,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Play,
  Zap,
  Lock,
  ExternalLink,
  Upload,
  Terminal,
  CheckCheck,
  RefreshCw,
  Pause,
  ChevronLeft,
  BookOpen,
  Bot,
  Workflow,
  Shield,
  Heart,
  Mail,
  Activity,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User } from '../../services/authService';
import { HeroMockupShowcase } from './HeroMockupShowcase';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'register') => void;
  onEnterStudio: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

interface DemoContact {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
  tag?: string;
  lastActive?: string;
}

const DEMO_CONTACTS: DemoContact[] = [
  { id: '1', name: 'Priya Sharma', phone: '+91 98765 43210', avatarColor: 'bg-emerald-500', tag: 'VIP Customer', lastActive: 'Online now' },
  { id: '2', name: 'Rahul Mehta', phone: '+91 98765 43211', avatarColor: 'bg-blue-500', tag: 'New Lead', lastActive: 'Active 2m ago' },
  { id: '3', name: 'Anita Singh', phone: '+91 98765 43212', avatarColor: 'bg-purple-500', tag: 'Subscriber', lastActive: 'Active 15m ago' },
  { id: '4', name: 'Vikram Rao', phone: '+91 98765 43213', avatarColor: 'bg-amber-500', tag: 'Enterprise', lastActive: 'Active 1h ago' },
];

const MARQUEE_ITEMS = [
  {
    icon: QrCode,
    title: 'QR-Based Pairing',
    desc: 'Instant multi-device handshake',
    badge: '3s Setup',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    iconBorder: 'border-emerald-100/70',
  },
  {
    icon: Send,
    title: 'Campaign Broadcasting',
    desc: 'Anti-ban jitter & pacing',
    badge: '99.98% SLA',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconBorder: 'border-blue-100/70',
  },
  {
    icon: Zap,
    title: '24/7 Drip Automations',
    desc: 'Keyword triggers & workflows',
    badge: 'Autonomous',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBorder: 'border-amber-100/70',
  },
  {
    icon: Code2,
    title: 'Developer REST API',
    desc: '18ms ultra-low ping time',
    badge: '200 OK',
    badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    iconBorder: 'border-teal-100/70',
  },
  {
    icon: Radio,
    title: 'Real-Time Webhooks',
    desc: 'Delivery & reply callbacks',
    badge: 'Event Stream',
    badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    iconBorder: 'border-indigo-100/70',
  },
  {
    icon: Database,
    title: 'Multi-Tenant Isolation',
    desc: 'PostgreSQL & Redis caching',
    badge: 'Encrypted',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    iconBorder: 'border-purple-100/70',
  },
  {
    icon: FileText,
    title: 'Delivery Reporting',
    desc: 'Real-time read receipts',
    badge: 'Analytics',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    iconBorder: 'border-emerald-100/70',
  },
  {
    icon: Sparkles,
    title: 'Anti-Ban Smart Jitter',
    desc: 'Humanized message pacing',
    badge: 'Safe Send',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    iconBorder: 'border-rose-100/70',
  },
];

interface DevCarouselCard {
  id: string;
  lang: string;
  title: string;
  method: 'POST' | 'SDK' | 'HOOK' | 'WS';
  methodColor: string;
  endpoint: string;
  latency: string;
  badge: string;
  description: string;
  code: string;
  response: string;
  features: string[];
}

const DEV_CAROUSEL_CARDS: DevCarouselCard[] = [
  {
    id: 'curl',
    lang: 'cURL / REST',
    title: 'Direct HTTP REST Endpoint',
    method: 'POST',
    methodColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    endpoint: 'https://api.cyberlim.com/v1/messages',
    latency: '18ms',
    badge: 'Zero Overhead',
    description: 'Direct HTTP POST dispatch with bearer token auth and sub-20ms queue acknowledgement.',
    code: `curl -X POST https://api.cyberlim.com/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "message": "Hello from CyberLim API!",
    "type": "text"
  }'`,
    response: `{\n  "status": 200,\n  "messageId": "msg_98a72b",\n  "status": "QUEUED",\n  "timestamp": "2026-10-12T09:12:00Z"\n}`,
    features: ['Bearer Token Auth', 'Sub-20ms Queue', 'Idempotency Keys'],
  },
  {
    id: 'nodejs',
    lang: 'TypeScript / Node.js',
    title: 'Official TypeScript SDK',
    method: 'SDK',
    methodColor: 'bg-blue-50 text-blue-700 border-blue-200',
    endpoint: 'npm install @cyberlim/sdk',
    latency: '14ms',
    badge: 'Strict Types',
    description: 'Type-safe client library with built-in retry mechanisms, jitter throttling, and WebSocket connection pooling.',
    code: `import { CyberLimClient } from '@cyberlim/sdk';

const client = new CyberLimClient({ apiKey: process.env.CYBERLIM_KEY });

const result = await client.messages.send({
  to: '+919876543210',
  message: 'Hello from CyberLim TypeScript SDK!',
  type: 'text'
});
console.log('Sent ID:', result.id);`,
    response: `{\n  "id": "msg_01HXYZ890",\n  "delivered": true,\n  "ack": 2,\n  "remoteJid": "919876543210@s.whatsapp.net"\n}`,
    features: ['Full TypeScript Types', 'Auto Exponential Retry', 'WebSocket Keep-Alive'],
  },
  {
    id: 'python',
    lang: 'Python SDK',
    title: 'Python Client & AI Bots',
    method: 'SDK',
    methodColor: 'bg-amber-50 text-amber-700 border-amber-200',
    endpoint: 'pip install cyberlim',
    latency: '22ms',
    badge: 'AI Ready',
    description: 'Seamless integration with LangChain, LlamaIndex, FastAPI, and asynchronous message event loops.',
    code: `from cyberlim import CyberLim

client = CyberLim(api_key="YOUR_API_KEY")

response = client.messages.send(
    to="+919876543210",
    message="AI Agent response: Your booking is confirmed! 🚀",
    type="text"
)
print(f"Message ID: {response.id}, Status: {response.status}")`,
    response: `{\n  "id": "py_msg_44810",\n  "status": "delivered",\n  "read": true,\n  "response_ms": 22\n}`,
    features: ['Asyncio Native', 'LangChain Tools', 'FastAPI Webhook Parser'],
  },
  {
    id: 'webhooks',
    lang: 'Webhooks & Events',
    title: 'Real-Time Event Stream',
    method: 'HOOK',
    methodColor: 'bg-purple-50 text-purple-700 border-purple-200',
    endpoint: 'POST https://your-domain.com/webhook',
    latency: 'Real-Time',
    badge: 'HMAC-SHA256',
    description: 'Instant event notifications for incoming chats, delivery receipts, QR changes, and session disconnections.',
    code: `{\n  "event": "messages.upsert",\n  "instance": "live_store_01",\n  "data": {\n    "key": { "remoteJid": "919876543210@s.whatsapp.net", "id": "3EB0A91" },\n    "message": { "conversation": "Is item in stock?" },\n    "status": "DELIVERED",\n    "timestamp": 1728734000\n  }\n}`,
    response: `{\n  "webhook_received": true,\n  "processed_at": 1728734001,\n  "signature_valid": true\n}`,
    features: ['HMAC-SHA256 Signing', 'Automatic Retry Backoff', 'Queue to SQS / NATS'],
  },
  {
    id: 'campaigns',
    lang: 'Batch Broadcast',
    title: 'Campaign Manager API',
    method: 'POST',
    methodColor: 'bg-rose-50 text-rose-700 border-rose-200',
    endpoint: '/v1/campaigns/broadcast',
    latency: '1,500/min',
    badge: 'Anti-Ban Jitter',
    description: 'Dispatch personalized mass campaigns with automated variable tokens, dynamic throttling, and real-time delivery graphs.',
    code: `{\n  "campaignName": "VIP Flash Sale 2026",\n  "recipients": [\n    { "phone": "+919876543210", "name": "Priya", "coupon": "VIP25" },\n    { "phone": "+14158900000", "name": "Alex", "coupon": "VIP25" }\n  ],\n  "template": "Hi {{name}}! Flash Sale 25% OFF with code {{coupon}}! 🚀",\n  "jitterDelayMs": 2800\n}`,
    response: `{\n  "campaignId": "camp_8912",\n  "totalQueued": 1500,\n  "estimatedDurationMin": 4.2,\n  "status": "IN_PROGRESS"\n}`,
    features: ['Dynamic Jitter Spacing', 'CSV Recipient Ingestion', 'Live Analytics Webhook'],
  },
  {
    id: 'interactive',
    lang: 'Interactive Media',
    title: 'Buttons, Media & Catalogs',
    method: 'POST',
    methodColor: 'bg-teal-50 text-teal-700 border-teal-200',
    endpoint: '/v1/messages/interactive',
    latency: '28ms',
    badge: 'High Conversion',
    description: 'Deliver rich WhatsApp experiences with interactive CTA buttons, quick replies, voice notes, and product catalogs.',
    code: `{\n  "to": "+919876543210",\n  "type": "interactive",\n  "interactive": {\n    "type": "button",\n    "body": { "text": "Confirm appointment for 4:00 PM today?" },\n    "action": {\n      "buttons": [\n        { "type": "reply", "title": "✅ Yes, confirm", "id": "btn_yes" },\n        { "type": "reply", "title": "❌ Need to reschedule", "id": "btn_resched" }\n      ]\n    }\n  }\n}`,
    response: `{\n  "id": "btn_msg_00192",\n  "interactiveType": "button",\n  "status": "SENT",\n  "read": true\n}`,
    features: ['Quick Reply Buttons', 'Direct CTA Links', 'Voice Note & Video Transcode'],
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterStudio,
  currentUser,
  onLogout,
}) => {
  // GSAP animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const heroMockupRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const devSectionRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);

  // Interactive Demo State
  const [demoTab, setDemoTab] = useState<'showcase' | 'tester'>('showcase');
  const [demoSending, setDemoSending] = useState(false);
  const [selectedContact, setSelectedContact] = useState<DemoContact>(DEMO_CONTACTS[0]);
  const [demoTemplate, setDemoTemplate] = useState(
    'Hi {{name}},\n\nThank you for your interest in CyberLim! 🚀\n\nWe are excited to have you on board.\n\nRegards,\nCyberLim Team'
  );
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'javascript' | 'nodejs' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [demoDelivered, setDemoDelivered] = useState(false);

  // Developer Carousel State
  const [devSlide, setDevSlide] = useState(0);
  const [isAutoPlayDev, setIsAutoPlayDev] = useState(true);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAutoPlayDev) return;
    const interval = setInterval(() => {
      setDevSlide((prev) => (prev + 1) % DEV_CAROUSEL_CARDS.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isAutoPlayDev]);

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2500);
  };

  // Workflow Network Hub State
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // 4-Phase Hero Story Motion Graphics:
  // 0: Mobile WhatsApp scans QR in CRM
  // 1: Connected to CRM
  // 2: Adding number & message in CRM, clicking Send
  // 3: Bulk messages sent to multiple phones
  const [heroStep, setHeroStep] = useState<number>(0);
  const [autoPlayHero, setAutoPlayHero] = useState<boolean>(true);
  const [sendButtonActive, setSendButtonActive] = useState<boolean>(false);
  const [bulkCount, setBulkCount] = useState<number>(0);

  useEffect(() => {
    if (!autoPlayHero) return;
    const interval = setInterval(() => {
      setHeroStep((prev) => (prev + 1) % 4);
    }, 3800);
    return () => clearInterval(interval);
  }, [autoPlayHero]);

  useEffect(() => {
    if (heroStep === 2) {
      setSendButtonActive(false);
      const timer = setTimeout(() => {
        setSendButtonActive(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (heroStep === 3) {
      setBulkCount(120);
      const counter = setInterval(() => {
        setBulkCount((prev) => (prev >= 1500 ? 1500 : prev + 140));
      }, 110);
      return () => clearInterval(counter);
    }
  }, [heroStep]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Entrance Timeline with Stagger
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (heroTextRef.current) {
        tl.from(heroTextRef.current.children, {
          y: 35,
          opacity: 0,
          stagger: 0.12,
          duration: 0.9,
        });
      }

      if (heroMockupRef.current) {
        tl.from(
          heroMockupRef.current,
          {
            scale: 0.92,
            opacity: 0,
            y: 40,
            duration: 1.1,
            ease: 'back.out(1.2)',
          },
          '-=0.6'
        );

        // Floating gentle micro-interaction
        gsap.to(heroMockupRef.current, {
          y: -10,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const renderedPreviewText = demoTemplate.replace(/\{\{name\}\}/g, selectedContact.name);

  const codeSnippets = {
    curl: `curl -X POST https://api.cyberlim.com/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${selectedContact.phone.replace(/\D/g, '')}",
    "message": "Hello from CyberLim!",
    "type": "text"
  }'`,
    javascript: `const response = await fetch('https://api.cyberlim.com/v1/messages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: '${selectedContact.phone.replace(/\D/g, '')}',
    message: 'Hello from CyberLim!',
    type: 'text'
  })
});
const data = await response.json();`,
    nodejs: `import { CyberLimClient } from '@cyberlim/sdk';

const client = new CyberLimClient({ apiKey: process.env.CYBERLIM_KEY });

const result = await client.messages.send({
  to: '${selectedContact.phone.replace(/\D/g, '')}',
  message: 'Hello from CyberLim!',
  type: 'text'
});`,
    python: `import requests

url = "https://api.cyberlim.com/v1/messages"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "to": "${selectedContact.phone.replace(/\D/g, '')}",
    "message": "Hello from CyberLim!",
    "type": "text"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendDemo = () => {
    setDemoSending(true);
    setTimeout(() => {
      setDemoSending(false);
      setDemoDelivered(true);
      setTimeout(() => setDemoDelivered(false), 5000);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FBFDFB] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden relative">
      {/* Background radial glowing ambient spots */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 right-10 w-[600px] h-[600px] bg-emerald-200/35 rounded-full blur-[140px]" />
        <div className="absolute top-[800px] -left-32 w-[500px] h-[500px] bg-teal-200/25 rounded-full blur-[130px]" />
        <div className="absolute top-[1800px] right-0 w-[550px] h-[550px] bg-emerald-100/40 rounded-full blur-[140px]" />
      </div>

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 border border-white/40">
              <MessageSquare className="w-4.5 h-4.5 fill-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">
              CyberLim
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition">How It Works</a>
            <a href="#developers" className="hover:text-emerald-600 transition">Developers</a>
            <a href="#demo" className="hover:text-emerald-600 transition">Interactive Demo</a>
            <a href="#pricing" className="hover:text-emerald-600 transition">Pricing</a>
            <a href="#faq" className="hover:text-emerald-600 transition">FAQ</a>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            <a
              href="#developers"
              className="hidden sm:inline-block text-xs font-semibold text-slate-600 hover:text-slate-900 transition mr-1"
            >
              Documentation
            </a>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onEnterStudio}
                  className="px-4.5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-md shadow-emerald-500/25 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Log Out"
                >
                  <Lock className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-md shadow-emerald-500/25 cursor-pointer flex items-center gap-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative z-10 min-h-[90vh] flex items-center py-8 lg:py-14 px-6 sm:px-8 lg:px-10 xl:px-12 w-full max-w-full overflow-hidden">
        {/* Filled Glass Ambient Background & Luminous Orbs */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/70 via-teal-50/45 to-white/90 -z-20 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[750px] h-[750px] bg-gradient-to-br from-emerald-300/40 via-teal-200/30 to-transparent rounded-full blur-[110px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-10 w-[650px] h-[650px] bg-gradient-to-tr from-emerald-200/35 via-teal-100/25 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] bg-emerald-100/30 rounded-full blur-[90px] pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b98118_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none -z-10 opacity-60" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
          {/* Left Column: Headline & Pitch */}
          <div ref={heroTextRef} className="lg:col-span-5 xl:col-span-5 space-y-7 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span>WhatsApp Messaging API</span>
            </div>

            {/* Main Headline (Big, Bold, Punchy) */}
            <h1 className="text-5xl sm:text-6xl lg:text-[62px] xl:text-[72px] font-black tracking-tight text-slate-950 leading-[1.06]">
              Your WhatsApp.<br />
              Your Workflows.<br />
              <span className="bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">Your API.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Connect your WhatsApp account, automate customer communication, and integrate messaging into your own applications with CyberLim.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
              <button
                onClick={() => (currentUser ? onEnterStudio() : onOpenAuth('register'))}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition shadow-lg shadow-emerald-500/25 active:scale-95 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{currentUser ? 'Open WhatsApp Studio' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#developers"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200/90 font-bold text-sm transition shadow-xs hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center"
              >
                <span>Explore API Docs</span>
              </a>
            </div>

            {/* Live Stats Animation Grid in Content Bottom */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_6px_20px_rgba(16,185,129,0.06),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">99.98%</div>
                <div className="text-[11px] text-slate-500 font-medium">Verified SLA</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_6px_20px_rgba(37,99,235,0.06),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-600">Fast</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">22ms</div>
                <div className="text-[11px] text-slate-500 font-medium">Webhook Ping</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_6px_20px_rgba(16,185,129,0.06),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">Active</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">15M+</div>
                <div className="text-[11px] text-slate-500 font-medium">Messages Sent</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_6px_20px_rgba(245,158,11,0.06),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700">Protected</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Anti-Ban</div>
                <div className="text-[11px] text-slate-500 font-medium">Smart Jitter</div>
              </div>
            </div>

            {/* Feature Pills underneath */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-700 font-semibold">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-white/90 shadow-2xs hover:shadow-xs transition">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                  <QrCode className="w-3.5 h-3.5" />
                </span>
                <span>QR-Based Connection</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-white/90 shadow-2xs hover:shadow-xs transition">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                  <Radio className="w-3.5 h-3.5" />
                </span>
                <span>Bulk Messaging Engine</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-white/90 shadow-2xs hover:shadow-xs transition">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <span>24/7 Drip Automations</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-white/90 shadow-2xs hover:shadow-xs transition">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                  <Code2 className="w-3.5 h-3.5" />
                </span>
                <span>Developer REST API</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Motion Graphics Showcase */}
          <div ref={heroMockupRef} className="lg:col-span-7 xl:col-span-7 flex items-center justify-center relative w-full">
            <HeroMockupShowcase />
          </div>
        </div>
      </section>

      {/* HORIZONTAL MARQUEE TICKER (INFINITE ANIMATION) */}
      <section className="border-y border-slate-200/80 bg-white/70 backdrop-blur-xl py-4.5 relative z-10 overflow-hidden shadow-2xs">
        {/* Left & Right Edge Soft Gradient Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#FBFDFB] via-[#FBFDFB]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#FBFDFB] via-[#FBFDFB]/80 to-transparent z-20 pointer-events-none" />

        <div className="animate-marquee flex items-center gap-5 whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,1)] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default shrink-0"
            >
              <span className={`p-2 rounded-xl ${item.iconBg} ${item.iconColor} border ${item.iconBorder} shadow-2xs`}>
                <item.icon className="w-4 h-4" />
              </span>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION (LEFT-ALIGNED HEADING & 4 ANIMATED CARDS) */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20 sm:py-24 px-6 sm:px-8 lg:px-10 xl:px-12 w-full max-w-full relative z-10 overflow-hidden">
        {/* Soft Ambient Radial Mint Glow Spots */}
        <div className="absolute top-1/2 -left-36 w-[550px] h-[550px] bg-emerald-200/30 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 -right-36 w-[550px] h-[550px] bg-teal-200/25 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Section Header: Left-Aligned & Bold */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14 max-w-[1600px] mx-auto">
          <div className="max-w-3xl text-left">
            <div className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-emerald-200/90 text-emerald-800 text-xs font-bold shadow-[0_4px_18px_rgba(16,185,129,0.12)] mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              </span>
              <span className="tracking-wider uppercase text-[11px] font-extrabold">How CyberLim Works · 4 Simple Pillars</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-950 tracking-tight leading-[1.08]">
              From Connection to <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                Instant Global Reach.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mt-3 max-w-2xl font-normal">
              Link your business number in seconds, broadcast campaigns with anti-ban jitter, automate 24/7 drip sequences, and integrate high-speed REST APIs.
            </p>
          </div>

          {/* Right: Step Badges Guide */}
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {[
              { num: '01', label: 'Scan & Link QR' },
              { num: '02', label: 'Bulk Broadcast' },
              { num: '03', label: 'Drip Automations' },
              { num: '04', label: 'REST API & Webhooks' }
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-700"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-black">
                  {step.num}
                </span>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Animated Glass & Neomorphic Feature Cards (Always Visible & Expansive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 items-stretch w-full max-w-[1600px] mx-auto">
          {/* ================= CARD 01: QR CONNECTION ================= */}
          <div className="how-card group relative rounded-[30px] bg-white/85 backdrop-blur-2xl border border-white/95 p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(16,185,129,0.12),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(16,185,129,0.22),0_15px_30px_-8px_rgba(15,23,42,0.08),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl group-hover:bg-emerald-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3.5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white to-emerald-50/90 border border-white text-emerald-700 font-black text-sm flex items-center justify-center shadow-[0_8px_18px_rgba(16,185,129,0.18),inset_0_2px_4px_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                  01
                </span>
                <span className="p-2 rounded-xl bg-emerald-50/90 border border-emerald-100 text-emerald-600 shadow-2xs group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Smartphone className="w-4.5 h-4.5" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  Scan & Link Account
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                  Pair your business WhatsApp in 3 seconds via secure Baileys QR handshake with zero Meta app reviews.
                </p>
              </div>

              <div className="space-y-1 pt-0.5 text-[10.5px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Multi-device active handshake</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Auto-reconnect session recovery</span>
                </div>
              </div>
            </div>

            {/* Inner Mockup: Animated Laser Scanner QR Matrix */}
            <div className="mt-6 rounded-2xl bg-[#0B1120] p-4 border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center space-y-2.5 relative overflow-hidden group-hover:border-emerald-500/40 transition-colors">
              <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
                <span>Pairing Terminal · Ready</span>
              </div>

              <div className="relative w-28 h-28 bg-slate-900 rounded-xl p-2.5 border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.22)] flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                <div className="grid grid-cols-6 gap-0.5 w-full h-full">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                </div>

                <div className="laser-beam-card absolute left-2 right-2 h-1 bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 rounded shadow-[0_0_12px_#10B981] animate-[scan-line_2.2s_ease-in-out_infinite]" />
              </div>

              <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>WebSocket Live · 22ms</span>
              </div>
            </div>
          </div>

          {/* ================= CARD 02: BULK BROADCAST ENGINE ================= */}
          <div className="how-card group relative rounded-[30px] bg-white/85 backdrop-blur-2xl border border-white/95 p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(37,99,235,0.1),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(37,99,235,0.22),0_15px_30px_-8px_rgba(15,23,42,0.08),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl group-hover:bg-blue-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3.5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white to-blue-50/90 border border-white text-blue-700 font-black text-sm flex items-center justify-center shadow-[0_8px_18px_rgba(37,99,235,0.18),inset_0_2px_4px_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                  02
                </span>
                <span className="p-2 rounded-xl bg-blue-50/90 border border-blue-100 text-blue-600 shadow-2xs group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Send className="w-4.5 h-4.5" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                  Bulk Smart Broadcast
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                  Send 1,500+ personalized messages with anti-ban humanized delay pacing and dynamic tags.
                </p>
              </div>

              <div className="space-y-1 pt-0.5 text-[10.5px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Randomized jitter delay (Anti-Ban)</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Dynamic tags ({'{{name}}'}, {'{{code}}'})</span>
                </div>
              </div>
            </div>

            {/* Inner Mockup: Animated Broadcast Dispatcher */}
            <div className="mt-6 rounded-2xl bg-slate-50/90 p-3.5 border border-slate-200/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] space-y-2.5 relative group-hover:border-blue-400/50 transition-colors">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>1,500 VIP Contacts</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9.5px] border border-blue-200/80">
                  Live Dispatch
                </span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs space-y-1.5">
                <div className="h-7 rounded-lg bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-white text-[9.5px] font-black flex items-center justify-center gap-1 shadow-2xs">
                  <span>🛍️</span>
                  <span>FLASH SALE · 25% OFF</span>
                </div>
                <div className="text-[9.5px] text-slate-700 leading-snug">
                  Hi Priya! Flash Sale is LIVE. Code <b>VIP25</b> 🚀
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px]">
                  <span className="text-blue-600 font-bold">🔗 Shop Now →</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-500 inline" /> Delivered
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[9.5px] font-bold text-slate-600 mb-1">
                  <span>Broadcast Progress</span>
                  <span className="text-blue-600 font-mono">1,480 / 1,500 (98.6%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full w-[98%] bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= CARD 03: 24/7 DRIP AUTOMATIONS ================= */}
          <div className="how-card group relative rounded-[30px] bg-white/85 backdrop-blur-2xl border border-white/95 p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(245,158,11,0.1),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(245,158,11,0.22),0_15px_30px_-8px_rgba(15,23,42,0.08),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl group-hover:bg-amber-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3.5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white to-amber-50/90 border border-white text-amber-700 font-black text-sm flex items-center justify-center shadow-[0_8px_18px_rgba(245,158,11,0.18),inset_0_2px_4px_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                  03
                </span>
                <span className="p-2 rounded-xl bg-amber-50/90 border border-amber-100 text-amber-600 shadow-2xs group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Zap className="w-4.5 h-4.5" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-amber-700 transition-colors">
                  24/7 Drip Automations
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                  Auto-reply to incoming keywords ("OFFER"), send catalogs, and trigger follow-up sequences.
                </p>
              </div>

              <div className="space-y-1 pt-0.5 text-[10.5px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Keyword & regex trigger bots</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>24h abandoned reminder sequence</span>
                </div>
              </div>
            </div>

            {/* Inner Mockup: Animated WhatsApp Live Chat Simulator */}
            <div className="mt-6 rounded-2xl bg-[#EFEAE2] p-3 border border-slate-300/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)] space-y-2 relative group-hover:border-amber-400/60 transition-colors">
              <div className="flex items-center gap-1.5 bg-emerald-700 text-white rounded-lg px-2 py-1 text-[8.5px] font-bold shadow-2xs">
                <div className="w-3 h-3 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[6px]">
                  <MessageSquare className="w-1.5 h-1.5 fill-emerald-700" />
                </div>
                <span>CyberLim Store</span>
                <span className="ml-auto text-[7px] text-emerald-200">online</span>
              </div>

              <div className="space-y-1.5 text-[9px]">
                {/* Incoming User Message */}
                <div className="ml-auto w-fit bg-[#D9FDD3] rounded-lg rounded-tr-none px-2 py-0.5 text-slate-900 font-medium shadow-2xs">
                  OFFER
                </div>

                {/* Animated Typing Indicator */}
                <div className="w-fit bg-white rounded-lg rounded-tl-none px-2 py-1 flex items-center gap-1 shadow-2xs">
                  <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]" />
                </div>

                {/* Bot Instant Rich Reply */}
                <div className="w-full bg-white rounded-lg rounded-tl-none p-1.5 shadow-2xs space-y-1">
                  <div className="text-[8px] font-bold text-slate-800">
                    🛍️ Here's your 25% OFF Coupon: <b>VIP25</b>
                  </div>
                  <div className="text-center bg-blue-50 text-blue-600 rounded py-0.5 text-[8px] font-bold border border-blue-100">
                    🔗 Claim Offer Now →
                  </div>
                </div>

                {/* Automated Drip Tag */}
                <div className="text-center">
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100/90 text-amber-800 text-[7.5px] font-bold border border-amber-200/80">
                    ⏰ 24h follow-up scheduled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CARD 04: DEVELOPER REST API & WEBHOOKS ================= */}
          <div className="how-card group relative rounded-[30px] bg-white/85 backdrop-blur-2xl border border-white/95 p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(20,184,166,0.1),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(20,184,166,0.22),0_15px_30px_-8px_rgba(15,23,42,0.08),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-400/20 rounded-full blur-2xl group-hover:bg-teal-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3.5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white to-teal-50/90 border border-white text-teal-700 font-black text-sm flex items-center justify-center shadow-[0_8px_18px_rgba(20,184,166,0.18),inset_0_2px_4px_rgba(255,255,255,1)] group-hover:scale-105 transition-transform">
                  04
                </span>
                <span className="p-2 rounded-xl bg-teal-50/90 border border-teal-100 text-teal-600 shadow-2xs group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Code2 className="w-4.5 h-4.5" />
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                  REST API & Webhooks
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                  Programmatically send messages, OTPs, and stream incoming chat webhooks at scale.
                </p>
              </div>

              <div className="space-y-1 pt-0.5 text-[10.5px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>18ms ultra-low latency response</span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>Node.js, Python & cURL SDKs</span>
                </div>
              </div>
            </div>

            {/* Inner Mockup: Animated Developer Terminal */}
            <div className="mt-6 rounded-2xl bg-[#090D16] p-3.5 border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] font-mono text-[9.5px] space-y-1.5 relative group-hover:border-teal-500/40 transition-colors">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                  <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
                  <span className="text-[9px] text-slate-500 font-bold ml-1">POST /v1/messages</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[8.5px] font-bold">
                  200 OK
                </span>
              </div>

              <div className="text-slate-300 leading-relaxed overflow-x-auto text-[9px] py-0.5">
                <div>&#123;</div>
                <div className="pl-2">
                  <span className="text-sky-300">"to"</span>: <span className="text-emerald-300">"+919876543210"</span>,
                </div>
                <div className="pl-2">
                  <span className="text-sky-300">"message"</span>: <span className="text-emerald-300">"OTP: 492018 🚀"</span>,
                </div>
                <div className="pl-2">
                  <span className="text-sky-300">"webhook"</span>: <span className="text-amber-300">"https://crm.app/ev"</span>
                </div>
                <div>&#125;</div>
              </div>

              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[8.5px] text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>event: message.delivered</span>
                </span>
                <span className="text-slate-400 font-normal">99.99% SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POWERFUL FEATURES GRID SECTION (ENHANCED GLASS & ANIMATED PREVIEWS) */}
      <section id="features" ref={featuresRef} className="py-22 sm:py-26 px-6 sm:px-8 lg:px-10 xl:px-12 w-full max-w-full relative z-10 overflow-hidden">
        {/* Soft Ambient Radial Luminous Glow Spots */}
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-emerald-200/25 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 -left-40 w-[600px] h-[600px] bg-teal-200/25 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-blue-100/25 rounded-full blur-[130px] pointer-events-none -z-10" />

        {/* Section Header: Left-Aligned & Editorial Tech Style */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16 max-w-[1600px] mx-auto">
          <div className="max-w-3xl text-left">
            <div className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-emerald-200/90 text-emerald-800 text-xs font-bold shadow-[0_4px_18px_rgba(16,185,129,0.12)] mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              </span>
              <span className="tracking-wider uppercase text-[11px] font-extrabold">Next-Gen WhatsApp Architecture</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-950 tracking-tight leading-[1.08]">
              Everything You Need for <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
                Scale, Speed & Anti-Ban Safety.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mt-3 max-w-2xl font-normal">
              Engineered for high-volume enterprise deliverability, automated conversational drip workflows, and developer-first REST integrations.
            </p>
          </div>

          {/* Quick Capability Tags */}
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {['Anti-Ban Jitter', 'Bulk Engine', 'Drip Bot', 'REST API', 'Webhooks', 'Analytics'].map((tag, idx) => (
              <span key={idx} className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 text-xs font-bold text-slate-700 shadow-2xs">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 6 Rich Glassmorphic Animated Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch w-full max-w-[1600px] mx-auto">
          {/* ================= 1. ANTI-BAN SMART JITTER ================= */}
          <div className="feature-card group relative rounded-[32px] bg-white/85 backdrop-blur-2xl border border-white/95 p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(16,185,129,0.12),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(16,185,129,0.22),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl group-hover:bg-emerald-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-2xs group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Protected 100%
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  Anti-Ban Smart Jitter
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-normal">
                  Proprietary pacing algorithm that dynamically humanizes message dispatch delays (2s–7s) to protect numbers against automated WhatsApp ban detection.
                </p>
              </div>

              <div className="space-y-1 pt-1 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Randomized packet delivery intervals</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Session warm-up & traffic throttling</span>
                </div>
              </div>
            </div>

            {/* Inner Live Animated Gauge Demo */}
            <div className="mt-6 rounded-2xl bg-[#0B1120] p-4 border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] space-y-2.5 relative group-hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
                  <span>Jitter Engine · Active</span>
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">99.98% Safe SLA</span>
              </div>

              <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Current Packet Interval:</span>
                <span className="text-emerald-300 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                  3.42s delay
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-[94%] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full shadow-[0_0_10px_#10B981]" />
              </div>
            </div>
          </div>

          {/* ================= 2. BULK CAMPAIGN ENGINE ================= */}
          <div className="feature-card group relative rounded-[32px] bg-white/85 backdrop-blur-2xl border border-white/95 p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(37,99,235,0.1),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(37,99,235,0.22),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl group-hover:bg-blue-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-2xs group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Send className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                  Bulk Engine
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                  Bulk Campaign Engine
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-normal">
                  Upload CSV or sync CRM contacts. Personalize messages with dynamic tags ({'{{name}}'}, {'{{coupon}}'}) and clickable interactive CTA buttons.
                </p>
              </div>

              <div className="space-y-1 pt-1 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Unlimited contact list import</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>High-speed queue orchestration</span>
                </div>
              </div>
            </div>

            {/* Inner Live Animated Multi-Recipient Stream */}
            <div className="mt-6 rounded-2xl bg-slate-50/90 p-3.5 border border-slate-200/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] space-y-2 relative group-hover:border-blue-400/50 transition-colors">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-700">
                <span>Active Dispatch Queue</span>
                <span className="text-blue-600 font-mono">45 msgs/sec</span>
              </div>

              <div className="space-y-1.5 text-[9.5px]">
                <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="font-semibold text-slate-800">Priya Sharma (+91)</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" /> Delivered 10:14 AM
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="font-semibold text-slate-800">Alex Rivera (+1)</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" /> Delivered 10:14 AM
                  </span>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full w-[96%] bg-blue-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* ================= 3. CONVERSATIONAL DRIP BOT ================= */}
          <div className="feature-card group relative rounded-[32px] bg-white/85 backdrop-blur-2xl border border-white/95 p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(245,158,11,0.1),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(245,158,11,0.22),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl group-hover:bg-amber-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 shadow-2xs group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Zap className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                  24/7 Bot
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-amber-700 transition-colors">
                  Conversational Drip Bot
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-normal">
                  Visual node flow builder that triggers instant keyword auto-replies, product catalogs, and scheduled follow-up drip reminders.
                </p>
              </div>

              <div className="space-y-1 pt-1 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Keyword, regex, and intent matching</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>24h abandoned cart sequence</span>
                </div>
              </div>
            </div>

            {/* Inner Live Animated Chat Simulator */}
            <div className="mt-6 rounded-2xl bg-[#EFEAE2] p-3 border border-slate-300/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)] space-y-2 relative group-hover:border-amber-400/60 transition-colors">
              <div className="flex items-center gap-1.5 bg-emerald-700 text-white rounded-lg px-2 py-1 text-[8.5px] font-bold shadow-2xs">
                <div className="w-3 h-3 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[6px]">
                  <MessageSquare className="w-1.5 h-1.5 fill-emerald-700" />
                </div>
                <span>CyberLim Store</span>
                <span className="ml-auto text-[7px] text-emerald-200">online</span>
              </div>

              <div className="space-y-1 text-[9px]">
                <div className="ml-auto w-fit bg-[#D9FDD3] rounded-lg rounded-tr-none px-2 py-0.5 text-slate-900 font-medium shadow-2xs">
                  PRICING
                </div>
                <div className="w-full bg-white rounded-lg rounded-tl-none p-1.5 shadow-2xs space-y-1">
                  <div className="text-[8.5px] font-bold text-slate-800">
                    🎁 Here's your 25% Coupon: <b>VIP25</b>
                  </div>
                  <div className="text-center bg-blue-50 text-blue-600 rounded py-0.5 text-[8px] font-bold border border-blue-100">
                    🔗 View Plans & Upgrade →
                  </div>
                </div>
              </div>

              <div className="text-center text-[7.5px] font-bold text-amber-800 bg-amber-100/90 rounded-full py-0.5 border border-amber-200/80">
                ⚡ Auto-replied in 0.38 seconds
              </div>
            </div>
          </div>

          {/* ================= 4. DEVELOPER REST API ================= */}
          <div className="feature-card group relative rounded-[32px] bg-white/85 backdrop-blur-2xl border border-white/95 p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(20,184,166,0.1),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(20,184,166,0.22),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-400/20 rounded-full blur-2xl group-hover:bg-teal-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 shadow-2xs group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Code2 className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                  REST API
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-teal-700 transition-colors">
                  High-Speed REST API
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-normal">
                  Comprehensive endpoints for message dispatch, group management, media attachments, and instance session health checks.
                </p>
              </div>

              <div className="space-y-1 pt-1 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>18ms ultra-low ping time</span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span>Node.js, Python, PHP, cURL SDKs</span>
                </div>
              </div>
            </div>

            {/* Inner Live Animated Dark Console */}
            <div className="mt-6 rounded-2xl bg-[#090D16] p-3.5 border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] font-mono text-[9.5px] space-y-1.5 relative group-hover:border-teal-500/40 transition-colors">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="text-emerald-400 font-bold">POST /v1/messages</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[8.5px]">200 OK • 18ms</span>
              </div>

              <div className="text-slate-300 leading-relaxed text-[9px] py-0.5">
                <div>&#123;</div>
                <div className="pl-2">
                  <span className="text-sky-300">"to"</span>: <span className="text-emerald-300">"+919876543210"</span>,
                </div>
                <div className="pl-2">
                  <span className="text-sky-300">"message"</span>: <span className="text-emerald-300">"Your OTP is 492018 🚀"</span>
                </div>
                <div>&#125;</div>
              </div>

              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[8.5px] text-slate-400">
                <span className="text-emerald-400">● 99.99% SLA Guarantee</span>
                <span>Node.js · Python</span>
              </div>
            </div>
          </div>

          {/* ================= 5. REAL-TIME WEBHOOK ENGINE ================= */}
          <div className="feature-card group relative rounded-[32px] bg-white/85 backdrop-blur-2xl border border-white/95 p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(99,102,241,0.1),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(99,102,241,0.22),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-400/20 rounded-full blur-2xl group-hover:bg-indigo-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Radio className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                  Real-time
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-700 transition-colors">
                  Bi-Directional Webhooks
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-normal">
                  Instant HTTP callbacks for message.sent, message.delivered, message.read, and inbound replies with automatic exponential retries.
                </p>
              </div>

              <div className="space-y-1 pt-1 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Automatic retry engine with backoff</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Custom HMAC secret verification</span>
                </div>
              </div>
            </div>

            {/* Inner Live Animated Event Stream Log */}
            <div className="mt-6 rounded-2xl bg-[#0B1120] p-3.5 border border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] font-mono text-[9px] space-y-1.5 relative group-hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Webhook Event Stream</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between text-slate-400">
                  <span className="text-emerald-400">● 10:14:02 message.sent</span>
                  <span>HTTP 200</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-emerald-400">● 10:14:03 message.delivered</span>
                  <span>ACK 200</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-blue-400">● 10:14:05 message.read</span>
                  <span>✓✓ Read</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800 text-[8.5px] text-slate-500 flex justify-between">
                <span>Payload: HMAC SHA-256</span>
                <span className="text-emerald-400">Zero packet loss</span>
              </div>
            </div>
          </div>

          {/* ================= 6. ANALYTICS & LIVE TRACKING ================= */}
          <div className="feature-card group relative rounded-[32px] bg-white/85 backdrop-blur-2xl border border-white/95 p-7 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(244,63,94,0.1),0_10px_24px_-8px_rgba(15,23,42,0.05),inset_0_1px_2px_rgba(255,255,255,1)] hover:shadow-[0_32px_75px_-15px_rgba(244,63,94,0.22),inset_0_1px_2px_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-300 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-400/20 rounded-full blur-2xl group-hover:bg-rose-400/35 transition-all duration-300 pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 shadow-2xs group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                  Analytics
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-rose-700 transition-colors">
                  Analytics & Live Tracking
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-normal">
                  Granular visibility into delivery SLA, read rates, interactive CTA button clicks, and bounce diagnostics per broadcast.
                </p>
              </div>

              <div className="space-y-1 pt-1 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 text-rose-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Real-time delivery diagnostic reports</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Button click conversion tracking</span>
                </div>
              </div>
            </div>

            {/* Inner Live Animated Metrics Bar */}
            <div className="mt-6 rounded-2xl bg-slate-50/90 p-3.5 border border-slate-200/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)] space-y-2 relative group-hover:border-rose-400/50 transition-colors">
              <div className="space-y-1.5 text-[9.5px]">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-0.5">
                    <span>Delivery Rate</span>
                    <span className="text-emerald-600 font-mono">99.8%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-[99.8%] bg-emerald-500 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-0.5">
                    <span>Open Rate (Read)</span>
                    <span className="text-blue-600 font-mono">94.2%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-[94.2%] bg-blue-500 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-0.5">
                    <span>CTA Button Click</span>
                    <span className="text-purple-600 font-mono">42.6%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-[42.6%] bg-purple-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO & FULL HERO ANIMATION SHOWCASE SECTION */}
      <section id="demo" ref={demoRef} className="py-20 sm:py-28 px-6 sm:px-8 lg:px-10 xl:px-12 w-full max-w-full relative z-10 overflow-hidden">
        {/* Soft Ambient Radial Mint Glow Spots */}
        <div className="absolute top-1/2 -left-36 w-[600px] h-[600px] bg-emerald-200/35 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/4 -right-36 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-100/40 rounded-full blur-[130px] pointer-events-none -z-10" />

        {/* Section Header: Left-Aligned Editorial + Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold mb-3 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Demo & Motion Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              See the messaging workflow in action.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-3xl leading-relaxed">
              Watch the complete automated motion demo in full screen, or test live message dispatching with our interactive studio sandbox.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100/90 backdrop-blur-md border border-slate-200/80 shadow-2xs shrink-0">
            <button
              onClick={() => setDemoTab('showcase')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                demoTab === 'showcase'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
              <span>Hero Motion Demo</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/60">
                Full
              </span>
            </button>
            <button
              onClick={() => setDemoTab('tester')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                demoTab === 'tester'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>Interactive Sandbox</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-extrabold border border-amber-200/60">
                Live
              </span>
            </button>
          </div>
        </div>

        {/* ================= MODE 1: FULL HERO ANIMATION MOTION SHOWCASE ================= */}
        {demoTab === 'showcase' && (
          <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/95 shadow-[0_24px_65px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,1)] p-5 sm:p-8 lg:p-10 relative overflow-hidden transition-all duration-300">
            {/* Top macOS/Chrome Window Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400/90 shadow-2xs" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/90 shadow-2xs" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-2xs" />
                </div>
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <span className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>CyberLim Messaging Engine • Full Motion Simulation</span>
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-Time Motion Active</span>
                </span>
              </div>
            </div>

            {/* 6 Animated Phase Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none text-[11px] font-semibold text-slate-600">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                01. QR Scan & Link
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                02. Handshake Connected
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                03. Bulk Campaign Broadcast
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                04. 24/7 AI Drip Sequences
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                05. Developer REST API
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                06. Double Blue Ticks
              </span>
            </div>

            {/* FULL HERO ANIMATION SHOWCASE EMBEDDED IN FULL STAGE */}
            <div className="w-full flex items-center justify-center py-4 my-2 relative">
              <HeroMockupShowcase align="center" maxScale={1.05} />
            </div>

            {/* 4 Feature Footnotes Under Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <QrCode className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">Zero-Config Pairing</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Real-time multi-device QR scan with sub-second handshake and auto-reconnect heartbeat.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
                    <Send className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">High-Speed Broadcast</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Dispatches up to 1,500 messages/min with personalized variable tags and anti-ban jitter.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60">
                    <Zap className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">24/7 Drip Automations</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Autonomous keyword replies, scheduled follow-ups, and interactive catalog buttons.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/70 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-200/60">
                    <Code2 className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-900">REST API & Webhooks</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sub-50ms HTTP endpoints, bi-directional webhook callbacks, and multi-tenant security.
                </p>
              </div>
            </div>

            {/* Bottom Quick Switch Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-100 bg-emerald-50/50 -mx-5 -mb-5 sm:-mx-8 sm:-mb-8 lg:-mx-10 lg:-mb-10 p-5 sm:p-6 rounded-b-3xl">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  ⚡
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">Want to test sending a real message?</div>
                  <div className="text-[11px] text-slate-500">Pick any contact and customize message template in our interactive tester.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setDemoTab('tester')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 font-bold text-xs border border-emerald-200 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Open Interactive Tester</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onEnterStudio}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Studio Free</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE 2: INTERACTIVE LIVE SANDBOX TESTER ================= */}
        {demoTab === 'tester' && (
          <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/95 shadow-[0_24px_65px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,1)] p-6 sm:p-10 relative overflow-hidden transition-all duration-300">
            {/* Tester Header */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                  <Smartphone className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 tracking-tight block">
                    Interactive Live Tester • Real-Time Dispatch Simulator
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Test live template variable merging, recipient selection, and simulated WhatsApp delivery.
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Demo Mode
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Col 1: Select a Contact */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select a Contact
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{DEMO_CONTACTS.length} Demo Users</span>
                </div>
                <div className="space-y-2.5">
                  {DEMO_CONTACTS.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContact(c)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3.5 relative ${
                        selectedContact.id === c.id
                          ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-400/20'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-2xl ${c.avatarColor} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                        {c.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">{c.name}</span>
                          {c.tag && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                              {c.tag}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone}</div>
                        <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{c.lastActive || 'Online'}</span>
                        </div>
                      </div>
                      {selectedContact.id === c.id && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 2: Compose Message */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Compose Message
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <span>{renderedPreviewText.length} chars</span>
                  </div>
                </div>

                {/* Preset Templates */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10.5px]">
                  <span className="text-slate-400 text-[10px] font-bold uppercase shrink-0">Presets:</span>
                  <button
                    onClick={() => setDemoTemplate('Hi {{name}},\n\nThank you for choosing CyberLim! 🚀 Your workspace is ready. Let us know if you need any assistance!\n\nBest,\nCyberLim Team')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 transition"
                  >
                    Welcome
                  </button>
                  <button
                    onClick={() => setDemoTemplate('Hey {{name}}! 🔥 Flash Sale alert: Get 25% OFF on all upgrades this weekend using coupon code FLASH25. Limited time only!\n\nShop now: cyberlim.com/offer')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 transition"
                  >
                    Flash Sale
                  </button>
                  <button
                    onClick={() => setDemoTemplate('Hello {{name}}! 📦 Your order #WA-9821 has been dispatched via Express Delivery and will arrive within 24 hours.\n\nTrack: cyberlim.com/track')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 transition"
                  >
                    Order Track
                  </button>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={6}
                    value={demoTemplate}
                    onChange={(e) => setDemoTemplate(e.target.value)}
                    className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs text-slate-900 font-sans focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 leading-relaxed transition shadow-inner"
                    placeholder="Type your WhatsApp message template..."
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-[11px] font-bold">Personalize:</span>
                      <button
                        onClick={() => setDemoTemplate((prev) => prev + ' {{name}}')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-emerald-800 font-mono font-bold text-[10.5px] border border-slate-200/60 transition"
                      >
                        {'{name}'}
                      </button>
                    </div>

                    <button
                      onClick={handleSendDemo}
                      disabled={demoSending}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-75 text-white font-bold text-xs transition shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      {demoSending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <span>Preview & Send</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Col 3: Message Preview & Realistic WhatsApp Phone */}
              <div className="lg:col-span-3 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live WhatsApp Preview
                </h4>
                
                {/* Phone Mockup Screen */}
                <div className="rounded-2xl border border-slate-300/80 shadow-md overflow-hidden bg-[#ECE5DD]">
                  {/* WhatsApp Top Header */}
                  <div className="bg-[#075E54] text-white p-2.5 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 border border-white/40 flex items-center justify-center font-bold text-[10px] text-white">
                        CL
                      </div>
                      <div>
                        <div className="text-[11px] font-bold leading-tight">CyberLim Official</div>
                        <div className="text-[9px] text-emerald-200 leading-none">online</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <CheckCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Chat Message Bubble */}
                  <div className="p-3.5 min-h-[190px] flex flex-col justify-end relative bg-[radial-gradient(#c7bba8_1px,transparent_1px)] [background-size:12px_12px]">
                    <div className="bg-[#E7FFDB] p-3 rounded-2xl rounded-tr-xs shadow-sm text-xs text-slate-900 leading-relaxed space-y-1.5 border border-emerald-100">
                      <div className="whitespace-pre-wrap text-[11.5px]">{renderedPreviewText}</div>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 font-mono pt-1">
                        <span>10:30 AM</span>
                        <CheckCheck className={`w-3.5 h-3.5 ${demoDelivered ? 'text-sky-500' : 'text-slate-400'}`} />
                      </div>
                    </div>

                    {demoDelivered && (
                      <div className="mt-2.5 p-2 rounded-xl bg-emerald-600 text-white text-center text-[10.5px] font-bold shadow-md animate-fade-in flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Simulated delivery successful!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Real-Time JSON Payload Inspector */}
                <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[10px] space-y-1 shadow-inner border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 mb-1">
                    <span>POST /v1/messages</span>
                    <span className="text-emerald-400">HTTP 200 OK</span>
                  </div>
                  <div className="text-emerald-400 truncate">"to": "{selectedContact.phone}"</div>
                  <div className="text-slate-400">"status": "{demoDelivered ? 'delivered' : 'pending'}"</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* DEVELOPERS SECTION (AUTO-CAROUSEL CARDS & API SANDBOX) */}
      <section id="developers" ref={devSectionRef} className="py-20 sm:py-28 px-6 sm:px-8 lg:px-10 xl:px-12 w-full max-w-full relative z-10 overflow-hidden">
        {/* Soft Ambient Radial Mint Glow Spots */}
        <div className="absolute top-1/2 -left-36 w-[600px] h-[600px] bg-emerald-200/35 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/4 -right-36 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-100/40 rounded-full blur-[130px] pointer-events-none -z-10" />

        {/* Section Header: Left-Aligned + Carousel Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold mb-3 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>For Developers • API & Multi-Language SDKs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Integrate messaging into your stack.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-3xl leading-relaxed">
              Explore our auto-carousel of endpoints and SDKs with live code snippets, real-time webhooks, and automated mass broadcast pipelines.
            </p>
          </div>

          {/* Carousel Control Toolbar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Autoplay Status Beacon */}
            <button
              onClick={() => setIsAutoPlayDev(!isAutoPlayDev)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${isAutoPlayDev ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>{isAutoPlayDev ? 'Auto-Slide ON' : 'Paused'}</span>
              {isAutoPlayDev ? <Pause className="w-3 h-3 text-slate-500 ml-0.5" /> : <Play className="w-3 h-3 text-emerald-600 ml-0.5" />}
            </button>

            {/* Prev / Next Arrows */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100/90 backdrop-blur-md border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => {
                  setDevSlide((prev) => (prev - 1 + DEV_CAROUSEL_CARDS.length) % DEV_CAROUSEL_CARDS.length);
                }}
                className="p-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-white transition cursor-pointer"
                title="Previous Card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2 text-[11px] font-bold text-slate-500 font-mono">
                {devSlide + 1} / {DEV_CAROUSEL_CARDS.length}
              </div>
              <button
                onClick={() => {
                  setDevSlide((prev) => (prev + 1) % DEV_CAROUSEL_CARDS.length);
                }}
                className="p-2 rounded-xl text-slate-700 hover:text-emerald-800 hover:bg-white transition cursor-pointer"
                title="Next Card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Quick-Jump Tabs (Pill selector) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none text-xs">
          {DEV_CAROUSEL_CARDS.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setDevSlide(idx)}
              className={`px-3.5 py-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 shrink-0 font-bold ${
                devSlide === idx
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/90'
              }`}
            >
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                devSlide === idx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                0{idx + 1}
              </span>
              <span>{card.lang}</span>
            </button>
          ))}
        </div>

        {/* ================= MAIN AUTO-CAROUSEL STAGE ================= */}
        <div
          onMouseEnter={() => setIsAutoPlayDev(false)}
          onMouseLeave={() => setIsAutoPlayDev(true)}
          className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-white/95 shadow-[0_24px_65px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,1)] p-6 sm:p-10 relative overflow-hidden transition-all duration-300"
        >
          {/* Active Card Content Grid */}
          {(() => {
            const card = DEV_CAROUSEL_CARDS[devSlide];
            const isCopied = copiedSnippetId === card.id;

            return (
              <div className="space-y-8 animate-fade-in">
                {/* Top Card Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold border ${card.methodColor}`}>
                      {card.method}
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {card.endpoint}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{card.latency}</span>
                    </span>
                    <button
                      onClick={() => handleCopySnippet(card.id, card.code)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-extrabold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2-Column Code Terminal + Engine Output */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left Column: Code Terminal */}
                  <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-5 font-mono text-xs shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="ml-2 text-slate-400 font-sans">{card.lang} Request</span>
                        </div>
                        <span className="text-emerald-400 font-bold">{card.badge}</span>
                      </div>
                      <pre className="text-emerald-300 leading-relaxed overflow-x-auto select-all whitespace-pre">
                        {card.code}
                      </pre>
                    </div>

                    {/* Features Strip */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-800/80 text-[10.5px]">
                      {card.features.map((feat, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-sans font-medium">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Engine Response Output + Specs */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 font-mono text-xs shadow-inner">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px]">
                        <span className="text-slate-400 font-sans font-bold">Simulated Engine Output</span>
                        <span className="text-emerald-400 font-bold">HTTP 200 OK</span>
                      </div>
                      <pre className="text-slate-300 leading-relaxed overflow-x-auto text-[11.5px] whitespace-pre">
                        {card.response}
                      </pre>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
                      <div className="text-xs font-bold text-slate-900 mb-1">Architecture Note</div>
                      <p className="text-[11.5px] text-slate-600 leading-relaxed">
                        {card.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-emerald-100">
                        <button
                          onClick={onEnterStudio}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Test in Live Sandbox</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ================= AUTO-CAROUSEL CARDS STRIP (ALL 6 CARDS REEL) ================= */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>All Developer Modules ({DEV_CAROUSEL_CARDS.length} Cards)</span>
            </h4>
            <div className="text-[11px] text-slate-500 font-medium">
              Click any card to inspect or pause
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {DEV_CAROUSEL_CARDS.map((c, idx) => {
              const isActive = devSlide === idx;
              return (
                <div
                  key={c.id}
                  onClick={() => setDevSlide(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-white border-emerald-400 ring-2 ring-emerald-400/25 shadow-md -translate-y-1'
                      : 'bg-white/70 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md border font-mono ${c.methodColor}`}>
                        {c.method}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">{c.lang}</div>
                    <div className="text-[10.5px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                      {c.title}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-700 font-bold">{c.latency}</span>
                    <span className="text-slate-400 font-mono">0{idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Documentation Links Footer Grid */}
        <div className="mt-8 p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>API Reference:</span>
            </span>
            {[
              'Getting Started',
              'Authentication',
              'Sending Messages',
              'Campaigns API',
              'Webhooks',
              'Error Codes',
            ].map((item, idx) => (
              <a
                key={idx}
                href="#developers"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-medium transition text-xs"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText('npm install @cyberlim/sdk');
                alert('Copied: npm install @cyberlim/sdk');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs shadow-2xs transition flex items-center gap-2 cursor-pointer"
            >
              <span>npm i @cyberlim/sdk</span>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      {/* WORKFLOW INTEGRATIONS DIAGRAM SECTION WITH ANIMATED THREADS */}
      <section ref={workflowRef} className="py-20 sm:py-28 px-6 sm:px-8 lg:px-10 xl:px-12 w-full max-w-full relative z-10 overflow-hidden">
        {/* Soft Ambient Radial Mint Glow Spots */}
        <div className="absolute top-1/2 -left-36 w-[600px] h-[600px] bg-emerald-200/35 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/4 -right-36 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-100/40 rounded-full blur-[130px] pointer-events-none -z-10" />

        {/* Section Header: Left-Aligned Editorial */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold mb-3 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ecosystem & Architecture Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Fits seamlessly into your workflow.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-3xl leading-relaxed">
              Connect CyberLim directly with websites, CRM systems, e-commerce stores, AI chatbots, and custom webhooks with animated zero-latency thread pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>6 Real-Time Ingestion Threads Active</span>
          </div>
        </div>

        {/* Central Hub & Connected Thread Network */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/95 p-6 sm:p-10 lg:p-14 shadow-[0_24px_65px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_2px_rgba(255,255,255,1)] relative overflow-hidden">
          {/* Background SVG Animated Connection Threads (Connecting Left & Right Nodes to Center Engine) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block" fill="none">
            {/* Left Node 1 (Top) to Center */}
            <path
              d="M 260 90 C 400 90, 420 220, 500 240"
              stroke="#10b981"
              strokeWidth="2"
              className={hoveredNode === 'web' ? 'animate-thread-fast opacity-100' : 'animate-thread opacity-45'}
            />
            {/* Left Node 2 (Middle) to Center */}
            <path
              d="M 260 240 C 380 240, 420 240, 500 240"
              stroke="#10b981"
              strokeWidth="2.5"
              className={hoveredNode === 'ecom' ? 'animate-thread-fast opacity-100' : 'animate-thread opacity-60'}
            />
            {/* Left Node 3 (Bottom) to Center */}
            <path
              d="M 260 390 C 400 390, 420 260, 500 240"
              stroke="#10b981"
              strokeWidth="2"
              className={hoveredNode === 'crm' ? 'animate-thread-fast opacity-100' : 'animate-thread opacity-45'}
            />

            {/* Center to Right Node 1 (Top) */}
            <path
              d="M 500 240 C 580 220, 600 90, 740 90"
              stroke="#10b981"
              strokeWidth="2"
              className={hoveredNode === 'ai' ? 'animate-thread-fast opacity-100' : 'animate-thread-reverse opacity-45'}
            />
            {/* Center to Right Node 2 (Middle) */}
            <path
              d="M 500 240 C 580 240, 620 240, 740 240"
              stroke="#10b981"
              strokeWidth="2.5"
              className={hoveredNode === 'dash' ? 'animate-thread-fast opacity-100' : 'animate-thread-reverse opacity-60'}
            />
            {/* Center to Right Node 3 (Bottom) */}
            <path
              d="M 500 240 C 580 260, 600 390, 740 390"
              stroke="#10b981"
              strokeWidth="2"
              className={hoveredNode === 'hook' ? 'animate-thread-fast opacity-100' : 'animate-thread-reverse opacity-45'}
            />
          </svg>

          {/* 3-Column Topology Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column Nodes (Sources) */}
            <div className="md:col-span-4 space-y-4">
              {/* Node 1: Websites */}
              <div
                onMouseEnter={() => setHoveredNode('web')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
                  hoveredNode === 'web'
                    ? 'bg-blue-50/80 border-blue-400 shadow-md ring-2 ring-blue-400/20 -translate-y-0.5'
                    : 'bg-white/95 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span className="p-2.5 rounded-xl bg-blue-100 text-blue-700 shadow-2xs shrink-0">
                  <Globe className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Websites & Landing Pages</span>
                    <span className="text-[9.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200/60">
                      Sub-12ms
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Click-to-chat triggers & visitor onboarding</div>
                </div>
              </div>

              {/* Node 2: E-commerce */}
              <div
                onMouseEnter={() => setHoveredNode('ecom')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
                  hoveredNode === 'ecom'
                    ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/20 -translate-y-0.5'
                    : 'bg-white/95 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shadow-2xs shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Shopify & E-Commerce</span>
                    <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200/60">
                      Live Sync
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Abandoned cart recoveries & order OTPs</div>
                </div>
              </div>

              {/* Node 3: CRM Systems */}
              <div
                onMouseEnter={() => setHoveredNode('crm')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
                  hoveredNode === 'crm'
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-md ring-2 ring-emerald-400/20 -translate-y-0.5'
                    : 'bg-white/95 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs shrink-0">
                  <Database className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">CRM & Database Pipelines</span>
                    <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                      Bi-Directional
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">HubSpot, Salesforce & Neon DB sync</div>
                </div>
              </div>
            </div>

            {/* Center: Glowing WhatsApp Core Engine with Concentric Radar Wave Rings */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 text-center relative py-6">
              {/* Concentric Animated Radar Ripple Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-40 rounded-full border border-emerald-400/30 animate-radar-1 pointer-events-none" />
                <div className="w-40 h-40 rounded-full border border-emerald-400/20 animate-radar-2 pointer-events-none" />
                <div className="w-40 h-40 rounded-full border border-teal-400/15 animate-radar-3 pointer-events-none" />
              </div>

              {/* Center WhatsApp Sphere */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 shadow-[0_20px_50px_rgba(16,185,129,0.38)] flex flex-col items-center justify-center text-white ring-8 ring-emerald-100/90 relative z-10 transition-transform duration-300 hover:scale-105 cursor-pointer">
                <MessageSquare className="w-12 h-12 fill-white stroke-none drop-shadow-md" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 mt-1">Core Engine</span>
              </div>

              <div className="mt-4 relative z-10">
                <span className="font-extrabold text-base text-slate-900 block tracking-tight">CyberLim WhatsApp Hub</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-bold mt-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>1,500 msgs/min • 22ms WebSocket Handshake</span>
                </div>
              </div>
            </div>

            {/* Right Column Nodes (Destinations & Bots) */}
            <div className="md:col-span-4 space-y-4">
              {/* Node 4: AI Chatbots */}
              <div
                onMouseEnter={() => setHoveredNode('ai')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
                  hoveredNode === 'ai'
                    ? 'bg-purple-50/80 border-purple-400 shadow-md ring-2 ring-purple-400/20 -translate-y-0.5'
                    : 'bg-white/95 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span className="p-2.5 rounded-xl bg-purple-100 text-purple-700 shadow-2xs shrink-0">
                  <Bot className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Autonomous AI Agents</span>
                    <span className="text-[9.5px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-full border border-purple-200/60">
                      GPT-4o / Claude
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">24/7 intelligent customer conversations</div>
                </div>
              </div>

              {/* Node 5: Dashboards */}
              <div
                onMouseEnter={() => setHoveredNode('dash')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
                  hoveredNode === 'dash'
                    ? 'bg-teal-50/80 border-teal-400 shadow-md ring-2 ring-teal-400/20 -translate-y-0.5'
                    : 'bg-white/95 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span className="p-2.5 rounded-xl bg-teal-100 text-teal-700 shadow-2xs shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Dashboards & BI Analytics</span>
                    <span className="text-[9.5px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded-full border border-teal-200/60">
                      Real-Time
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Conversion telemetry & double blue tick receipts</div>
                </div>
              </div>

              {/* Node 6: Webhook Consumers */}
              <div
                onMouseEnter={() => setHoveredNode('hook')}
                onMouseLeave={() => setHoveredNode(null)}
                className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
                  hoveredNode === 'hook'
                    ? 'bg-rose-50/80 border-rose-400 shadow-md ring-2 ring-rose-400/20 -translate-y-0.5'
                    : 'bg-white/95 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shadow-2xs shrink-0">
                  <Radio className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Webhook Consumers & n8n</span>
                    <span className="text-[9.5px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200/60">
                      Streaming
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Instant event triggers & Zapier automations</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Architectural Guarantees Footer Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-100 relative z-10 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">✓</span>
              <span>End-to-End WebSocket Encryption</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">✓</span>
              <span>Sub-50ms Message Dispatch Queue</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">✓</span>
              <span>Adaptive Anti-Ban Rate Limiting</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 font-semibold">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">✓</span>
              <span>99.98% High Availability SLA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BEAUTIFUL RICH FOOTER ================= */}
      <footer className="border-t border-slate-200/80 bg-white/95 backdrop-blur-xl pt-16 pb-12 px-6 sm:px-8 lg:px-12 xl:px-16 text-xs text-slate-500 relative z-10">
        {/* Pre-Footer Action Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-8 sm:p-12 mb-16 shadow-xl shadow-emerald-600/15 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Ambient Lighting in Banner */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 max-w-2xl text-center lg:text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200 mb-2 block">
              Start in Seconds • No Credit Card Required
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Ready to automate your WhatsApp communication?
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed">
              Join thousands of businesses and developers sending personalized broadcasts, running 24/7 AI bots, and integrating reliable APIs.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={onEnterStudio}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Launch Studio Free</span>
            </button>
            <button
              onClick={() => onOpenAuth('signin')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main 5-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Info Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 border border-white/50">
                <MessageSquare className="w-4.5 h-4.5 fill-white" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">CyberLim</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Production-ready multi-tenant WhatsApp API and automation platform. High-velocity broadcasting, Baileys & Cloud API pairing, and autonomous AI agents.
            </p>
            <div className="space-y-2 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational • 99.98% SLA</span>
              </div>
              <div className="text-[11px] text-slate-400 block font-mono">
                Instance: live_store_01 • Baileys Engine
              </div>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Product</h5>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#how-it-works" className="hover:text-emerald-600 transition">How It Works</a></li>
              <li><a href="#features" className="hover:text-emerald-600 transition">Broadcast Engine</a></li>
              <li><a href="#demo" className="hover:text-emerald-600 transition">Interactive Tester</a></li>
              <li><a href="#demo" className="hover:text-emerald-600 transition">Motion Showcase</a></li>
              <li><a href="#features" className="hover:text-emerald-600 transition">24/7 Drip Bots</a></li>
              <li><a href="#features" className="hover:text-emerald-600 transition">Anti-Ban Pacing</a></li>
            </ul>
          </div>

          {/* Col 3: Developers */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Developers</h5>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#developers" className="hover:text-emerald-600 transition">REST API Spec</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Node.js / TS SDK</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Python Client</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Webhooks & Events</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">API Documentation</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Swagger Sandbox</a></li>
            </ul>
          </div>

          {/* Col 4: Integrations */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Integrations</h5>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#developers" className="hover:text-emerald-600 transition">Shopify Store</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">HubSpot & Salesforce</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">n8n & Zapier</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">OpenAI & Claude</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Neon PostgreSQL</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Meta Cloud API</a></li>
            </ul>
          </div>

          {/* Col 5: Security & Trust */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Trust & Legal</h5>
            <ul className="space-y-2 text-slate-600">
              <li><a href="#developers" className="hover:text-emerald-600 transition">Privacy Policy</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Terms of Service</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Security Overview</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Multi-Tenant Isolation</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Status Page</a></li>
              <li><a href="#developers" className="hover:text-emerald-600 transition">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Ribbon */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 CyberLim Technologies Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-bit SSL Encrypted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>PostgreSQL Neon DB</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Crafted for high-growth messaging</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
