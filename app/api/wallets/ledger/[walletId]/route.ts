import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import Ledger from '@/lib/models/Ledger';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function GET(req: NextRequest, { params }: { params: { walletId: string } }) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const { walletId } = params;
    const { searchParams } = new URL(req.url);
    const page  = Number(searchParams.get('page')  || 1);
    const limit = Math.min(Number(searchParams.get('limit') || 20), 50);
    const skip  = (page - 1) * limit;

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    const isOwner = wallet.userId.toString() === auth.user.userId;
    const isAdmin = ['admin', 'super-admin'].includes(auth.user.role);
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const entries = await Ledger.find({ walletId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total   = await Ledger.countDocuments({ walletId });

    return NextResponse.json({
      walletId, totalTransactions: total, currentPage: page,
      totalPages: Math.ceil(total / limit),
      transactions: entries.map((tx) => ({
        id: tx._id, type: tx.type, amount: tx.amount,
        balanceBefore: tx.balanceBefore, balanceAfter: tx.balanceAfter,
        reference: tx.reference, createdAt: tx.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}