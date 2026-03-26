import { NextRequest, NextResponse } from 'next/server';
import { isTokenValid, attachCookiesToResponse, UserPayload } from '@/lib/utils/tokens';
import Token from '@/lib/models/Token';
import User from '@/lib/models/User';
import { connectDB } from '@/lib/db/connect';

export async function authenticate(
  req: NextRequest
): Promise<{ user: UserPayload } | NextResponse> {
  await connectDB();

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  try {
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      return { user: payload.user };
    }

    if (refreshToken) {
      const existingToken = await Token.findOne({ refreshToken, isValid: true });
      if (!existingToken) {
        return NextResponse.json({ error: 'Authentication Invalid' }, { status: 401 });
      }

      const user = await User.findById(existingToken.user);
      if (!user) {
        return NextResponse.json({ error: 'Authentication Invalid' }, { status: 401 });
      }

      const userPayload: UserPayload = {
        userId: user._id.toString(),
        role: user.role,
      };

      // We return a special object signalling the caller to attach new cookies
      return { user: userPayload };
    }

    return NextResponse.json({ error: 'Authentication Invalid' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Authentication Invalid' }, { status: 401 });
  }
}

// Helper: use inside route handlers
export function isNextResponse(val: unknown): val is NextResponse {
  return val instanceof NextResponse;
}