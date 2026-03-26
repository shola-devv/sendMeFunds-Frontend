import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import Ledger from '@/lib/models/Ledger';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await mongoose.startSession();

  try {
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    if (!['admin', 'super-admin'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    session.startTransaction();

    const wallets = await Wallet.find({}).session(session);
    const results: { walletId: string; oldBalance: number; newBalance: number }[] = [];

    for (const wallet of wallets) {
      const ledger = await Ledger.find({ walletId: wallet._id }).sort({ createdAt: 1 }).session(session);
      if (!ledger.length) continue;

      let balance = 0;
      for (const entry of ledger) {
        if (entry.type === 'credit') balance += entry.amount;
        else if (entry.type === 'debit') balance -= entry.amount;
      }

      results.push({ walletId: wallet._id.toString(), oldBalance: wallet.balance, newBalance: balance });
      wallet.balance = balance;
      await wallet.save({ session });
    }

    await session.commitTransaction();

    return NextResponse.json({
      message: 'All wallet balances reconstructed from ledger',
      totalWalletsProcessed: results.length,
      wallets: results,
    });
  } catch (err: any) {
    if (session.inTransaction()) await session.abortTransaction();
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    session.endSession();
  }
}