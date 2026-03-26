import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  pin: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePin(enteredPin: string): Promise<boolean>;
}

const WalletSchema: Schema<IWallet> = new Schema(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    balance:  { type: Number, default: 0 },
    currency: { type: String, default: 'NGN' },
    pin:      { type: String, required: false },
  },
  { timestamps: true }
);

WalletSchema.pre('save', async function () {
  if (!this.isModified('pin')) return;
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin as string, salt);
});

WalletSchema.methods.comparePin = async function (enteredPin: string): Promise<boolean> {
  if (!this.pin) return false;
  return bcrypt.compare(enteredPin, this.pin);
};

export default mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);