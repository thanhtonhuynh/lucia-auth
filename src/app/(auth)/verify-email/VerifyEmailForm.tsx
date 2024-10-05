'use client';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  verificationCodeSchema,
  VerificationCodeValues,
} from '@/lib/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { LoadingButton } from '@/components/LoadingButton';
import { ErrorMessage } from '@/components/Message';
import { useEffect, useState, useTransition } from 'react';
import {
  sendEmailVerificationCode,
  verifyEmail,
} from '../verify-email/actions';
import { Button } from '@/components/ui/button';
import { useCountdown } from 'usehooks-ts';
import { toast } from 'sonner';

type VerifyEmailFormProps = {
  userId: string;
  email: string;
};

export function VerifyEmailForm({ userId, email }: VerifyEmailFormProps) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<VerificationCodeValues>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      code: '',
    },
  });
  const countStart = 3;
  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: countStart,
    intervalMs: 1000,
  });

  useEffect(() => {
    if (count === 0) resetCountdown();
  }, [count]);

  async function onSubmit(values: VerificationCodeValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await verifyEmail(values, userId);

      if (error) setError(error);
    });
  }

  async function handleResendCode() {
    toast.promise(sendEmailVerificationCode(userId, email), {
      loading: 'Sending verification code...',
      success: 'Verification code resent! Please check your inbox.',
      error: (err) => `${err.message}`,
    });
    startCountdown();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" w-2/3 space-y-4">
        {error && <ErrorMessage message={error} />}

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-500">
                Please enter the 6-digit code sent to your email to complete
                your account sign up.
              </FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="text-sm">
          Didn't receive the code?
          <Button
            type="button"
            variant="link"
            className="text-blue-500"
            onClick={handleResendCode}
            disabled={count > 0 && count < countStart}
          >
            Resend code {count > 0 && count < countStart ? `(${count})` : ''}
          </Button>
        </div>

        <LoadingButton type="submit" loading={isPending}>
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
