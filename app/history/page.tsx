// app/history/page.tsx
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

interface Transaction {
  _id: string;
  type?: 'debit' | 'credit' | string;
  amount: number;
  status?: string;
  createdAt?: string;
  senderWalletId?: string;
  receiverWalletId?: string;
  description?: string;
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

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [txLoading, setTxLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      apiRequest('/wallets')
        .then(async (d) => {
          const w = Array.isArray(d) ? d[0] : d;
          setWallet(w);
          if (w) {
            const id = w._id || w.walletId;
            const txData = await apiRequest(`/wallets/ledger/${id}`).catch(() => []);
            setTransactions(Array.isArray(txData) ? txData : txData.transactions || []);
          }
        })
        .catch(() => {})
        .finally(() => setTxLoading(false));
    }
  }, [user]);

  if (loading || !user) return null;

  const walletId = wallet?.walletId || wallet?._id;

  const filtered = transactions.filter((tx) => {
    if (filter === 'all') return true;
    const isSender = tx.senderWalletId === walletId;
    const isReceiver = tx.receiverWalletId === walletId;
    const direction = isSender ? 'debit' : isReceiver ? 'credit' : tx.type;
    return direction === filter;
  });

  const totalIn  = transactions.filter((tx) => (tx.senderWalletId === walletId ? false : tx.receiverWalletId === walletId ? true : tx.type === 'credit')).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((tx) => (tx.senderWalletId === walletId ? true  : tx.receiverWalletId === walletId ? false : tx.type === 'debit')).reduce((s, t) => s + t.amount, 0);

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
        .fade-up-1{ animation: fadeUp 0.7s 0.08s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-2{ animation: fadeUp 0.7s 0.16s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
        .fade-up-3{ animation: fadeUp 0.7s 0.24s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }

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

        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .row-in { animation: rowIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards; opacity:0; }
      `}</style>

      <GridLines />
      <FloatingOrb className="w-[400px] h-[400px] bg-blue-800 -top-48 -right-32" />
      <FloatingOrb className="w-[300px] h-[300px] bg-indigo-900 bottom-24 -left-24" />

      {/* ── Nav ── */}
      <nav className="relative z-20 max-w-lg mx-auto flex items-center justify-between px-5 sm:px-8 pt-8 pb-2">
        <Link
          href="/home"
          className="mono flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 uppercase tracking-wider"
        >
          ← Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white font-black text-xs">S</span>
          </div>
          <span className="font-black text-sm tracking-tight">
            SendMe<span className="text-blue-400">Funds</span>
          </span>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-6">
        <div className="fade-up">
          <span className="mono inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase text-blue-400 border border-blue-800/60 bg-blue-950/40 px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {transactions.length} transactions
          </span>
          <h1 className="text-4xl font-black leading-tight">
            <span className="shimmer-text">Transaction</span>
            <br />
            <span className="text-white">History</span>
          </h1>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="fade-up-1 relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-green-900/40 bg-green-950/20 p-4 hover:border-green-700/50 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center text-xs">📥</span>
            <span className="mono text-[10px] text-green-400/70 uppercase tracking-widest">Money In</span>
          </div>
          <p className="text-xl font-black text-green-400">+₦{totalIn.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-4 hover:border-red-700/50 transition-colors duration-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center text-xs">📤</span>
            <span className="mono text-[10px] text-red-400/70 uppercase tracking-widest">Money Out</span>
          </div>
          <p className="text-xl font-black text-red-400">-₦{totalOut.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="fade-up-2 relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-5">
        <div className="flex gap-2 p-1 rounded-xl border border-blue-900/40 bg-white/[0.02] w-fit">
          {(['all', 'credit', 'debit'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`mono px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-widest font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'credit' ? 'In' : 'Out'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transactions list ── */}
      <div className="fade-up-3 relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-4">
        {txLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/[0.03] border border-blue-900/30 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-bold text-slate-300 mb-1">No transactions yet</p>
            <p className="mono text-xs text-slate-600">Your activity will appear here</p>
          </div>
        ) : (
          <div className="relative rounded-2xl border border-blue-900/40 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,30,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
            <div className="relative divide-y divide-blue-900/30">
              {filtered.map((tx, idx) => {
                const isSender   = tx.senderWalletId === walletId;
                const isReceiver = tx.receiverWalletId === walletId;
                const direction  = isSender ? 'debit' : isReceiver ? 'credit' : tx.type;
                const isCredit   = direction === 'credit';
                const date       = tx.createdAt
                  ? new Date(tx.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })
                  : '—';

                return (
                  <div
                    key={tx._id}
                    className="row-in flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors duration-150"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold border ${
                        isCredit
                          ? 'bg-green-950/40 border-green-800/40 text-green-400'
                          : 'bg-red-950/40 border-red-800/40 text-red-400'
                      }`}>
                        {isCredit ? '↓' : '↑'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {isCredit ? 'Received' : 'Sent'}
                        </p>
                        <p className="mono text-[10px] text-slate-500 mt-0.5">{date}</p>
                        {tx.description && (
                          <p className="mono text-[10px] text-slate-600 mt-0.5 truncate max-w-[160px]">
                            {tx.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right">
                      <p className={`font-black text-sm mono ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                        {isCredit ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                      </p>
                      {tx.status && (
                        <span className={`mono text-[9px] px-2 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider ${
                          tx.status === 'success' || tx.status === 'completed'
                            ? 'bg-green-900/40 text-green-400 border border-green-800/40'
                            : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/40'
                        }`}>
                          {tx.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 max-w-lg mx-auto px-5 sm:px-8 mt-10 flex items-center justify-between">
        <span className="font-black text-xs text-slate-700">
          SendMe<span className="text-blue-900">Funds</span>
        </span>
        <p className="mono text-[10px] text-slate-700">
          {transactions.length} total · all time
        </p>
      </div>
    </main>
  );
}