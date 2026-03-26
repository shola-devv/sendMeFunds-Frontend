import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') || 15), 50);

    const wallets = await Wallet.aggregate([
      { $sample: { size: limit } },
      { $project: { _id: 1, balance: 1, currency: 1, createdAt: 1 } },
    ]);

    return NextResponse.json({
      count: wallets.length,
      wallets: wallets.map((w) => ({ walletId: w._id, currency: w.currency, createdAt: w.createdAt })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}