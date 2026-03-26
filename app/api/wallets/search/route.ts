import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import User from '@/lib/models/User';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get('walletId');
    const email    = searchParams.get('email');
    const phone    = searchParams.get('phone');

    let wallet;

    if (walletId) {
      wallet = await Wallet.findById(walletId).populate('userId', 'name email phone');
    } else if (email || phone) {
      const user = await User.findOne({
        ...(email && { email }),
        ...(phone && { phone }),
      });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      wallet = await Wallet.findOne({ userId: user._id }).populate('userId', 'name email phone');
    } else {
      return NextResponse.json({ error: 'Provide walletId, email, or phone' }, { status: 400 });
    }

    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    return NextResponse.json({
      wallet: { id: wallet._id, currency: wallet.currency, user: wallet.userId },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}