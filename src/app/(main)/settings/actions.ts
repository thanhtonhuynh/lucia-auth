'use server';

import { auth } from '@/auth';
import { updateUser } from '@/data/users';
import { UpdateProfileValues, updateProfileSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function updateProfile(values: UpdateProfileValues) {
  const { user } = await auth();
  if (!user) throw Error('Unauthorized');

  const { name } = updateProfileSchema.parse(values);

  await updateUser(user.id, { name });

  revalidatePath('/');
}
