import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import Ledger from '@/lib/models/Ledger';
import AuditLog from '@/lib/models/AuditLog';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    if (auth.user.role !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden: Super admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get('walletId');
    const { amount, pin } = await req.json();

    if (!walletId)        return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!pin)             return NextResponse.json({ error: 'PIN is required' }, { status: 400 });

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    const isPinCorrect = await wallet.comparePin(pin);
    if (!isPinCorrect) return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });

    const balanceBefore = wallet.balance;
    const numericAmount = Number(amount);
    wallet.balance += numericAmount;
    await wallet.save();

    const reference = `fund_${wallet._id}_${Date.now()}`;

    await Ledger.create({
      walletId: wallet._id, type: 'credit', amount: numericAmount,
      balanceBefore, balanceAfter: wallet.balance,
      reference, description: 'Admin wallet funding', status: 'success',
    });

    await AuditLog.create({
      action: 'fund_wallet', userId: auth.user.userId, walletId: wallet._id,
      amount: numericAmount, status: 'success', reference,
    });

    return NextResponse.json({
      message: 'Wallet funded successfully',
      wallet: { id: wallet._id, balanceBefore, balanceAfter: wallet.balance, amount: numericAmount, currency: wallet.currency },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}