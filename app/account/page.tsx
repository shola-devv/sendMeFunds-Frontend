// app/account/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { useEffect, useState } from 'react';

interface Wallet {
  _id?: string;
  walletId?: string;
  balance: number;
  owner?: { name: string; email: string };
}

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

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [wLoading, setWLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      apiRequest('/wallets')
        .then((d) =>{ console.log('wallet response:', d);  setWallet(Array.isArray(d) ? d[0] : d)})
        .catch(() => {})
        .finally(() => setWLoading(false));
    }
  }, [user]);

  const copy = () => {
    const id = wallet?.walletId || wallet?._id;
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push('/');
  };

  if (loading || !user) return null;

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const firstName = user.name?.split(' ')[0] ?? '';

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

        @keyframes cardFloat {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        .card-float { animation: cardFloat 5s ease-in-out infinite; }

        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        .modal-in { animation: modalIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>

      <GridLines />
      <FloatingOrb className="w-[500px] h-[500px] bg-blue-800 -top-48 -right-48" />
      <FloatingOrb className="w-[300px] h-[300px] bg-indigo-900 bottom-24 -left-24" />

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="modal-in relative w-full max-w-xs rounded-2xl border border-red-900/40 bg-[#0d1526] p-6 shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">👋</div>
              <h3 className="font-black text-white text-lg mb-1">Sign out?</h3>
              <p className="mono text-xs text-slate-500">You'll need to sign in again to access your wallet.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-11 rounded-xl border border-blue-900/40 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5 font-semibold text-sm transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all duration-200 border border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-60"
              >
                {loggingOut ? '…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      <div className="relative z-10 max-w-lg mx-auto w-full px-5 sm:px-8 flex-1 flex flex-col gap-5 pb-8">

        {/* Avatar + name */}
        <div className="fade-up flex flex-col items-center text-center pt-4 pb-2">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center font-black text-2xl shadow-[0_16px_40px_rgba(59,130,246,0.3)] border border-blue-500/30">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-[#050810] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">{user.name}</h1>
          <p className="mono text-xs text-slate-500 mt-0.5">{user.email}</p>
          <span className="mono mt-2 inline-flex items-center gap-1.5 text-[10px] text-green-400 border border-green-800/40 bg-green-950/30 px-2.5 py-1 rounded-full uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* Balance card */}
        <div className="fade-up-1 card-float relative rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_24px_60px_rgba(0,0,60,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(96,165,250,0.2)_0%,_transparent_60%)]" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="mono text-[10px] text-blue-300/60 uppercase tracking-widest mb-1">Total Balance</p>
                {wLoading ? (
                  <div className="h-9 w-36 bg-white/10 rounded-xl animate-pulse" />
                ) : wallet ? (
                  <p className="text-4xl font-black tracking-tight">
                    ₦{wallet.balance?.toLocaleString() ?? '0'}
                  </p>
                ) : (
                  <div>
                    <p className="text-slate-300 text-sm mb-2">No wallet yet</p>
                    <Link
                      href="/create-wallet"
                      className="mono text-xs text-blue-300 hover:text-white underline transition-colors"
                    >
                      Create wallet →
                    </Link>
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">💳</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="mono text-[10px] text-green-400 uppercase tracking-wider">Active wallet</span>
            </div>
          </div>
        </div>

        {/* Wallet ID card */}
        {wallet && (
          <div className="fade-up-2 relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl p-5 shadow-[0_8px_32px_rgba(0,0,30,0.4)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
            <div className="relative">
              <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Wallet Details</p>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="mono text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Wallet ID</p>
                  <p className="mono text-sm text-blue-300 font-semibold truncate">
                    {wallet.walletId || wallet._id}
                  </p>
                </div>
                <button
                  onClick={copy}
                  className={`flex-shrink-0 h-9 px-4 rounded-xl text-xs font-bold transition-all duration-200 mono border ${
                    copied
                      ? 'bg-green-950/40 text-green-400 border-green-800/40 shadow-[0_0_16px_rgba(74,222,128,0.2)]'
                      : 'bg-blue-950/40 text-blue-400 border-blue-800/40 hover:border-blue-500/60 hover:shadow-[0_0_16px_rgba(59,130,246,0.2)]'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy ID'}
                </button>
              </div>

              {/* Share hint */}
              <p className="mono text-[10px] text-slate-600 mt-3">
                Share this ID to receive funds from others
              </p>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="fade-up-3 relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,30,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          <div className="relative divide-y divide-blue-900/30">
            {[
              { label: 'Transfer Funds', desc: 'Send money to another wallet', href: '/transfer', icon: '💸' },
              { label: 'Transaction History', desc: 'View all your activity', href: '/history', icon: '📋' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-base group-hover:border-blue-500/60 transition-colors duration-200">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="mono text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <span className="mono text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200 text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="fade-up-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-12 rounded-xl border border-red-900/40 text-red-400 hover:text-red-300 hover:border-red-700/60 hover:bg-red-950/20 font-bold text-sm transition-all duration-300 mono uppercase tracking-widest"
          >
            Sign out
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <span className="font-black text-xs text-slate-700">
            SendMe<span className="text-blue-900">Funds</span>
          </span>
          <p className="mono text-[10px] text-slate-700">v1.0 · Secure</p>
        </div>
      </div>
    </main>
  );
}