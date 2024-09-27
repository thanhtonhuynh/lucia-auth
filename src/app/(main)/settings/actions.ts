'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { UpdateProfileValues, updateProfileSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function updateProfile(values: UpdateProfileValues) {
  const { user } = await auth();
  if (!user) {
    throw Error('Unauthorized');
  }

  const { name } = updateProfileSchema.parse(values);

  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  revalidatePath('/');
}
