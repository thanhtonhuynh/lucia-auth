import prisma from '@/lib/prisma';
import { User } from 'lucia';

export async function verifyVerificationCode(user: User, code: string) {
  const databaseCode = await prisma.verificationCode.findFirst({
    where: {
      userId: user.id,
      expiresAt: { gte: new Date() },
    },
  });

  if (databaseCode)
    await prisma.verificationCode.delete({ where: { userId: user.id } });

  if (
    !databaseCode ||
    databaseCode.code !== code ||
    databaseCode.email !== user.email
  ) {
    return false;
  }

  return true;
}
