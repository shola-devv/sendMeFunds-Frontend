import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import Token from '@/lib/models/Token';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    await Token.findOneAndUpdate({ user: auth.user.userId }, { isValid: false });

    const res = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    res.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
    res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}