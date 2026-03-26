import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';
import Token from '@/lib/models/Token';

export const createSuper = async () => {
  try {
    if (!process.env.SUPERADMIN_EMAIL1 || !process.env.SUPERADMIN_PASSWORD1) {
      console.warn('⚠️  SUPERADMIN_EMAIL1 or PASSWORD1 not set');
      return;
    }

    const existing1 = await User.findOne({ email: process.env.SUPERADMIN_EMAIL1 });
    if (!existing1) {
      const hashed = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD1, 10);
      await User.create({
        name: 'Super Admin 1',
        email: process.env.SUPERADMIN_EMAIL1,
        phone: process.env.SUPERADMIN_PHONE1 || '0000000000',
        password: hashed,
        role: 'super-admin',
      });
      console.log('✅ Super Admin 1 created');
    } else {
      console.log('ℹ️  Super Admin 1 already exists');
    }

    if (process.env.SUPERADMIN_EMAIL2 && process.env.SUPERADMIN_PASSWORD2) {
      const count = await User.countDocuments({ role: 'super-admin' });
      if (count < 2) {
        const existing2 = await User.findOne({ email: process.env.SUPERADMIN_EMAIL2 });
        if (!existing2) {
          const hashed2 = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD2, 10);
          await User.create({
            name: 'Super Admin 2',
            email: process.env.SUPERADMIN_EMAIL2,
            phone: process.env.SUPERADMIN_PHONE2 || '0000000000',
            password: hashed2,
            role: 'super-admin',
          });
          console.log('✅ Super Admin 2 created');
        }
      }
    }
  } catch (err) {
    console.error('❌ Error creating super admin(s):', err);
  }
};