import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import Ledger from '@/lib/models/Ledger';
import AuditLog from '@/lib/models/AuditLog';
import User from '@/lib/models/User';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

// POST /api/wallets  — create wallet
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const { pin } = await req.json();
    if (!pin) return NextResponse.json({ error: 'PIN is required' }, { status: 400 });

    const user = await User.findById(auth.user.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const existingWallet = await Wallet.findOne({ userId: auth.user.userId });
    if (existingWallet) {
      return NextResponse.json({ error: 'Wallet already exists for this user' }, { status: 400 });
    }

    const initialBalance = 1000.0;
    const wallet = await Wallet.create({ userId: auth.user.userId, balance: initialBalance, currency: 'NGN', pin });

    await Ledger.create({
      walletId: wallet._id, type: 'credit', amount: initialBalance,
      balanceBefore: 0, balanceAfter: initialBalance,
      reference: `init_${wallet._id}_${Date.now()}`,
      description: 'Initial wallet funding', status: 'success',
    });

    await AuditLog.create({
      action: 'wallet_created', userId: auth.user.userId, walletId: wallet._id,
      amount: initialBalance, status: 'success', reference: `wallet_${wallet._id}`,
    });

    return NextResponse.json({
      message: 'Wallet created successfully with 1000 NGN initial balance',
      wallet: { id: wallet._id, userId: wallet.userId, balance: wallet.balance, currency: wallet.currency },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/wallets  — get current user's wallet
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const wallet = await Wallet.findOne({ userId: auth.user.userId }).populate('userId', 'name email phone');
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    return NextResponse.json({
      wallet: {
        id: wallet._id, balance: wallet.balance, currency: wallet.currency,
        user: wallet.userId, createdAt: (wallet as any).createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}