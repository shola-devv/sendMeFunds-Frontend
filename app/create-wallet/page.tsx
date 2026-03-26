

// app/create-wallet/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { useEffect, useState } from 'react';

const FloatingOrb = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none ${className}`} />
);

const GridLines = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e3a8a" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

export default function CreateWallet() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  const submit = async () => {
    setError('');
    if (pin.length < 4) return setError('PIN must be at least 4 digits.');
    if (pin !== confirmPin) return setError('PINs do not match.');
    setSubmitting(true);
    try {
      await apiRequest('/wallets', { method: 'POST', body: JSON.stringify({ pin }) });
      setSuccess(true);
      setTimeout(() => router.push('/home'), 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  const pinStrength = pin.length === 0 ? null : pin.length < 4 ? 'weak' : pin.length < 6 ? 'good' : 'strong';
  const strengthColor = pinStrength === 'weak' ? 'text-red-400' : pinStrength === 'good' ? 'text-yellow-400' : 'text-green-400';
  const strengthLabel = pinStrength === 'weak' ? 'Too short' : pinStrength === 'good' ? 'Good' : 'Strong';

  return (
    <main className="min-h-screen bg-[#050810] text-white pb-16 relative overflow-hidden flex flex-col">
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

        @keyframes popDot {
          0%   { transform: scale(0.6); }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .dot-filled { animation: popDot 0.2s cubic-bezier(0.16,1,0.3,1) forwards; }

        @keyframes successPop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .success-pop { animation: successPop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0d1526 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      <GridLines />
      <FloatingOrb className="w-[500px] h-[500px] bg-blue-800 -top-48 -right-48" />
      <FloatingOrb className="w-[300px] h-[300px] bg-indigo-900 bottom-0 -left-24" />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            SendMe<span className="text-blue-400">Funds</span>
          </span>
        </Link>
        <Link
          href="/home"
          className="mono text-xs text-slate-400 hover:text-white transition-colors px-5 py-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 uppercase tracking-wider"
        >
          ← Back
        </Link>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {success ? (
            /* Success state */
            <div className="success-pop text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-white mb-2">Wallet Created!</h2>
              <p className="text-slate-400 text-sm mono">Redirecting to home…</p>
            </div>
          ) : (
            <>
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
                  <span className="shimmer-text">Create</span>
                  <br />
                  <span className="text-white">your wallet.</span>
                </h1>
                <p className="text-slate-400 text-sm">Set a secure PIN to protect your funds.</p>
              </div>

              {/* Form card */}
              <div className="fade-up-2 relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_32px_64px_rgba(0,0,30,0.5)]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />

                <div className="space-y-4 relative">
                  {/* PIN input */}
                  <div>
                    <label className="mono block text-[10px] font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
                      Wallet PIN
                    </label>
                    <div className={`flex items-center rounded-xl border transition-all duration-200 ${
                      focused === 'pin'
                        ? 'border-blue-500/60 bg-blue-950/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                        : 'border-blue-900/40 bg-white/[0.03]'
                    }`}>
                      <span className="pl-3 text-base select-none">🔐</span>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="4–6 digits"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        onFocus={() => setFocused('pin')}
                        onBlur={() => setFocused(null)}
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none mono tracking-[0.4em]"
                      />
                    </div>
                  </div>

                  {/* PIN dot indicators */}
                  <div className="flex gap-2 justify-center py-1">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                          i < pin.length
                            ? `dot-filled ${
                                pin.length < 4 ? 'bg-red-400' : pin.length < 6 ? 'bg-yellow-400' : 'bg-green-400'
                              }`
                            : 'bg-white/10 border border-blue-900/60'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Strength label */}
                  {pinStrength && (
                    <p className={`mono text-[10px] text-center uppercase tracking-widest ${strengthColor}`}>
                      {strengthLabel}
                    </p>
                  )}

                  {/* Confirm PIN */}
                  <div>
                    <label className="mono block text-[10px] font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
                      Confirm PIN
                    </label>
                    <div className={`flex items-center rounded-xl border transition-all duration-200 ${
                      focused === 'confirm'
                        ? confirmPin.length > 0 && confirmPin !== pin.slice(0, confirmPin.length)
                          ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_16px_rgba(239,68,68,0.1)]'
                          : 'border-blue-500/60 bg-blue-950/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                        : 'border-blue-900/40 bg-white/[0.03]'
                    }`}>
                      <span className="pl-3 text-base select-none">✅</span>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Re-enter PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        onFocus={() => setFocused('confirm')}
                        onBlur={() => setFocused(null)}
                        onKeyDown={(e) => e.key === 'Enter' && submit()}
                        className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none mono tracking-[0.4em]"
                      />
                    </div>
                    {/* Match indicator */}
                    {confirmPin.length >= 4 && (
                      <p className={`mono text-[10px] mt-1.5 uppercase tracking-widest ${
                        confirmPin === pin ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {confirmPin === pin ? '✓ PINs match' : '✗ PINs do not match'}
                      </p>
                    )}
                  </div>
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
                  disabled={submitting || pin.length < 4 || pin !== confirmPin}
                  className="mt-5 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all duration-300 border border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Creating wallet…
                      </span>
                    ) : 'Create Wallet →'}
                  </span>
                </button>
              </div>

              {/* Tips */}
              <div className="fade-up-4 mt-6 space-y-2">
                {[
                  '🔒 Your PIN encrypts your wallet',
                  '⚠️ Never share your PIN with anyone',
                  '📝 You\'ll need your PIN to send funds',
                ].map((tip) => (
                  <p key={tip} className="mono text-[10px] text-slate-600 text-center tracking-wider">{tip}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}