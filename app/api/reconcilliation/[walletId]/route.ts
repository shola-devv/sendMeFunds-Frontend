import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import Ledger from '@/lib/models/Ledger';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function POST(req: NextRequest, { params }: { params: { walletId: string } }) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const { walletId } = params;
    const ledger = await Ledger.find({ walletId }).sort({ createdAt: 1 });
    if (!ledger.length) {
      return NextResponse.json({ error: 'No ledger entries found for this wallet' }, { status: 404 });
    }

    let balance = 0;
    for (const entry of ledger) {
      if (entry.type === 'credit') balance += entry.amount;
      else if (entry.type === 'debit') balance -= entry.amount;
    }

    const wallet = await Wallet.findByIdAndUpdate(walletId, { balance }, { new: true });
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    return NextResponse.json({
      message: 'Wallet balance successfully reconstructed from ledger',
      wallet: { id: wallet._id, userId: wallet.userId, balance: wallet.balance, currency: wallet.currency },
      calculatedFromLedger: balance,
      ledgerEntries: ledger.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}