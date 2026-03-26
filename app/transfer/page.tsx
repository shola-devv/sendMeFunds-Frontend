'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { useEffect, useState, Suspense } from 'react';

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

function TransferForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [senderWallet, setSenderWallet] = useState<any>(null);
  const [receiverWalletId, setReceiverWalletId] = useState(searchParams.get('to') || '');
  const [receiverInfo, setReceiverInfo] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'done'>('form');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      apiRequest('/wallets')
        .then((d) => setSenderWallet(Array.isArray(d) ? d[0] : d))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get('to')) searchReceiver(searchParams.get('to')!);
  }, []);

  const searchReceiver = async (id?: string) => {
    const target = id || receiverWalletId.trim();
    if (!target) return;
    setSearching(true);
    try {
      const data = await apiRequest(`/wallets/search?walletId=${target}`);
      setReceiverInfo(data);
    } catch {
      setReceiverInfo(null);
    } finally {
      setSearching(false);
    }
  };

  const submit = async () => {
    setError('');
    if (!senderWallet) return setError('No sender wallet found.');
    if (!receiverWalletId.trim()) return setError('Enter a receiver wallet ID.');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Enter a valid amount.');
    if (!pin) return setError('Enter your PIN.');

    setSubmitting(true);
    try {
      await apiRequest('/wallets/transfer', {
        method: 'POST',
        body: JSON.stringify({
          senderWalletId: senderWallet.walletId || senderWallet._id,
          receiverWalletId: receiverWalletId.trim(),
          amount: Number(amount),
          pin,
        }),
      });
      setStep('done');
      setTimeout(() => router.push('/home'), 2200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <main className="min-h-screen bg-[#050810] text-white pb-16 relative overflow-x-hidden flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up  { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-1{ animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-2{ animation: fadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-3{ animation: fadeUp 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-4{ animation: fadeUp 0.7s 0.4s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }

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

        @keyframes successPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .success-pop { animation: successPop 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }

        @keyframes cardFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        .card-float { animation: cardFloat 5s ease-in-out infinite; }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0d1526 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      <GridLines />
      <FloatingOrb className="w-[500px] h-[500px] bg-blue-800 -top-48 -right-48" />
      <FloatingOrb className="w-[300px] h-[300px] bg-indigo-900 bottom-24 -left-24" />

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
          ← Home
        </Link>
      </nav>

      <div className="relative z-10 max-w-lg mx-auto w-full px-5 sm:px-8 flex-1 flex flex-col gap-5">

        {/* ── Success screen ── */}
        {step === 'done' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
            <div className="success-pop text-7xl">🎉</div>
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Transfer Sent!</h2>
              <p className="mono text-lg text-green-400 font-bold">
                ₦{Number(amount).toLocaleString()}
              </p>
              {receiverInfo && (
                <p className="mono text-xs text-slate-500 mt-1">
                  → {receiverInfo.owner?.name || receiverWalletId}
                </p>
              )}
            </div>
            <p className="mono text-xs text-slate-600">Redirecting to home…</p>
          </div>
        ) : (
          <>
            {/* Heading */}
            <div className="fade-up pt-2">
              <span className="mono inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-blue-400 border border-blue-800/60 bg-blue-950/40 px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Instant · Secure
              </span>
              <h1 className="text-4xl font-black leading-tight">
                <span className="shimmer-text">Send</span>
                <br />
                <span className="text-white">Money.</span>
              </h1>
            </div>

            {/* Sender wallet card */}
            {senderWallet && (
              <div className="fade-up-1 card-float relative rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,60,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(96,165,250,0.15)_0%,_transparent_60%)]" />
                <div className="relative p-5 flex items-center justify-between">
                  <div>
                    <p className="mono text-[10px] text-blue-300/60 uppercase tracking-widest mb-1">Sending from</p>
                    <p className="mono text-xs text-white font-semibold truncate max-w-[180px]">
                      {senderWallet.walletId || senderWallet._id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mono text-[10px] text-blue-300/60 uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-xl font-black">₦{senderWallet.balance?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form card */}
            <div className="fade-up-2 relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,30,0.4)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
              <div className="relative divide-y divide-blue-900/30">

                {/* Receiver */}
                <div className="p-5">
                  <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Receiver Wallet ID</p>
                  <div className="flex gap-2">
                    <div className={`flex-1 flex items-center rounded-xl border transition-all duration-200 ${
                      focused === 'receiver'
                        ? 'border-blue-500/60 bg-blue-950/40 shadow-[0_0_16px_rgba(59,130,246,0.1)]'
                        : 'border-blue-900/40 bg-white/[0.03]'
                    }`}>
                      <span className="pl-3 text-base select-none">👤</span>
                      <input
                        value={receiverWalletId}
                        onChange={(e) => setReceiverWalletId(e.target.value)}
                        onFocus={() => setFocused('receiver')}
                        onBlur={() => setFocused(null)}
                        onKeyDown={(e) => e.key === 'Enter' && searchReceiver()}
                        placeholder="Enter wallet ID"
                        className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none mono"
                      />
                    </div>
                    <button
                      onClick={() => searchReceiver()}
                      disabled={searching}
                      className="px-4 h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all duration-200 border border-blue-500/50 hover:shadow-[0_0_16px_rgba(59,130,246,0.3)] flex items-center justify-center min-w-[64px]"
                    >
                      {searching ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : 'Find'}
                    </button>
                  </div>

                  {receiverInfo && (
                    <div className="mt-3 flex items-center gap-3 p-3 bg-blue-950/40 border border-blue-700/30 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-600/40 flex items-center justify-center text-sm font-bold text-blue-300 flex-shrink-0">
                        {receiverInfo.owner?.name?.[0] ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{receiverInfo.owner?.name || 'Wallet found'}</p>
                        <p className="mono text-[10px] text-slate-400 truncate">{receiverInfo.walletId || receiverInfo._id}</p>
                      </div>
                      <span className="ml-auto flex-shrink-0 mono text-[10px] text-green-400 border border-green-800/40 bg-green-950/30 px-2 py-0.5 rounded-full">✓</span>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="p-5">
                  <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Amount</p>
                  <div className={`flex items-center rounded-xl border transition-all duration-200 ${
                    focused === 'amount'
                      ? 'border-blue-500/60 bg-blue-950/40 shadow-[0_0_16px_rgba(59,130,246,0.1)]'
                      : 'border-blue-900/40 bg-white/[0.03]'
                  }`}>
                    <span className="pl-4 text-xl font-black text-slate-500 select-none">₦</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onFocus={() => setFocused('amount')}
                      onBlur={() => setFocused(null)}
                      placeholder="0.00"
                      className="w-full bg-transparent px-3 py-3.5 text-2xl font-black text-white placeholder-slate-700 focus:outline-none mono"
                    />
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2.5">
                    {[['1k', '1000'], ['5k', '5000'], ['10k', '10000'], ['50k', '50000']].map(([label, val]) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`flex-1 py-1.5 rounded-lg border mono text-[10px] transition-all duration-150 ${
                          amount === val
                            ? 'border-blue-500/60 bg-blue-950/40 text-blue-400'
                            : 'border-blue-900/40 bg-white/[0.02] text-slate-500 hover:text-blue-400 hover:border-blue-700/50'
                        }`}
                      >
                        ₦{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PIN */}
                <div className="p-5">
                  <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Confirm PIN</p>
                  <div className={`flex items-center rounded-xl border transition-all duration-200 ${
                    focused === 'pin'
                      ? 'border-blue-500/60 bg-blue-950/40 shadow-[0_0_16px_rgba(59,130,246,0.1)]'
                      : 'border-blue-900/40 bg-white/[0.03]'
                  }`}>
                    <span className="pl-3 text-base select-none">🔐</span>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      onFocus={() => setFocused('pin')}
                      onBlur={() => setFocused(null)}
                      onKeyDown={(e) => e.key === 'Enter' && submit()}
                      className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none mono tracking-[0.4em]"
                    />
                  </div>
                  <div className="flex gap-1.5 justify-center mt-3">
                    {[0,1,2,3,4,5].map((i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-150 ${
                          i < pin.length ? 'bg-blue-400 scale-110' : 'bg-white/10 border border-blue-900/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer summary */}
            {amount && receiverInfo && (
              <div className="fade-up relative rounded-2xl border border-blue-900/40 bg-white/[0.03] p-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
                <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Summary</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-center min-w-0">
                    <p className="mono text-[10px] text-slate-500 mb-1">From</p>
                    <p className="text-xs font-bold text-white">You</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-1 px-2">
                    <div className="h-px flex-1 bg-blue-900/60" />
                    <div className="flex flex-col items-center">
                      <span className="text-base">💸</span>
                      <span className="mono text-[10px] text-blue-400 font-bold whitespace-nowrap">₦{Number(amount).toLocaleString()}</span>
                    </div>
                    <div className="h-px flex-1 bg-blue-900/60" />
                  </div>
                  <div className="text-center min-w-0">
                    <p className="mono text-[10px] text-slate-500 mb-1">To</p>
                    <p className="text-xs font-bold text-white truncate max-w-[80px]">{receiverInfo.owner?.name || 'Wallet'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs mono">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <div className="fade-up-4 pb-4">
              <button
                onClick={submit}
                disabled={submitting || !senderWallet || !receiverWalletId || !amount || !pin}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all duration-300 border border-blue-500/50 hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Processing…
                    </span>
                  ) : `Send ₦${amount ? Number(amount).toLocaleString() : '0'} →`}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function TransferPage() {
  return (
    <Suspense>
      <TransferForm />
    </Suspense>
  );
} 