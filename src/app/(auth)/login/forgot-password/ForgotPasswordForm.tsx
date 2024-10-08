'use client';

import { forgotPasswordSchema, ForgotPasswordValues } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { sendPasswordResetEmail } from './actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    startTransition(async () => {
      const { error } = await sendPasswordResetEmail(values);
      if (error) {
        toast.error(error);
        return;
      }

      toast.success(
        "If an account with that email exists, we've sent you an email with a link to reset your password."
      );
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <LoadingButton type="submit" className="w-full" loading={isPending}>
          Send password reset email
        </LoadingButton>

        <Button className="w-full gap-1" variant={'outline'} asChild>
          <Link href={'/login'}>
            <ArrowLeft size={15} />
            Back to Login
          </Link>
        </Button>
      </form>
    </Form>
  );
}
