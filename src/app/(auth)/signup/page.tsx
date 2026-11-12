'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/lib/validation';
import { Lock, Mail, User, Building2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ email: string; verificationUrl?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      workspaceName: '',
      agreeTerms: false,
    },
  });

  const passwordVal = watch('password', '');
  const hasMinLength = passwordVal.length >= 8;
  const hasUpperCase = /[A-Z]/.test(passwordVal);
  const hasNumber = /[0-9]/.test(passwordVal);

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error?.message || 'Registration failed. Please check your details.');
        setIsLoading(false);
        return;
      }

      setSuccessInfo({
        email: data.email,
        verificationUrl: json.data?.verificationUrl,
      });
      setIsLoading(false);
    } catch {
      setErrorMessage('Network error during registration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create Your Workspace
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Start automating and scaling your social media presence with QuickPostly
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-medium leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successInfo ? (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Verification Link Generated!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            We sent a verification link to <strong>{successInfo.email}</strong>. For demonstration and instant testing, you can verify your account directly:
          </p>
          {successInfo.verificationUrl && (
            <Link
              href={successInfo.verificationUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>Verify Email Address Now &rarr;</span>
            </Link>
          )}
          <div className="pt-2">
            <Link href="/login" className="text-xs text-slate-500 hover:underline">
              Proceed to login page
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                {...register('name')}
                placeholder="Elena Rostova"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Work Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                {...register('email')}
                placeholder="elena@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Workspace / Agency Name (Optional)
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                {...register('workspaceName')}
                placeholder="Acme Growth Marketing"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                {...register('password')}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
            )}

            {/* Password Criteria Checklist */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500">
              <span className={hasMinLength ? 'text-emerald-500 font-semibold' : ''}>
                {hasMinLength ? '✓' : '•'} 8+ characters
              </span>
              <span className={hasUpperCase ? 'text-emerald-500 font-semibold' : ''}>
                {hasUpperCase ? '✓' : '•'} 1 Uppercase
              </span>
              <span className={hasNumber ? 'text-emerald-500 font-semibold' : ''}>
                {hasNumber ? '✓' : '•'} 1 Number
              </span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 mt-0.5"
              />
              <span className="leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-amber-600 dark:text-amber-400 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-amber-600 dark:text-amber-400 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-rose-500 font-medium pt-1">{errors.agreeTerms.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md shadow-amber-400/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Creating workspace...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-slate-500 pt-2">
        Already have an account?{' '}
        <Link href="/login" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
