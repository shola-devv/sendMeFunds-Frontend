'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { useState } from 'react';

const FloatingOrb = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />
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

export default function Login() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) return setError('All fields are required.');
    setLoading(true);
    try {
      const data = await apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setUser({ name: data.name || '', email: form.email });
      router.push('/home');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Email',    name: 'email',    type: 'email',    placeholder: 'you@example.com', icon: '✉️' },
    { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••',        icon: '🔒' },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-[#050810] text-white overflow-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up  { animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-1{ animation: fadeUp 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-2{ animation: fadeUp 0.8s 0.2s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-3{ animation: fadeUp 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-4{ animation: fadeUp 0.8s 0.4s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }

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

        @keyframes borderPulse {
          0%,100% { border-color: rgba(59,130,246,0.6); }
          50%      { border-color: rgba(99,160,255,0.9); }
        }
        .border-pulse { animation: borderPulse 2s ease-in-out infinite; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0d1526 inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
      `}</style>

      {/* Background image */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src="/background.jpg"
          alt=""
          className="w-full h-full object-cover opacity-20 blur-[2px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050810]/40 via-[#050810]/60 to-[#050810]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/60 via-transparent to-[#050810]/80" />
      </div>

      {/* Orbs */}
      <FloatingOrb className="w-[500px] h-[500px] bg-blue-700 -top-48 -right-48" />
      <FloatingOrb className="w-[300px] h-[300px] bg-indigo-800 bottom-0 -left-24" />

      <GridLines />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            SendMe<span className="text-blue-400">Funds</span>
          </span>
        </Link>
        <Link
          href="/signup"
          className="mono text-xs text-slate-400 hover:text-white transition-colors duration-200 px-5 py-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          Create account →
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Badge */}
          <div className="fade-up mb-6">
            <span className="mono inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-blue-400 border border-blue-800/60 bg-blue-950/40 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Secure · Encrypted
            </span>
          </div>

          {/* Heading */}
          <div className="fade-up-1 mb-8">
            <h1 className="text-4xl font-black leading-tight mb-2">
              <span className="shimmer-text">Welcome</span>
              <br />
              <span className="text-white">back.</span>
            </h1>
            <p className="text-slate-400 text-sm">Sign in to continue to your wallet.</p>
          </div>

          {/* Form card */}
          <div className="fade-up-2 relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_32px_64px_rgba(0,0,30,0.5)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />

            <div className="space-y-4">
              {fields.map((f, i) => (
                <div key={f.name} className="fade-up" style={{ animationDelay: `${0.25 + i * 0.1}s` }}>
                  <label className="mono block text-[10px] font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
                    {f.label}
                  </label>
                  <div className={`relative flex items-center rounded-xl border transition-all duration-200 ${
                    focused === f.name
                      ? 'border-blue-500/60 bg-blue-950/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                      : 'border-blue-900/40 bg-white/[0.03]'
                  }`}>
                    <span className="pl-3 text-base select-none">{f.icon}</span>
                    <input
                      name={f.name}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form as any)[f.name]}
                      onChange={handle}
                      onFocus={() => setFocused(f.name)}
                      onBlur={() => setFocused(null)}
                      onKeyDown={(e) => e.key === 'Enter' && submit()}
                      className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Forgot password */}
            <div className="mt-2 flex justify-end">
              <Link href="/forgot-password" className="mono text-[10px] text-slate-500 hover:text-blue-400 transition-colors tracking-wider uppercase">
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs mono">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading}
              className="mt-5 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm transition-all duration-300 border border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign in →'}
              </span>
            </button>
          </div>

          {/* Sign up link */}
          <p className="fade-up-4 mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>

          {/* Trust badges */}
          <div className="fade-up-4 mt-8 flex items-center justify-center gap-6">
            {['🔒 256-bit SSL', '🏦 Bank-grade', '⚡ Instant'].map((b) => (
              <span key={b} className="mono text-[10px] text-slate-600 tracking-wider">{b}</span>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}