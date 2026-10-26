import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  MessageSquare, LayoutDashboard, Megaphone, Users, Zap, Code2, BarChart3,
  Settings, Search, Bell, Clock, Send, CheckCircle2, Lock, Smartphone,
  MousePointer2, Link2, Terminal, Check, Phone, Video
} from 'lucide-react';

const W = 800;
const H = 560;
const NUMBER_TEXT = '+91 97613 00000, +1 415 890 0000, +44 791 100 0000';
const MESSAGE_TEXT = 'Hi {{name}}! 👋 Flash Sale 25% OFF is LIVE! Use code VIP25 🚀';
const LINK_TEXT = 'cyberlim.com/offer';

const RECIPIENTS = [
  { name: 'Priya', country: '🇮🇳', x: 20, color: 'bg-emerald-500', reply: 'Ordered! ❤️' },
  { name: 'Alex', country: '🇺🇸', x: 220, color: 'bg-blue-500', reply: 'Got mine! 🔥' },
  { name: 'Anita', country: '🇬🇧', x: 420, color: 'bg-purple-500', reply: "Can't wait! 🎉" },
];

export interface HeroMockupShowcaseProps {
  align?: 'center' | 'right';
  className?: string;
  maxScale?: number;
}

export const HeroMockupShowcase: React.FC<HeroMockupShowcaseProps> = ({
  align = 'right',
  className = '',
  maxScale = 1,
}) => {
  const outer = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!outer.current) return;
    const ro = new ResizeObserver(([e]) => {
      const containerWidth = e.contentRect.width;
      setScale(Math.min(maxScale, containerWidth / W));
    });
    ro.observe(outer.current);
    return () => ro.disconnect();
  }, [maxScale]);

  useEffect(() => {
    if (!root.current) return;
    const el = root.current;
    const q = (s: string) => el.querySelector<HTMLElement>(s)!;
    const qa = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));

    const type = (target: HTMLElement, text: string, duration: number) => {
      const o = { n: 0 };
      return gsap.to(o, {
        n: text.length,
        duration,
        ease: 'none',
        onUpdate: () => {
          target.textContent = text.slice(0, Math.round(o.n));
        },
      });
    };

    const ctx = gsap.context(() => {
      // 1. Floating icon badges gentle bobbing
      gsap.to('.float-badge-1', { y: -10, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.float-badge-2', { y: 9, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.3 });
      gsap.to('.float-badge-3', { y: -8, duration: 3.0, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.7 });
      gsap.to('.float-badge-4', { y: 8, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.2 });
      gsap.to('.float-badge-5', { y: -9, duration: 3.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 });
      gsap.to('.float-progress', { y: -6, duration: 3.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 });

      // 2. Head helper
      const setHead = (t: string, s: string, label: string, cls: string) => () => {
        q('.c-title').textContent = t;
        q('.c-sub').textContent = s;
        const status = q('.c-status');
        status.textContent = label;
        status.className = `c-status text-[11px] font-bold px-3.5 py-1 rounded-full border ${cls}`;
      };

      const setNav = (idx: number) => () => {
        qa('.nav-item').forEach((item, i) => {
          if (i === idx) {
            item.className = 'nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/70 shadow-2xs transition';
          } else {
            item.className = 'nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 transition font-medium';
          }
        });
      };

      const amber = 'bg-amber-50 text-amber-700 border-amber-200';
      const green = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      const blue = 'bg-blue-50 text-blue-700 border-blue-200';
      const teal = 'bg-teal-50 text-teal-700 border-teal-200';

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });

      // ================= RESET =================
      tl.call(() => {
        q('.num-input').textContent = '';
        q('.msg-input').textContent = '';
        q('.lnk-input').textContent = '';
        q('.prog-count').textContent = '0 / 1500';
        q('.prog-pct').textContent = '0%';
        q('.prog-bar').style.width = '0%';
        setHead('Connect WhatsApp', 'Scan QR to link instance live_store_01', 'Pairing Required', amber)();
        setNav(0)();
      });

      tl.set('.layer-qr', { opacity: 1, display: 'flex' })
        .set(['.layer-ok', '.layer-compose', '.layer-auto', '.layer-api'], { opacity: 0, display: 'none' })
        .set('.ph-scan', { opacity: 1 })
        .set('.ph-linked', { opacity: 0 })
        .set('.phone-scanner', { x: 380, y: 15, rotate: 8, opacity: 1 })
        .set('.laser-beam', { y: 0, opacity: 0 })
        .set('.check-icon', { scale: 0 })
        .set('.ripple-ring', { scale: 0.3, opacity: 0 })
        .set('.crm-cursor', { x: 340, y: 340, opacity: 0 })
        .set('.send-button', { scale: 1 })
        .set('.msg-flyer', { opacity: 0, x: 290, y: 220, scale: 0.5 })
        .set('.recip-box', { opacity: 0, y: 28 })
        .set('.reply-bubble', { opacity: 0, y: 6 })
        .set('.done-toast', { opacity: 0, y: 12 })
        .set('.att-box', { opacity: 0, scale: 0.9 })
        .set('.upload-bar', { width: '0%' })
        .set('.auto-node', { borderColor: '#e2e8f0', backgroundColor: '#ffffff', boxShadow: 'none' })
        .set('.auto-line', { backgroundColor: '#e2e8f0' })
        .set(['.chat-user-msg', '.chat-bot-reply', '.chat-time-div', '.chat-bot-reminder', '.chat-dots'], { opacity: 0, y: 8 });

      // ================= 1. PHONE SCANS QR =================
      // Slides directly in front of the QR canvas smoothly
      tl.to('.phone-scanner', { x: -360, rotate: -2, duration: 1.2, ease: 'power3.out' })
        .to('.laser-beam', { opacity: 1, duration: 0.15 }, '-=0.25')
        .to('.laser-beam', { y: 155, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: 1 })
        .to('.qr-canvas', { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1 })
        .to('.laser-beam', { opacity: 0, duration: 0.1 });

      // ================= 2. CONNECTED =================
      tl.call(setHead('WhatsApp Connected', 'Instance live_store_01 active • WebSocket 22ms', 'Connected (OPEN)', green))
        .to('.layer-qr', { opacity: 0, duration: 0.25 })
        .set('.layer-qr', { display: 'none' })
        .set('.layer-ok', { display: 'flex' })
        .to('.layer-ok', { opacity: 1, duration: 0.25 })
        .to('.check-icon', { scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, '<0.1')
        .to('.ripple-ring', { scale: 2.6, opacity: 0.5, duration: 0.2 }, '<')
        .to('.ripple-ring', { opacity: 0, duration: 0.7, ease: 'power2.out' }, '>')
        .to('.ph-scan', { opacity: 0, duration: 0.25 }, '<-0.5')
        .to('.ph-linked', { opacity: 1, duration: 0.25 }, '<')
        .to({}, { duration: 0.9 })
        .to('.phone-scanner', { x: 420, rotate: 10, duration: 0.7, ease: 'power2.in' });

      // ================= 3. COMPOSE CAMPAIGN =================
      tl.call(setHead('Campaign Manager', 'Compose bulk campaign with image & CTA link', 'Composing', blue))
        .call(setNav(1))
        .to('.layer-ok', { opacity: 0, duration: 0.25 })
        .set('.layer-ok', { display: 'none' })
        .set('.layer-compose', { display: 'block' })
        .to('.layer-compose', { opacity: 1, duration: 0.25 })
        .add(type(q('.num-input'), NUMBER_TEXT, 1.2))
        .add(type(q('.msg-input'), MESSAGE_TEXT, 1.3), '+=0.1')
        // attach image
        .to('.att-img-card', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, '+=0.1')
        .to('.upload-bar', { width: '100%', duration: 0.65, ease: 'power1.inOut' })
        // attach link
        .to('.att-link-card', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, '+=0.1')
        .add(type(q('.lnk-input'), LINK_TEXT, 0.6))
        // click send
        .to('.crm-cursor', { opacity: 1, duration: 0.2 }, '+=0.15')
        .to('.crm-cursor', { x: 310, y: 250, duration: 0.65, ease: 'power2.inOut' })
        .to('.send-button', { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 })
        .call(setHead('Campaign Live', 'Sending 1,500 messages with anti-ban jitter', 'Broadcasting…', green))
        .to('.crm-cursor', { opacity: 0, duration: 0.2 })
        .to('.recip-box', { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }, '<');

      // ================= 4. BULK BROADCAST TO MULTIPLE PHONES =================
      const bulkTl = gsap.timeline();
      RECIPIENTS.forEach((r, i) => {
        const at = i * 0.3;
        bulkTl
          .to(`.msg-flyer-${i}`, { opacity: 1, scale: 1, duration: 0.15 }, at)
          .to(`.msg-flyer-${i}`, { x: r.x + 72, y: 320, duration: 0.75, ease: 'power2.inOut' }, at)
          .to(`.msg-flyer-${i}`, { opacity: 0, scale: 0.4, duration: 0.15 }, at + 0.75)
          .to(`.bubble-card-${i}`, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, at + 0.8)
          .to(`.tick-icon-${i}`, { color: '#3b82f6', duration: 0.25 }, at + 1.3)
          .to(`.reply-bubble-${i}`, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.8)' }, at + 1.8);
      });

      const countObj = { n: 0 };
      bulkTl.to(countObj, {
        n: 1200,
        duration: 2.5,
        ease: 'power1.inOut',
        onUpdate: () => {
          const val = Math.round(countObj.n);
          q('.prog-count').textContent = `${val.toLocaleString()} / 1500`;
          const pct = Math.round((val / 1500) * 100);
          q('.prog-pct').textContent = `${pct}%`;
          q('.prog-bar').style.width = `${pct}%`;
        },
      }, 0.1);

      tl.add(bulkTl)
        .call(setHead('Campaign Complete', '1,200/1,500 delivered • 98% delivery rate', 'Delivered ✓', green))
        .to('.done-toast', { opacity: 1, y: 0, duration: 0.35 })
        .to({}, { duration: 1.6 });

      // ================= 5. AUTOMATIONS FLOW (24/7 Drip Bot) =================
      tl.to(['.layer-compose', '.recip-box', '.done-toast'], { opacity: 0, duration: 0.3 })
        .set('.layer-compose', { display: 'none' })
        .set('.layer-auto', { display: 'flex' })
        .call(setHead('Automations', 'Keyword triggers & multi-step drip sequences', 'Automation ON', green))
        .call(setNav(3))
        .to('.layer-auto', { opacity: 1, duration: 0.3 })
        .to('.auto-node-1', { borderColor: '#10b981', backgroundColor: '#ecfdf5', boxShadow: '0 4px 14px rgba(16,185,129,0.14)', duration: 0.3 })
        .to('.chat-user-msg', { opacity: 1, y: 0, duration: 0.35 }, '<')
        .to('.chat-dots', { opacity: 1, y: 0, duration: 0.2 }, '+=0.2')
        .to('.chat-dots', { opacity: 0, duration: 0.2 }, '+=0.8')
        .to('.auto-line-1', { backgroundColor: '#10b981', duration: 0.25 })
        .to('.auto-node-2', { borderColor: '#10b981', backgroundColor: '#ecfdf5', boxShadow: '0 4px 14px rgba(16,185,129,0.14)', duration: 0.3 })
        .to('.chat-bot-reply', { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.8)' }, '<0.1')
        .to('.auto-line-2', { backgroundColor: '#10b981', duration: 0.25 }, '+=0.6')
        .to('.chat-time-div', { opacity: 1, y: 0, duration: 0.3 }, '+=0.4')
        .to('.auto-node-3', { borderColor: '#10b981', backgroundColor: '#ecfdf5', boxShadow: '0 4px 14px rgba(16,185,129,0.14)', duration: 0.3 })
        .to('.chat-bot-reminder', { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.8)' }, '<0.1')
        .to('.auto-line-3', { backgroundColor: '#10b981', duration: 0.25 }, '+=0.4')
        .to('.auto-node-4', { borderColor: '#10b981', backgroundColor: '#ecfdf5', boxShadow: '0 4px 14px rgba(16,185,129,0.14)', duration: 0.3 })
        .to({}, { duration: 2.2 });

      // ================= 6. DEVELOPER API SANDBOX =================
      tl.to('.layer-auto', { opacity: 0, duration: 0.3 })
        .set('.layer-auto', { display: 'none' })
        .set('.layer-api', { display: 'flex' })
        .call(setHead('Developer API', 'Send via REST API & receive real-time webhooks', 'HTTP 200 OK', teal))
        .call(setNav(4))
        .to('.layer-api', { opacity: 1, duration: 0.3 })
        .to({}, { duration: 2.4 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={outer}
      className={`w-full relative select-none flex ${align === 'center' ? 'justify-center' : 'justify-center lg:justify-end'} ${className}`}
      style={{ height: H * scale }}
    >
      <div
        ref={root}
        className={`relative ${align === 'center' ? 'origin-top' : 'origin-top-center lg:origin-top-right'}`}
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        {/* Soft Ambient Radial Mint Glow in the Background */}
        <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-300/45 via-teal-200/30 to-transparent rounded-[80px] blur-3xl pointer-events-none" />

        {/* Curved Dotted Trajectory Lines looping around */}
        <svg className="absolute -top-10 -left-10 w-[880px] h-[640px] pointer-events-none z-0 opacity-70" fill="none">
          <path
            d="M 40 280 C 30 110, 220 25, 460 25 C 660 25, 780 90, 770 230"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />
          <path
            d="M 750 210 C 810 300, 800 470, 670 520 C 560 560, 390 550, 260 535"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />
        </svg>

        {/* ================= FLOATING ICON BADGES ================= */}
        {/* 1. WhatsApp Icon Badge (Top Right) */}
        <div className="float-badge-1 absolute -top-4 right-14 z-30 w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-[0_18px_40px_rgba(37,211,102,0.48)] border-2 border-white">
          <svg className="w-7.5 h-7.5 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </div>

        {/* 2. Code `</>` Icon Badge (Far Right) */}
        <div className="float-badge-2 absolute top-28 -right-3 z-30 w-13 h-13 rounded-2xl bg-white flex items-center justify-center text-slate-800 shadow-[0_18px_36px_rgba(15,23,42,0.12)] border border-slate-100">
          <Code2 className="w-6.5 h-6.5 text-slate-700" />
        </div>

        {/* 3. Send / Paper Plane Badge (Mid-Right) */}
        <div className="float-badge-3 absolute top-62 -right-1 z-30 w-13 h-13 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shadow-[0_18px_36px_rgba(37,99,235,0.2)] border border-blue-100/90">
          <Send className="w-5.5 h-5.5 text-[#2563EB]" />
        </div>

        {/* 4. Chat Bubble Badge (Mid-Left) */}
        <div className="float-badge-4 absolute top-48 -left-6 z-30 w-13 h-13 rounded-2xl bg-[#10B981] flex items-center justify-center text-white shadow-[0_18px_36px_rgba(16,185,129,0.4)] border-2 border-white">
          <MessageSquare className="w-6.5 h-6.5 fill-white" />
        </div>

        {/* 5. Users Badge (Lower-Left) */}
        <div className="float-badge-5 absolute top-92 -left-8 z-30 w-13 h-13 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shadow-[0_18px_36px_rgba(37,99,235,0.18)] border border-blue-100/90">
          <Users className="w-5.5 h-5.5 text-[#2563EB]" />
        </div>

        {/* ================= MAIN CRM WINDOW (EXPANDED & FILLED FROSTED GLASS UI) ================= */}
        <div className="absolute left-6 top-4 w-[730px] h-[510px] rounded-[34px] bg-white/85 backdrop-blur-2xl border border-white/95 shadow-[0_35px_90px_-15px_rgba(16,185,129,0.25),0_20px_50px_-10px_rgba(15,23,42,0.1),inset_0_1px_2px_rgba(255,255,255,1)] overflow-hidden z-10 flex flex-col">
          {/* Browser Chrome Header */}
          <div className="h-11 px-5 flex items-center gap-3 bg-white/70 backdrop-blur-md border-b border-slate-200/50 shrink-0">
            <div className="flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/40" />
            </div>

            {/* Address Bar Pill */}
            <div className="flex-1 max-w-[300px] mx-auto h-7.5 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200/60 flex items-center justify-center gap-2 text-[11.5px] text-slate-500 font-mono shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>app.cyberlim.com/crm</span>
            </div>

            <div className="w-8" />
          </div>

          {/* CRM Internal Body */}
          <div className="flex-1 flex overflow-hidden bg-[#FAFBFB]/80 backdrop-blur-md">
            {/* Sidebar with Navigation */}
            <aside className="w-[140px] shrink-0 bg-white/60 backdrop-blur-md border-r border-slate-200/50 flex flex-col py-3.5 px-2.5 gap-1">
              <div className="flex items-center gap-2.5 px-1 mb-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                  <MessageSquare className="w-4.5 h-4.5 fill-white" />
                </div>
                <span className="font-black text-sm text-slate-900 tracking-tight">CyberLim</span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 transition font-medium">
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard</span>
                </div>
                <div className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 transition font-medium">
                  <Megaphone className="w-4 h-4 shrink-0" />
                  <span>Campaigns</span>
                </div>
                <div className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 transition font-medium">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Contacts</span>
                </div>
                <div className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 transition font-medium">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Automation</span>
                </div>
                <div className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 transition font-medium">
                  <Code2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">API & Events</span>
                </div>
                <div className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 transition font-medium">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Analytics</span>
                </div>
                <div className="nav-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 transition font-medium">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Settings</span>
                </div>
              </div>
            </aside>

            {/* Main CRM Area */}
            <div className="flex-1 min-w-0 flex flex-col bg-white/70 backdrop-blur-md">
              {/* Dynamic Top Bar */}
              <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200/50 bg-white/60 backdrop-blur-sm shrink-0">
                <div>
                  <div className="c-title text-[13.5px] font-extrabold text-slate-900 leading-tight">Connect WhatsApp</div>
                  <div className="c-sub text-[10.5px] text-slate-400 font-medium">Scan QR to link instance live_store_01</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="c-status text-[11px] font-bold px-3.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                    Pairing Required
                  </span>
                  <Search className="w-4 h-4 text-slate-400" />
                  <Bell className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Dynamic Layer Container */}
              <div className="relative flex-1 overflow-hidden bg-[#FAFBFB]">
                {/* ======== 1. QR CODE SCAN LAYER ======== */}
                <div className="layer-qr absolute inset-0 flex items-center px-9 gap-9">
                  {/* Left: QR Canvas */}
                  <div className="qr-canvas relative w-[185px] h-[185px] shrink-0 bg-slate-900 rounded-3xl p-3.5 overflow-hidden border-2 border-emerald-500/40 shadow-xl">
                    <div className="grid grid-cols-7 gap-1 w-full h-full">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs ${
                            (i * 7 + (i % 5)) % 3 === 0 || [0, 6, 42, 48].includes(i) ? 'bg-emerald-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-md">
                        <MessageSquare className="w-5 h-5 fill-white" />
                      </div>
                    </div>
                    <div className="laser-beam absolute left-2 right-2 top-2 h-1 rounded bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 shadow-[0_0_16px_#10B981]" />
                  </div>

                  {/* Right: Steps Instructions */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-[14px] font-extrabold text-slate-900 mb-1">Pair WhatsApp Instance</div>
                    <div className="text-[11.5px] text-slate-500 mb-4">Sync your business number in 3 simple steps</div>
                    <ol className="space-y-3.5 text-[11.5px] text-slate-700 font-medium">
                      {['Open WhatsApp on your mobile phone', 'Tap Settings → Linked Devices', 'Point your camera at this QR code'].map((t, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{t}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* ======== 2. CONNECTED LAYER ======== */}
                <div className="layer-ok absolute inset-0 flex flex-col items-center justify-center gap-3.5 px-10">
                  <div className="relative">
                    <div className="ripple-ring absolute inset-0 rounded-2xl bg-emerald-400" />
                    <div className="check-icon relative w-18 h-18 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                  </div>
                  <div className="text-xl font-black text-slate-900">Device Linked to CRM!</div>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {['+91 98765 43210', 'WebSocket 22ms', 'Multi-device Active'].map((t) => (
                      <span key={t} className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ======== 3. COMPOSE & BROADCAST LAYER ======== */}
                <div className="layer-compose absolute inset-0 px-6 pt-4 space-y-3">
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target Phone Numbers</div>
                    <div className="min-h-[32px] px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-mono text-slate-800 truncate">
                      <span className="num-input" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mb-1">Campaign Message</div>
                    <div className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-[11.5px] text-slate-800 leading-snug">
                      <span className="msg-input" />
                    </div>
                  </div>

                  {/* Attachments: Image + Link Button */}
                  <div className="grid grid-cols-2 gap-3 h-[52px]">
                    <div className="att-box att-img-card flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-300 to-rose-500 text-white text-sm flex items-center justify-center shrink-0 font-bold shadow-xs">
                        🛍️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                          <span className="truncate">flash-sale.jpg</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="upload-bar h-full w-0 bg-emerald-500" />
                        </div>
                      </div>
                    </div>

                    <div className="att-box att-link-card flex items-center gap-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[11px]">
                      <span className="p-1.5 rounded-md bg-blue-50 text-blue-600"><Link2 className="w-3.5 h-3.5" /></span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-700 text-[10px]">Button: Shop Now →</div>
                        <div className="font-mono text-blue-600 text-[10px] truncate"><span className="lnk-input" /></div>
                      </div>
                    </div>
                  </div>

                  <button className="send-button w-full py-2.5 rounded-xl bg-emerald-500 text-white text-[12.5px] font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25">
                    <Send className="w-4 h-4" />
                    <span>Send Bulk Campaign (1,500 contacts)</span>
                  </button>
                </div>

                {/* Recipient Phones in Broadcast Mode */}
                {RECIPIENTS.map((r, i) => (
                  <div
                    key={r.name}
                    className="recip-box absolute bottom-0 w-[150px] h-[135px] bg-slate-950 rounded-t-[24px] p-2 pb-0 border-2 border-b-0 border-slate-800 shadow-xl z-20"
                    style={{ left: r.x }}
                  >
                    <div className="h-1.5 w-12 bg-slate-900 rounded-full mx-auto mb-1" />
                    <div className="bg-[#EFEAE2] rounded-t-[18px] h-[calc(100%-8px)] p-2">
                      <div className="flex items-center gap-1.5 bg-emerald-700 text-white rounded-md px-1.5 py-0.5 mb-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${r.color} text-[8px] font-bold flex items-center justify-center`}>
                          {r.name[0]}
                        </span>
                        <span className="text-[9px] font-bold">{r.name}</span>
                        <span className="text-[9px] ml-auto">{r.country}</span>
                      </div>
                      <div className={`bubble-card-${i} bg-white rounded-lg p-1 text-[8.5px] text-slate-800 leading-tight shadow-xs`}>
                        <div className="h-7 rounded bg-gradient-to-r from-amber-400 to-rose-500 text-white text-[8.5px] font-bold flex items-center justify-center gap-1 mb-0.5">
                          <span>🛍️ 25% OFF</span>
                        </div>
                        <div className="truncate font-medium">Hi {r.name}! Sale is LIVE 🚀</div>
                        <div className="text-right -mb-0.5">
                          <CheckCircle2 className={`tick-icon-${i} inline w-3 h-3`} />
                        </div>
                      </div>
                      <div className={`reply-bubble reply-bubble-${i} ml-auto mt-1 w-fit bg-[#D9FDD3] rounded px-2 py-0.5 text-[7.5px] text-slate-900 font-bold shadow-2xs`}>
                        {r.reply}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Flying Messages */}
                {RECIPIENTS.map((_, i) => (
                  <div
                    key={i}
                    className={`msg-flyer msg-flyer-${i} absolute left-0 top-0 z-30 w-7.5 h-7.5 rounded-xl bg-gradient-to-br from-amber-300 to-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-xs`}
                  >
                    🛍️
                  </div>
                ))}

                {/* Delivered Toast */}
                <div className="done-toast absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center gap-2 shadow-xl whitespace-nowrap">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1,200 messages delivered with image + link</span>
                </div>

                {/* Mouse Cursor Pointer */}
                <div className="crm-cursor absolute left-0 top-0 z-40 pointer-events-none drop-shadow-md">
                  <MousePointer2 className="w-5 h-5 fill-slate-900 text-white" />
                </div>

                {/* ======== 4. AUTOMATION FLOW LAYER (FILLED & EXPANDED) ======== */}
                <div className="layer-auto absolute inset-0 p-4.5 flex gap-4.5 bg-[#FAFBFB]">
                  {/* Left Flow Builder */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center justify-between mb-3 px-0.5">
                        <span className="text-[13px] font-extrabold text-slate-900">Offer Auto-Reply Flow</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <span>Active (24/7)</span>
                          <div className="w-10 h-5.5 rounded-full p-0.5 bg-emerald-500 flex items-center justify-end shadow-2xs">
                            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0 relative">
                        {/* Flow Node 1 */}
                        <div className="auto-node auto-node-1 p-2.5 rounded-2xl border border-slate-200/90 bg-white flex items-center gap-3 transition shadow-xs">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Zap className="w-4.5 h-4.5 text-amber-600 fill-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-slate-900 leading-tight">Trigger: Keyword Match</div>
                            <div className="text-[10px] text-slate-500 truncate leading-tight">Customer sends "OFFER" (or case-insensitive)</div>
                          </div>
                        </div>

                        <div className="auto-line auto-line-1 w-0.5 h-3 bg-slate-200 ml-6 my-0.5 transition" />

                        {/* Flow Node 2 */}
                        <div className="auto-node auto-node-2 p-2.5 rounded-2xl border border-slate-200/90 bg-white flex items-center gap-3 transition shadow-xs">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4.5 h-4.5 text-emerald-600 fill-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-slate-900 leading-tight">Auto-reply · Instant</div>
                            <div className="text-[10px] text-slate-500 truncate leading-tight">Image + 25% Coupon + "Shop Now" button</div>
                          </div>
                        </div>

                        <div className="auto-line auto-line-2 w-0.5 h-3 bg-slate-200 ml-6 my-0.5 transition" />

                        {/* Flow Node 3 */}
                        <div className="auto-node auto-node-3 p-2.5 rounded-2xl border border-slate-200/90 bg-white flex items-center gap-3 transition shadow-xs">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <Clock className="w-4.5 h-4.5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-slate-900 leading-tight">Smart Delay: Wait 24h</div>
                            <div className="text-[10px] text-slate-500 truncate leading-tight">Drip reminder if no checkout action</div>
                          </div>
                        </div>

                        <div className="auto-line auto-line-3 w-0.5 h-3 bg-slate-200 ml-6 my-0.5 transition" />

                        {/* Flow Node 4 */}
                        <div className="auto-node auto-node-4 p-2.5 rounded-2xl border border-slate-200/90 bg-white flex items-center gap-3 transition shadow-xs">
                          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4.5 h-4.5 text-teal-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11.5px] font-bold text-slate-900 leading-tight">Conversion Tracked</div>
                            <div className="text-[10px] text-slate-500 truncate leading-tight">Syncs to CRM & triggers webhook</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 pt-1">
                      <span className="text-amber-500">⚡</span>
                      <span>Runs 24/7 autonomously · zero manual work</span>
                    </div>
                  </div>

                  {/* Customer Phone Simulator (Filled & Sits Flush) */}
                  <div className="w-[225px] h-[365px] bg-slate-950 rounded-[32px] p-2 border-4 border-slate-800 shadow-2xl shrink-0 flex flex-col overflow-hidden">
                    <div className="h-1.5 w-14 bg-slate-900 rounded-full mx-auto mb-1.5 shrink-0" />
                    <div className="flex-1 bg-[#EFEAE2] rounded-[24px] p-2 flex flex-col justify-between overflow-hidden relative">
                      {/* Phone WhatsApp Header */}
                      <div className="bg-emerald-700 text-white rounded-xl px-2 py-1.5 text-[9.5px] font-bold flex items-center gap-1.5 shadow-xs shrink-0">
                        <div className="w-4 h-4 rounded-full bg-white text-emerald-700 flex items-center justify-center font-bold text-[7.5px]">
                          <MessageSquare className="w-2.5 h-2.5 fill-emerald-700" />
                        </div>
                        <div className="min-w-0 flex-1 leading-none">
                          <div className="truncate font-bold">CyberLim Store</div>
                          <div className="text-[7.5px] text-emerald-200 font-normal">online</div>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/90">
                          <Video className="w-3 h-3" />
                          <Phone className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      {/* Chat Bubbles */}
                      <div className="space-y-1.5 overflow-hidden py-1">
                        <div className="chat-user-msg ml-auto w-fit bg-[#D9FDD3] rounded-lg rounded-tr-none px-2.5 py-1 text-[9.5px] text-slate-900 font-medium shadow-2xs">
                          OFFER
                        </div>

                        <div className="chat-dots w-fit bg-white rounded-lg rounded-tl-none px-2.5 py-1.5 flex items-center gap-1 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]" />
                        </div>

                        <div className="chat-bot-reply w-full bg-white rounded-lg rounded-tl-none p-1.5 shadow-2xs space-y-1">
                          <div className="h-12 rounded-md bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 flex items-center justify-center text-white text-[9.5px] font-extrabold gap-1.5 shadow-2xs">
                            <span>🛍️</span>
                            <span>VIP SALE · 25% OFF</span>
                          </div>
                          <div className="text-[8.5px] text-slate-800 leading-snug px-0.5 font-medium">
                            Here's your exclusive 25% OFF 🎁 Valid today only! Use code <b>VIP25</b>
                          </div>
                          <div className="border-t border-slate-100 pt-0.5 text-center text-[8.5px] font-bold text-sky-600">
                            🔗 Shop Now →
                          </div>
                        </div>

                        <div className="chat-time-div text-center my-0.5">
                          <span className="px-2 py-0.5 rounded-full bg-white/80 text-[7.5px] font-bold text-slate-500 shadow-2xs">
                            Next day • 10:00 AM
                          </span>
                        </div>

                        <div className="chat-bot-reminder w-full bg-white rounded-lg rounded-tl-none px-2.5 py-1.5 text-[8.5px] text-slate-800 shadow-2xs leading-tight font-medium">
                          ⏰ Reminder: your 25% OFF ends tonight!{' '}
                          <span className="text-sky-600 font-bold">cyberlim.com/offer</span>
                        </div>
                      </div>

                      <div className="h-0.5" />
                    </div>
                  </div>
                </div>

                {/* ======== 5. DEVELOPER API SANDBOX LAYER ======== */}
                <div className="layer-api absolute inset-0 p-5.5 flex flex-col justify-between bg-slate-950 text-slate-200 font-mono text-[11px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Terminal className="w-4.5 h-4.5" />
                      <span>REST API & Webhooks Engine</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">200 OK • 18ms</span>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 space-y-1.5 leading-relaxed text-[11px]">
                    <div className="text-emerald-400 font-bold">POST https://api.cyberlim.com/v1/messages</div>
                    <div className="text-slate-400">Authorization: Bearer sec_live_948f98...</div>
                    <div className="text-slate-300">
                      &#123;<br />
                      &nbsp;&nbsp;<span className="text-sky-300">"number"</span>: <span className="text-emerald-300">"+919876543210"</span>,<br />
                      &nbsp;&nbsp;<span className="text-sky-300">"text"</span>: <span className="text-emerald-300">"Flash Sale 25% OFF!"</span>,<br />
                      &nbsp;&nbsp;<span className="text-sky-300">"webhook"</span>: <span className="text-amber-300">"https://your-crm.com/events"</span><br />
                      &#125;
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 border-t border-slate-800 pt-2.5">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Check className="w-4 h-4" /> Webhook event: message.delivered
                    </span>
                    <span>99.99% Uptime SLA</span>
                  </div>
                </div>

                {/* ======== 6. SCANNING PHONE (Slides in during QR phase) ======== */}
                <div className="phone-scanner absolute right-4 top-7 w-[175px] h-[310px] z-30 bg-slate-950 rounded-[32px] p-2 border-4 border-slate-800 shadow-2xl">
                  <div className="h-2 w-12 bg-slate-900 rounded-full mx-auto mb-1.5" />
                  <div className="relative h-[calc(100%-16px)] rounded-[24px] overflow-hidden">
                    <div className="ph-scan absolute inset-0 bg-slate-900 text-white p-3.5 flex flex-col justify-between">
                      <div className="text-[9.5px] text-emerald-400 font-bold">WhatsApp • Scan</div>
                      <div className="relative w-26 h-26 mx-auto">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                      </div>
                      <div className="text-[9.5px] text-center text-slate-400 font-medium">Scanning QR…</div>
                    </div>
                    <div className="ph-linked absolute inset-0 bg-[#EFEAE2] p-2.5 space-y-2">
                      <div className="bg-emerald-600 text-white p-2 rounded-xl text-[10.5px] font-bold flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" /> Linked Devices
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200 text-[10.5px]">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>CyberLim CRM</span>
                          <span className="text-emerald-600 font-extrabold">Active</span>
                        </div>
                        <div className="text-[9.5px] text-slate-500">Chrome • Windows</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FLOATING OVERLAY: CAMPAIGN PROGRESS CARD (FROSTED GLASS UI) ================= */}
        <div className="float-progress absolute -bottom-2 -left-2 z-30 w-[225px] rounded-2xl bg-white/95 backdrop-blur-2xl border border-white/95 p-4 shadow-[0_26px_55px_rgba(0,0,0,0.14),0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)]">
          <div className="text-[11px] font-bold text-slate-700 mb-1">Campaign Progress</div>
          <div className="flex items-center justify-between mb-2">
            <span className="prog-count text-[15px] font-extrabold text-slate-900 font-mono tracking-tight">1200 / 1500</span>
            <span className="prog-pct text-[11.5px] font-bold text-emerald-600 font-mono">80%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="prog-bar h-full w-[80%] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.55)] transition-all duration-300" />
          </div>
        </div>

        {/* ================= BOTTOM RIGHT HANDWRITTEN ANNOTATION ================= */}
        <div className="absolute -bottom-2 right-12 z-20 flex flex-col items-center pointer-events-none">
          <div className="font-serif italic text-slate-600/90 text-sm font-semibold leading-tight text-center tracking-wide">
            Automate<br />
            Engage<br />
            Grow
          </div>
          <svg className="w-8 h-8 text-emerald-500 mt-0.5 stroke-current" viewBox="0 0 40 40" fill="none">
            <path
              d="M 12 30 C 18 20, 26 12, 32 10 M 24 9 L 32 10 L 31 18"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
