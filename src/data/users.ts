import prisma from '@/lib/prisma';
import { User } from '@prisma/client';
import { cache } from 'react';

export const getUserByEmail = cache(async (email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });

  return user;
});

export async function updateUser(userId: string, data: Partial<User>) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return user;
}
