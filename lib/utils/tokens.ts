import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import Token from '@/lib/models/Token';

export interface UserPayload {
  userId: string;
  role: string;
}

interface TokenPayload {
  user: UserPayload;
}

export const isTokenValid = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
};

export const attachCookiesToResponse = async ({
  res,
  user,
  refreshToken,
}: {
  res: NextResponse;
  user: UserPayload;
  refreshToken?: string;
}): Promise<NextResponse> => {
  const accessTokenJWT = jwt.sign(
    { user },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );

  let refreshTokenValue = refreshToken;
  if (!refreshTokenValue) {
    refreshTokenValue = crypto.randomBytes(40).toString('hex');
    await Token.findOneAndUpdate(
      { user: user.userId },
      { user: user.userId, refreshToken: refreshTokenValue, isValid: true },
      { upsert: true, new: true }
    );
  }

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookies.set('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',      // ← changed from 'strict' to 'lax'
    maxAge: 15 * 60,
    path: '/',
  });

  res.cookies.set('refreshToken', refreshTokenValue, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',      // ← same here
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  return res;
};