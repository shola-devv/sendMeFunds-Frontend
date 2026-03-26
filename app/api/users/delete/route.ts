import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import User from '@/lib/models/User';
import Token from '@/lib/models/Token';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const user = await User.findByIdAndDelete(auth.user.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await Token.deleteMany({ user: auth.user.userId });

    const res = NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    res.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
    res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}