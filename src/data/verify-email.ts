import prisma from '@/lib/prisma';

export async function verifyVerificationCode(userId: string, code: string) {
  const databaseCode = await prisma.verificationCode.findFirst({
    where: { userId, code },
  });

  if (!databaseCode) {
    return false;
  }

  await prisma.verificationCode.delete({ where: { userId: userId } });
  if (databaseCode.expiresAt < new Date()) {
    return false;
  }

  return true;
}
