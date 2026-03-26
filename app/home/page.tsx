// app/home/page.tsx
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

function QuickTransfer() {
  const router = useRouter();
  const [walletId, setWalletId] = useState('');
  const [found, setFound] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [focused, setFocused] = useState(false);

  const search = async () => {
    if (!walletId.trim()) return;
    setSearching(true);
    try {
      const data = await apiRequest(`/wallets/search?walletId=${walletId.trim()}`);
      setFound(data);
    } catch {
      setFound(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl p-5 shadow-[0_8px_32px_rgba(0,0,30,0.4)]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
      <div className="flex gap-3">
        <div className={`flex-1 flex items-center rounded-xl border transition-all duration-200 ${
          focused ? 'border-blue-500/60 bg-blue-950/40 shadow-[0_0_16px_rgba(59,130,246,0.1)]' : 'border-blue-900/40 bg-white/[0.03]'
        }`}>
          <span className="pl-3 text-base select-none">🔍</span>
          <input
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Enter wallet ID"
            className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none mono"
          />
        </div>
        <button
          onClick={search}
          disabled={searching}
          className="px-5 h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all duration-200 border border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] whitespace-nowrap"
        >
          {searching ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : 'Find'}
        </button>
      </div>

      {found && (
        <div className="mt-3 flex items-center justify-between p-3 bg-blue-950/40 border border-blue-700/30 rounded-xl">
          <div>
            <p className="text-sm font-bold text-white">{found.owner?.name || 'Wallet'}</p>
            <p className="mono text-xs text-slate-400">{found.walletId || found._id}</p>
          </div>
          <button
            onClick={() => router.push(`/transfer?to=${found.walletId || found._id}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all duration-200 hover:shadow-[0_0_16px_rgba(59,130,246,0.3)]"
          >
            Transfer →
          </button>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      apiRequest('/wallets')
        .then((d) => setWallet(Array.isArray(d) ? d[0] : d))
        .catch(() => {})
        .finally(() => setWalletLoading(false));
    }
  }, [user]);

  if (loading || !user) return null;

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const firstName = user.name?.split(' ')[0] ?? 'there';

  const navItems = [
    { label: 'Account',  href: '/account',  icon: '👤', desc: 'View profile' },
    { label: 'Transfer', href: '/transfer',  icon: '💸', desc: 'Send funds'   },
    { label: 'History',  href: '/history',   icon: '📋', desc: 'Transactions' },
  ];

  return (
    <main className="min-h-screen bg-[#050810] text-white pb-16 relative overflow-x-hidden">
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
          50%      { transform: translateY(-6px); }
        }
        .card-float { animation: cardFloat 5s ease-in-out infinite; }

        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track { animation: ticker 20s linear infinite; }
      `}</style>

      <GridLines />
      <FloatingOrb className="w-[500px] h-[500px] bg-blue-800 -top-64 -right-48" />
      <FloatingOrb className="w-[300px] h-[300px] bg-indigo-900 bottom-32 -left-24" />

      {/* ── Top nav ── */}
      <nav className="relative z-20 flex items-center justify-between px-5 sm:px-8 pt-8 pb-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-900/40">
            {initials}
          </div>
          <div>
            <p className="mono text-[10px] text-slate-500 uppercase tracking-widest">Welcome back</p>
            <p className="text-sm font-bold text-white">{firstName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="mono text-[10px] text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 uppercase tracking-wider"
          >
            Account
          </Link>
        </div>
      </nav>

      {/* ── Wallet card ── */}
      <div className="relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-4">
        {walletLoading ? (
          <div className="h-44 rounded-3xl bg-white/5 border border-blue-900/30 animate-pulse" />
        ) : wallet ? (
          <div className="card-float fade-up relative rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_32px_80px_rgba(0,0,60,0.6)]">
            {/* Card gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(96,165,250,0.2)_0%,_transparent_60%)]" />

            <div className="relative p-6 sm:p-7">
              {/* Top row */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="mono text-[10px] text-blue-300/60 uppercase tracking-widest mb-1">Total Balance</p>
                  <p className="text-4xl font-black tracking-tight">
                    ₦{wallet.balance?.toLocaleString() ?? '0'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                  💳
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="mono text-[10px] text-blue-300/50 uppercase tracking-widest mb-1">Wallet ID</p>
                  <p className="mono text-xs text-blue-200/80">{wallet.walletId || wallet._id}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="mono text-[10px] text-green-400 uppercase tracking-wider">Active</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="fade-up relative rounded-3xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl p-7 text-center shadow-[0_32px_64px_rgba(0,0,30,0.5)]">
            <div className="text-4xl mb-3">💳</div>
            <p className="font-bold text-white mb-1">No wallet yet</p>
            <p className="text-slate-400 text-sm mb-5">Create one to start sending and receiving funds.</p>
            <Link
              href="/create-wallet"
              className="inline-flex items-center gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all duration-300 border border-blue-500/50 hover:shadow-[0_0_24px_rgba(59,130,246,0.3)]"
            >
              + Create Wallet
            </Link>
          </div>
        )}
      </div>

      {/* ── Quick stats strip ── */}
      {wallet && (
        <div className="fade-up-1 relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sent',     value: '₦0',   icon: '📤' },
              { label: 'Received', value: '₦0',   icon: '📥' },
              { label: 'Pending',  value: '0',     icon: '⏳' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-blue-900/30 bg-white/[0.02] p-3 text-center hover:border-blue-700/50 transition-colors duration-200">
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="mono text-sm font-bold text-white">{s.value}</div>
                <div className="mono text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="fade-up-2 relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-6">
        <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {navItems.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="group flex flex-col items-center gap-2.5 py-5 rounded-2xl border border-blue-900/40 bg-white/[0.03] hover:border-blue-500/50 hover:bg-blue-950/30 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(59,130,246,0.1)]"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{b.icon}</span>
              <div className="text-center">
                <p className="text-xs font-bold text-white">{b.label}</p>
                <p className="mono text-[9px] text-slate-500 mt-0.5">{b.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Quick transfer ── */}
      <div className="fade-up-3 relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-6">
        <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Quick Transfer</p>
        <QuickTransfer />
      </div>

      {/* ── Recent activity placeholder ── */}
      <div className="fade-up-4 relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-6">
        <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">Recent Activity</p>
        <div className="relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
          <div className="relative divide-y divide-blue-900/30">
            {[
              { label: 'No transactions yet', sub: 'Your activity will appear here', icon: '📭' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-6 text-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                  <p className="mono text-xs text-slate-600 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-10 flex items-center justify-between">
        <span className="font-black text-xs text-slate-700">
          SendMe<span className="text-blue-900">Funds</span>
        </span>
        <div className="flex gap-4">
          {['Privacy', 'Support'].map(l => (
            <a key={l} href="#" className="mono text-[10px] text-slate-700 hover:text-slate-400 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </main>
  );
}