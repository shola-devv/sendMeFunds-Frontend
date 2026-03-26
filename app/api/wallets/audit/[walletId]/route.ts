import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import AuditLog from '@/lib/models/AuditLog';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function GET(req: NextRequest, { params }: { params: { walletId: string } }) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const { walletId } = params;
    const wallet = await Wallet.findById(walletId);

    if (!wallet || wallet.userId.toString() !== auth.user.userId) {
      return NextResponse.json({ error: 'Forbidden - You do not own this wallet' }, { status: 403 });
    }

    const logs = await AuditLog.find({ walletId }).sort({ timestamp: -1 });
    return NextResponse.json({ walletId, totalLogs: logs.length, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}