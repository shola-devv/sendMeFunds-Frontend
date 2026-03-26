'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const FloatingOrb = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`} />
);

const GridLines = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e3a8a" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

const Ticker = () => {
  const items = [
    { label: 'Instant Transfers', value: '< 2s' },
    { label: 'Countries Supported', value: '190+' },
    { label: 'Transactions Today', value: '1.2M' },
    { label: 'Security Rating', value: 'AAA' },
    { label: 'Uptime', value: '99.99%' },
    { label: 'Happy Users', value: '4.2M' },
  ];

  return (
    <div className="w-full overflow-hidden border-y border-blue-900/30 bg-[#0a0f1e]/80 backdrop-blur-sm py-3">
      <div className="flex animate-ticker gap-16 whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 text-xs font-mono tracking-widest uppercase">
            <span className="text-blue-400/60">◆</span>
            <span className="text-slate-400">{item.label}</span>
            <span className="text-blue-300 font-bold">{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ value, label, delay }: { value: string; label: string; delay: string }) => (
  <div
    className="group relative border border-blue-900/40 bg-white/[0.02] backdrop-blur-sm rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-500 hover:bg-white/[0.05]"
    style={{ animationDelay: delay }}
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="text-3xl font-black text-white mb-1 font-mono">{value}</div>
    <div className="text-xs text-slate-500 uppercase tracking-widest">{label}</div>
  </div>
);

const FeatureRow = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="flex items-start gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-lg flex-shrink-0 group-hover:border-blue-500/60 transition-colors duration-300">
      {icon}
    </div>
    <div>
      <div className="text-sm font-semibold text-white mb-0.5">{title}</div>
      <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
    </div>
  </div>
);

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-[#050810] text-white overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');

        * { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }

        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-ticker { animation: ticker 24s linear infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up  { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-1{ animation: fadeUp 0.9s 0.15s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-2{ animation: fadeUp 0.9s 0.3s  cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-3{ animation: fadeUp 0.9s 0.45s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-4{ animation: fadeUp 0.9s 0.6s  cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg,#93c5fd,#fff,#3b82f6,#fff,#93c5fd);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        @keyframes floatCard {
          0%,100% { transform: translateY(0px)   rotate(-1deg); }
          50%      { transform: translateY(-12px) rotate(-1deg); }
        }
        .float-card { animation: floatCard 6s ease-in-out infinite; }

        @keyframes floatCard2 {
          0%,100% { transform: translateY(0px)  rotate(1.5deg); }
          50%      { transform: translateY(-8px) rotate(1.5deg); }
        }
        .float-card-2 { animation: floatCard2 7s 1s ease-in-out infinite; }

        .cursor-glow {
          pointer-events: none;
          position: fixed;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);
          transform: translate(-50%,-50%);
          z-index: 0;
          transition: left 0.1s, top 0.1s;
        }
      `}</style>

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* Ambient orbs */}
      <FloatingOrb className="w-[600px] h-[600px] bg-blue-700 -top-64 -right-64" />
      <FloatingOrb className="w-[400px] h-[400px] bg-blue-900 bottom-0 -left-48" />
      <FloatingOrb className="w-[300px] h-[300px] bg-indigo-800 top-1/2 left-1/3" />

      <GridLines />

      {/* ── Nav ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            SendMe<span className="text-blue-400">Funds</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="mono text-xs text-slate-400 hover:text-white transition-colors duration-200 px-5 py-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="mono text-xs bg-blue-600 m-2 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 border border-blue-500/50 hover:border-blue-400"
          >
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── Ticker ── */}
      <div className="relative z-10">
        <Ticker />
      </div>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative z-10 flex-1 flex flex-col lg:flex-row items-center gap-12 px-6 sm:px-10 py-20 max-w-7xl mx-auto w-full"
      >
        {/* Background image with right-side fade to dark */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <img
            src="/background.jpg"
            alt=""
            className="w-full h-full object-cover opacity-80 blur-[2px] scale-105"
          />
        {/* top fade */}
<div className="absolute inset-0 bg-gradient-to-b from-[#050810]/20 via-transparent to-[#050810]/30" />
{/* left fade */}
<div className="absolute inset-0 bg-gradient-to-r from-[#050810]/30 via-transparent to-transparent" />
{/* right fade */}
<div className="absolute inset-0 bg-gradient-to-l from-[#050810] via-[#050810]/20 to-transparent w-full" />
           </div>

        {/* Left — copy */}
        <div className="flex-1 flex flex-col gap-8  m-2 max-w-xl">
          <div className="fade-up">
            <span className="mono inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-blue-400 border border-blue-800/60 bg-blue-950/40 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live · 190+ countries
            </span>
          </div>

          <div className="fade-up-1">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] md:ml-4 tracking-tight">
              <span className="shimmer-text">Your money.</span>
              <br />
              <span className="text-white">Your control.</span>
              <br />
              <span className="text-slate-600">Always.</span>
            </h1>
          </div>

          <p className="fade-up-2 text-slate-400 text-base sm:text-lg leading-relaxed max-w-md">
            Send and receive money across borders in seconds — not days. No hidden fees. No nonsense. Just fast, secure transfers built for the modern world.
          </p>

          {/* Buttons — uniform height, consistent width, equal gap */}
          <div className="fade-up-3 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="group relative flex items-center justify-center gap-2 h-12 w-full sm:w-48 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm transition-all duration-300 border border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Create account</span>
              <span className="relative group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center h-12 w-full sm:w-48 rounded-xl font-bold text-sm border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300"
            >
              Sign in
            </Link>
          </div>

          <div className="fade-up-4 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['#3b82f6','#60a5fa','#93c5fd','#bfdbfe'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#050810]" style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Joined by <span className="text-slate-300 font-semibold">4.2M+ users</span> worldwide
            </p>
          </div>
        </div>

        {/* Right — floating cards */}
        <div className="flex-1 flex items-center justify-center relative w-full max-w-sm lg:max-w-none h-[460px]">

          {/* Main wallet card */}
          <div className="float-card absolute top-8 left-1/2 -translate-x-1/2 w-72 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-900 p-6 shadow-[0_40px_80px_rgba(0,0,50,0.6)] border border-blue-500/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="mono text-[10px] text-blue-300/70 uppercase tracking-widest mb-1">Transfer</p>
                <p className="text-2xl font-black">₦24,891.50</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">💳</div>
            </div>
            <div className="flex items-end justify-between m-2 ">
              <div>
                <p className="mono text-[10px] text-blue-300/50 uppercase tracking-widest mb-1">Card holder</p>
                <p className="text-sm font-semibold">SendMeFunds user</p>
              </div>
              <p className="mono text-xs text-blue-300/50">4291 ••••</p>
            </div>
          </div>

          {/* Transaction card */}
          <div className="float-card-2 absolute bottom-8 left-4 w-56 rounded-2xl bg-[#0d1526]/90 backdrop-blur-xl border border-blue-900/50 p-4  m-2 shadow-2xl">
            <p className="mono text-[9px] text-slate-500 uppercase tracking-widest mb-3">Recent</p>
            {[
              { name: 'Netflix',  amount: '-₦15,000', icon: '🎬' },
              { name: 'Zelle ', amount: '+₦50,000', icon: '👤' },
              { name: 'Spotify',  amount: '-₦5,000',  icon: '🎵' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.icon}</span>
                  <span className="text-xs text-slate-300">{t.name}</span>
                </div>
                <span className={`mono text-xs font-medium ${t.amount.startsWith('+') ? 'text-green-400' : 'text-slate-400'}`}>
                  {t.amount}
                </span>
              </div>
            ))}
          </div>

          {/* Sent pill */}
          <div className="absolute top-4 right-4 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="mono text-[10px] text-green-400 font-medium">Sent ₦500k · 1.2s</span>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard value="₦2.4T+" label="Transferred"   delay="0ms"   />
          <StatCard value="190+"   label="Countries"     delay="100ms" />
          <StatCard value="4.2M"   label="Users"         delay="200ms" />
          <StatCard value="< 2s"   label="Transfer time" delay="300ms" />
        </div>
      </div>

      {/* ── Features ── */}
      <section className="relative z-10 border-t border-white/5 max-w-7xl mx-auto w-full px-6 sm:px-10 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '⚡', title: 'Instant Transfers',   desc: 'Send money anywhere in the world in under 2 seconds, 24/7.' },
            { icon: '🔒', title: 'Bank-grade Security', desc: '256-bit encryption and biometric auth keeps your money safe.' },
            { icon: '🌍', title: 'Global Coverage',     desc: 'Send and receive in 190+ countries with competitive FX rates.' },
            { icon: '💸', title: 'Zero Hidden Fees',    desc: 'What you see is what you pay. No surprises, ever.' },
            { icon: '📊', title: 'Smart Analytics',     desc: 'Track spending patterns and set budgets that actually work.' },
            { icon: '🤝', title: 'Split Payments',      desc: 'Split bills with friends instantly. No awkward IOUs.' },
          ].map((f, i) => (
            <div key={i} className="border border-white/5 rounded-2xl p-5 hover:border-blue-900/60 hover:bg-white/[0.02] transition-all duration-300 group">
              <FeatureRow {...f} />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 px-6 sm:px-10 py-10 max-w-7xl mx-auto mt-4 w-full">
        <div className="relative rounded-3xl border border-blue-800/40 bg-gradient-to-br from-blue-950/60 to-[#050810] overflow-hidden p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.1)_0%,_transparent_70%)]" />
          <h2 className="relative text-3xl sm:text-4xl font-black mb-4">
            Ready to take <span className="shimmer-text">control</span>?
          </h2>
          <p className="relative text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Join millions of people who trust SendMeFunds for fast, safe, borderless money movement.
          </p>
          <Link
            href="/signup"
            className="relative inline-flex items-center justify-center gap-2 h-12 w-48 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-[0_0_60px_rgba(59,130,246,0.4)] border border-blue-500/50"
          >
            Create free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-black text-sm text-slate-600">
          SendMe<span className="text-blue-800">Funds</span>
        </span>
        <p className="mono text-xs text-slate-700">
          © {new Date().getFullYear()} SendMeFunds · All rights reserved
        </p>
        <div className="flex gap-6">
          {['Privacy', 'Terms', 'Support'].map(l => (
            <a key={l} href="#" className="mono text-[11px] text-slate-700 hover:text-slate-400 transition-colors">{l}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}