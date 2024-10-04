'use client';

import { loginSchema, LoginValues } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { login } from './actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/LoadingButton';
import { PasswordInput } from '@/components/PasswordInput';
import { ErrorMessage } from '@/components/Message';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function LoginForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const router = useRouter();

  async function onSubmit(values: LoginValues) {
    setError(undefined);
    startTransition(async () => {
      const { error, verifiedUser, user } = await login(values);

      if (error) setError(error);
      if (verifiedUser === false)
        router.push(`/verify-email?userId=${user?.id}&email=${user?.email}`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorMessage message={error} />}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Password
                <Link
                  className="text-xs text-blue-500 hover:underline"
                  href="/login/forgot-password"
                >
                  Forgot password?
                </Link>
              </FormLabel>
              <FormControl>
                <PasswordInput {...field} placeholder="Password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton type="submit" className="w-full" loading={isPending}>
          Login
        </LoadingButton>
      </form>
    </Form>
  );
}
