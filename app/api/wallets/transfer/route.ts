import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/connect';
import Wallet from '@/lib/models/Wallet';
import Ledger from '@/lib/models/Ledger';
import AuditLog from '@/lib/models/AuditLog';
import IdempotencyKey from '@/lib/models/IdempotencyKey';
import { authenticate, isNextResponse } from '@/lib/middleware/authenticate';

export async function POST(req: NextRequest) {
  await connectDB();
  const session = await mongoose.startSession();

  try {
    const auth = await authenticate(req);
    if (isNextResponse(auth)) return auth;

    const idempotencyKey = req.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Idempotency-Key required' }, { status: 400 });
    }

    const { senderWalletId, receiverWalletId, amount, pin } = await req.json();

    if (!senderWalletId || !receiverWalletId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (senderWalletId === receiverWalletId) {
      return NextResponse.json({ error: 'Cannot transfer to same wallet' }, { status: 400 });
    }
    if (amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!pin)        return NextResponse.json({ error: 'PIN is required' }, { status: 400 });

    const existing = await IdempotencyKey.findOne({ key: idempotencyKey });
    if (existing) return NextResponse.json(existing.response, { status: 200 });

    session.startTransaction();

    const existingInTxn = await IdempotencyKey.findOne({ key: idempotencyKey }).session(session);
    if (existingInTxn) {
      await session.abortTransaction();
      return NextResponse.json(existingInTxn.response, { status: 200 });
    }

    const sender   = await Wallet.findById(senderWalletId).session(session);
    const receiver = await Wallet.findById(receiverWalletId).session(session);
    if (!sender || !receiver) throw new Error('Wallet not found');

    const isPinCorrect = await sender.comparePin(pin);
    if (!isPinCorrect) throw new Error('Invalid PIN');
    if (sender.balance < amount) throw new Error('Insufficient funds');

    const senderBefore   = sender.balance;
    const receiverBefore = receiver.balance;
    sender.balance   -= amount;
    receiver.balance += amount;

    await sender.save({ session });
    await receiver.save({ session });

    const reference  = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const debitRef   = `${reference}_debit`;
    const creditRef  = `${reference}_credit`;

    await Ledger.create(
      [
        { walletId: sender._id, type: 'debit', amount, balanceBefore: senderBefore, balanceAfter: sender.balance, reference: debitRef, description: 'Transfer sent', status: 'success' },
        { walletId: receiver._id, type: 'credit', amount, balanceBefore: receiverBefore, balanceAfter: receiver.balance, reference: creditRef, description: 'Transfer received', status: 'success' },
      ],
      { session, ordered: true }
    );

    await AuditLog.create(
      [{ action: 'wallet_transfer', userId: auth.user.userId, walletId: sender._id, amount, status: 'success', reference }],
      { session, ordered: true }
    );

    const response = { message: 'Transfer successful', reference, amount, from: senderWalletId, to: receiverWalletId };

    await IdempotencyKey.create([{ key: idempotencyKey, response }], { session, ordered: true });

    await session.commitTransaction();
    return NextResponse.json(response, { status: 200 });

  } catch (err: any) {
    if (session.inTransaction()) await session.abortTransaction();
    return NextResponse.json({ error: err.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}