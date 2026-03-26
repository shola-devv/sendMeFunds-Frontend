import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connect';
import User from '@/lib/models/User';
import { attachCookiesToResponse } from '@/lib/utils/tokens';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashedPassword });

    const res = NextResponse.json(
      { user: { name: user.name, email: user.email, phone: user.phone, role: user.role } },
      { status: 201 }
    );

    return await attachCookiesToResponse({
      res,
      user: { userId: user._id.toString(), role: user.role },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}