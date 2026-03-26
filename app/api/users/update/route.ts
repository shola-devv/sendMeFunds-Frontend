import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import User from '@/lib/models/User';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';
import { attachCookiesToResponse } from '@/lib/utils/tokens';

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const { name, email, phone } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Please provide all values' }, { status: 400 });
    }

    const user = await User.findById(auth.user.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    await user.save();

    const res = NextResponse.json(
      { user: { email: user.email, name: user.name, phone: user.phone, role: user.role } },
      { status: 200 }
    );

    return await attachCookiesToResponse({
      res,
      user: { userId: user._id.toString(), role: user.role },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}