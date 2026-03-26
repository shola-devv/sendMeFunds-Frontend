// app/api/users/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import User from '@/lib/models/User';
import { attachCookiesToResponse } from '@/lib/utils/tokens';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide email and password' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid Credentials' }, { status: 401 });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid Credentials' }, { status: 401 });
    }

    // Build the response first, then attach cookies to that exact object
    const res = NextResponse.json(
      { user: { email: user.email, name: user.name, role: user.role } },
      { status: 200 }
    );

    // Return the result of attachCookiesToResponse — it returns the same res
    return await attachCookiesToResponse({
      res,
      user: { userId: user._id.toString(), role: user.role },
    });

  } catch (err: any) {
    console.error('[login error]', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
