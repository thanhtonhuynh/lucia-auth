import prisma from '@/lib/prisma';

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });

  return user;
}
