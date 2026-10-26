import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  MessageSquare, CheckCircle2, Send, Smartphone, MousePointer2,
  LayoutDashboard, Inbox, Megaphone, Users, Settings, Search, Bell, ShieldCheck,
} from 'lucide-react';

const W = 600;
const H = 480;
const NUMBER_TEXT = '+91 97613 00000, +1 415 890 0000, +44 791 100 0000';
const MESSAGE_TEXT = 'Hi {{name}}! 👋 Flash Sale 25% OFF is LIVE! Use code VIP25 🚀';

const RECIPIENTS = [
  { name: 'Priya', country: '🇮🇳', x: 20, color: 'bg-emerald-500', reply: 'Ordered! ❤️' },
  { name: 'Alex', country: '🇺🇸', x: 202, color: 'bg-blue-500', reply: 'Grabbed mine! 🔥' },
  { name: 'Anita', country: '🇬🇧', x: 384, color: 'bg-purple-500', reply: "Can't wait! 🎉" },
];

export const HeroCRMCard: React.FC = () => {
  const outer = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Responsive scaling of the fixed 600x480 stage
  useLayoutEffect(() => {
    if (!outer.current) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / W)));
    ro.observe(outer.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!root.current) return;
    const el = root.current;
    const q = (s: string) => el.querySelector<HTMLElement>(s)!;

    const type = (target: HTMLElement, text: string, duration: number) => {
      const o = { n: 0 };
      return gsap.to(o, {
        n: text.length, duration, ease: 'none',
        onUpdate: () => { target.textContent = text.slice(0, Math.round(o.n)); },
      });
    };

    const ctx = gsap.context(() => {
      const status = q('.status');
      const title = q('.title');
      const subtitle = q('.subtitle');
      const amber = 'bg-amber-50 text-amber-700 border-amber-200';
      const green = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      const blue = 'bg-blue-50 text-blue-700 border-blue-200';
      const setHead = (t: string, s: string, label: string, cls: string) => () => {
        title.textContent = t;
        subtitle.textContent = s;
        status.textContent = label;
        status.className = `status text-[10px] font-bold px-2.5 py-1 rounded-full border ${cls}`;
      };

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

      // ---------- RESET ----------
      tl.call(() => {
        q('.num').textContent = '';
        q('.msg').textContent = '';
        q('.counter').textContent = '0';
        q('.s-sent').textContent = '0';
        q('.s-del').textContent = '0';
        q('.s-read').textContent = '0';
        q('.bar').style.width = '0%';
        setHead('Connect WhatsApp', 'Link your number to start sending', 'Pairing Required', amber)();
      });
      tl.set('.layer-qr', { opacity: 1 })
        .set(['.layer-ok', '.layer-compose'], { opacity: 0 })
        .set('.ph-scan', { opacity: 1 })
        .set('.ph-linked', { opacity: 0 })
        .set('.phone', { x: 320, y: 0, rotate: 10, opacity: 1 })
        .set('.laser', { y: 0, opacity: 0 })
        .set('.check', { scale: 0 })
        .set('.ring', { scale: 0.3, opacity: 0 })
        .set('.cursor', { x: 300, y: 330, opacity: 0 })
        .set('.send-btn', { scale: 1 })
        .set('.flyer', { opacity: 0, x: 270, y: 232, scale: 0.6 })
        .set('.bubble', { opacity: 0, y: 8, scale: 0.9 })
        .set('.reply', { opacity: 0, y: 6 })
        .set('.tick', { color: '#94a3b8' })
        .set('.recip', { opacity: 0, y: 24 })
        .set('.done', { opacity: 0, y: 10 })
        .set('.chip', { opacity: 0, scale: 0.7 });

      // ---------- 1. PHONE SCANS QR ----------
      tl.to('.phone', { x: -190, rotate: -3, duration: 1.2, ease: 'power3.out' })
        .to('.laser', { opacity: 1, duration: 0.15 }, '-=0.25')
        .to('.laser', { y: 138, duration: 0.65, ease: 'sine.inOut', yoyo: true, repeat: 1 })
        .to('.qr-box', { scale: 1.07, duration: 0.14, yoyo: true, repeat: 1 })
        .to('.laser', { opacity: 0, duration: 0.1 });

      // ---------- 2. CONNECTED ----------
      tl.call(setHead('WhatsApp Connected', 'Instance live_store_01 is paired', 'Connected', green))
        .to('.layer-qr', { opacity: 0, duration: 0.3 })
        .to('.layer-ok', { opacity: 1, duration: 0.3 }, '<')
        .to('.check', { scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, '<0.1')
        .to('.ring', { scale: 2.6, opacity: 0.5, duration: 0.2 }, '<')
        .to('.ring', { opacity: 0, duration: 0.7, ease: 'power2.out' }, '>')
        .to('.ph-scan', { opacity: 0, duration: 0.3 }, '<-0.6')
        .to('.ph-linked', { opacity: 1, duration: 0.3 }, '<')
        .to('.chip', { opacity: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(2)' }, '<0.2')
        .to({}, { duration: 1 })
        .to('.phone', { x: 340, rotate: 10, duration: 0.7, ease: 'power2.in' });

      // ---------- 3. COMPOSE + SEND ----------
      tl.call(setHead('New Campaign', 'Add numbers & message, then hit send', 'Composing', blue))
        .to('.layer-ok', { opacity: 0, duration: 0.25 })
        .to('.layer-compose', { opacity: 1, duration: 0.3 }, '<')
        .add(type(q('.num'), NUMBER_TEXT, 1.3))
        .add(type(q('.msg'), MESSAGE_TEXT, 1.4), '+=0.15')
        .to('.cursor', { opacity: 1, duration: 0.2 })
        .to('.cursor', { x: 270, y: 245, duration: 0.7, ease: 'power2.inOut' })
        .to('.send-btn', { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 })
        .call(setHead('Campaign Live', 'Sending with anti-ban jitter', 'Broadcasting…', green))
        .to('.cursor', { opacity: 0, duration: 0.2 })
        .to('.recip', { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out' }, '<');

      // ---------- 4. BULK TO MULTIPLE PHONES ----------
      const bulk = gsap.timeline();
      RECIPIENTS.forEach((r, i) => {
        const at = i * 0.3;
        bulk
          .to(`.flyer-${i}`, { opacity: 1, scale: 1, duration: 0.15 }, at)
          .to(`.flyer-${i}`, { x: r.x + 62, y: 330, duration: 0.75, ease: 'power2.inOut' }, at)
          .to(`.flyer-${i}`, { opacity: 0, scale: 0.4, duration: 0.15 }, at + 0.75)
          .to(`.bubble-${i}`, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, at + 0.8)
          .to(`.tick-${i}`, { color: '#3b82f6', duration: 0.3 }, at + 1.4)
          .to(`.reply-${i}`, { opacity: 1, y: 0, duration: 0.35 }, at + 2.4);
      });
      const c = { n: 0 };
      bulk.to(c, {
        n: 1500, duration: 2.6, ease: 'power1.inOut',
        onUpdate: () => {
          const n = Math.round(c.n);
          q('.counter').textContent = n.toLocaleString();
          q('.s-sent').textContent = n.toLocaleString();
          q('.s-del').textContent = Math.round(n * 0.98).toLocaleString();
          q('.s-read').textContent = Math.round(n * 0.64).toLocaleString();
          q('.bar').style.width = `${(n / 1500) * 100}%`;
        },
      }, 0.2);
      tl.add(bulk)
        .call(setHead('Campaign Complete', '1,500 messages delivered', 'Delivered ✓', green))
        .to('.done', { opacity: 1, y: 0, duration: 0.4 })
        .to({}, { duration: 2.2 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={outer} className="w-full max-w-[600px] mx-auto" style={{ height: H * scale }}>
      <div
        ref={root}
        className="relative origin-top-left select-none"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-400/25 via-teal-300/15 to-emerald-500/10 rounded-[56px] blur-3xl pointer-events-none" />

        {/* ================= CRM CARD ================= */}
        <div className="absolute inset-0 rounded-3xl bg-white border border-slate-200 shadow-2xl shadow-emerald-900/10 overflow-hidden">
          {/* Browser chrome */}
          <div className="h-10 px-4 flex items-center gap-3 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 max-w-[260px] mx-auto h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> app.cyberlim.com/crm
            </div>
            <div className="w-[42px]" />
          </div>

          <div className="flex" style={{ height: H - 40 }}>
            {/* Sidebar */}
            <aside className="w-14 shrink-0 bg-slate-950 flex flex-col items-center py-4 gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white mb-2">
                <MessageSquare className="w-4 h-4 fill-white" />
              </div>
              {[LayoutDashboard, Inbox, Megaphone, Users, Settings].map((Icon, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    i === 2 ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0 flex flex-col bg-[#FBFDFB]">
              {/* Top bar */}
              <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <div>
                  <div className="title text-[13px] font-extrabold text-slate-900 leading-tight">Connect WhatsApp</div>
                  <div className="subtitle text-[10px] text-slate-500">Link your number to start sending</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="status text-[10px] font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                    Pairing Required
                  </span>
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Content stage (544 x 386) */}
              <div className="relative flex-1 overflow-hidden">
                {/* ---- QR layer ---- */}
                <div className="layer-qr absolute inset-0 flex items-center px-8 gap-6">
                  <div className="qr-box relative w-[170px] h-[170px] shrink-0 bg-slate-900 rounded-2xl p-3 overflow-hidden border-2 border-emerald-500/40 shadow-lg">
                    <div className="grid grid-cols-7 gap-1 w-full h-full">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            (i * 7 + (i % 5)) % 3 === 0 || [0, 6, 42, 48].includes(i) ? 'bg-emerald-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                        <MessageSquare className="w-4 h-4 fill-white" />
                      </div>
                    </div>
                    <div className="laser absolute left-1.5 right-1.5 top-2 h-1 rounded bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 shadow-[0_0_14px_#10B981]" />
                  </div>
                  <ol className="space-y-2.5 text-[11px] text-slate-600">
                    {['Open WhatsApp on your phone', 'Tap Menu → Linked Devices', 'Point your camera at this QR'].map((t, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        {t}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* ---- Connected layer ---- */}
                <div className="layer-ok absolute inset-0 flex flex-col items-center justify-center gap-3 px-10">
                  <div className="relative">
                    <div className="ring absolute inset-0 rounded-2xl bg-emerald-400" />
                    <div className="check relative w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="text-base font-extrabold text-slate-900">Device Linked to CRM!</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['+91 98765 43210', 'WebSocket 22ms', 'Ready for bulk'].map((t) => (
                      <span key={t} className="chip px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ---- Compose + bulk layer ---- */}
                <div className="layer-compose absolute inset-0 px-4 pt-3 space-y-2">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Numbers</div>
                    <div className="min-h-[32px] px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-mono text-slate-800">
                      <span className="num" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">Message</div>
                    <div className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-800 leading-snug">
                      <span className="msg" />
                    </div>
                  </div>
                  <button className="send-btn w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/30">
                    <Send className="w-3.5 h-3.5" />
                    Send Bulk Campaign (<span className="counter">0</span> / 1,500)
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="bar h-full w-0 bg-gradient-to-r from-emerald-400 to-teal-400" />
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono whitespace-nowrap">
                      Sent <b className="s-sent text-slate-800">0</b> · Delivered <b className="s-del text-slate-800">0</b> · Read{' '}
                      <b className="s-read text-blue-600">0</b>
                    </div>
                  </div>
                </div>

                {/* ---- Recipient phones ---- */}
                {RECIPIENTS.map((r, i) => (
                  <div
                    key={r.name}
                    className="recip absolute bottom-0 w-[140px] h-[128px] bg-slate-950 rounded-t-[22px] p-1.5 pb-0 border-2 border-b-0 border-slate-800 shadow-xl"
                    style={{ left: r.x }}
                  >
                    <div className="h-1.5 w-10 bg-slate-900 rounded-full mx-auto mb-1" />
                    <div className="bg-[#EFEAE2] rounded-t-[14px] h-[calc(100%-10px)] p-1.5">
                      <div className="flex items-center gap-1.5 bg-emerald-700 text-white rounded-md px-1.5 py-1 mb-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${r.color} text-[7px] font-bold flex items-center justify-center`}>
                          {r.name[0]}
                        </span>
                        <span className="text-[8px] font-bold">{r.name}</span>
                        <span className="text-[8px] ml-auto">{r.country}</span>
                      </div>
                      <div className={`bubble bubble-${i} bg-white rounded-lg rounded-tl-sm p-1.5 text-[8px] text-slate-800 leading-tight shadow-sm`}>
                        Hi {r.name}! Flash Sale 25% OFF is LIVE! 🚀
                        <div className="text-right -mb-0.5">
                          <CheckCircle2 className={`tick tick-${i} inline w-2.5 h-2.5`} />
                        </div>
                      </div>
                      <div className={`reply reply-${i} ml-auto mt-1 w-fit bg-[#D9FDD3] rounded-lg rounded-tr-sm px-1.5 py-1 text-[8px] text-slate-900 shadow-sm`}>
                        {r.reply}
                      </div>
                    </div>
                  </div>
                ))}

                {/* ---- Flying messages ---- */}
                {RECIPIENTS.map((_, i) => (
                  <div
                    key={i}
                    className={`flyer flyer-${i} absolute left-0 top-0 z-30 w-7 h-7 rounded-lg bg-[#D9FDD3] border border-emerald-300 shadow-lg flex items-center justify-center`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                  </div>
                ))}

                {/* Done toast */}
                <div className="done absolute top-2 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-xl whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  1,500 messages delivered to all phones
                </div>

                {/* Cursor */}
                <div className="cursor absolute left-0 top-0 z-40 pointer-events-none drop-shadow-md">
                  <MousePointer2 className="w-5 h-5 fill-slate-900 text-white" />
                </div>

                {/* ---- Scanning phone (slides over the card) ---- */}
                <div className="phone absolute right-4 top-12 w-[150px] h-[270px] z-20 bg-slate-950 rounded-[28px] p-2 border-4 border-slate-800 shadow-2xl">
                  <div className="h-2.5 w-12 bg-slate-900 rounded-full mx-auto mb-1.5" />
                  <div className="relative h-[calc(100%-18px)] rounded-[20px] overflow-hidden">
                    <div className="ph-scan absolute inset-0 bg-slate-900 text-white p-3 flex flex-col justify-between">
                      <div className="text-[9px] text-emerald-400 font-bold">WhatsApp • Scan</div>
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
                        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />
                      </div>
                      <div className="text-[9px] text-center text-slate-400">Scanning QR…</div>
                    </div>
                    <div className="ph-linked absolute inset-0 bg-[#EFEAE2] p-2.5 space-y-2">
                      <div className="bg-emerald-600 text-white p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" /> Linked Devices
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200 text-[10px]">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>CyberLim CRM</span>
                          <span className="text-emerald-600">Active</span>
                        </div>
                        <div className="text-[9px] text-slate-500">Chrome • Windows</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
