'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, ContactFormData } from '@/lib/validation';
import { Mail, Phone, MapPin, CheckCircle, Send, Clock, Building2, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      planInterest: 'pro',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    // Simulate API dispatch to /api/v1/contact
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSubmitted(true);
    reset();
  };

  return (
    <div className="flex flex-col w-full py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-semibold">
            <span>Sales & Global Support</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Let&apos;s talk about scaling your social media presence
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Have questions about our agency plans, custom integrations, or migrating from another platform? Our team responds within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Details & Info Card */}
          <div className="space-y-8">
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Channels</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Email Us Directly</h3>
                    <p className="text-slate-500 text-xs">enterprise@quickpostly.com</p>
                    <p className="text-slate-500 text-xs">support@quickpostly.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Global Response Hours</h3>
                    <p className="text-slate-500 text-xs">Monday – Friday: 24h continuous</p>
                    <p className="text-slate-500 text-xs">Weekend: On-call emergency support</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Global Headquarters</h3>
                    <p className="text-slate-500 text-xs">QuickPostly Technologies Inc.</p>
                    <p className="text-slate-500 text-xs">548 Market St, Suite 7820, San Francisco, CA</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Strict confidentiality & NDAs supported for agencies</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200 space-y-2">
              <h3 className="font-bold text-sm text-amber-700 dark:text-amber-400">Migrating from SocialBee or Buffer?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We provide complimentary assisted concierge migration for agencies with 10+ social accounts. All your evergreen categories and schedules will be mapped automatically.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Thank you! Your message has been received.
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm">
                    A dedicated QuickPostly account specialist will review your details and reach out via email within 2 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-sm font-semibold transition-colors"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Send us an inquiry
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        placeholder="Sarah Jenkins"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      />
                      {errors.name && (
                        <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Work Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="sarah@agency.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Company */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Company or Agency Name
                      </label>
                      <input
                        type="text"
                        {...register('company')}
                        placeholder="Peak Growth Marketing"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      />
                    </div>

                    {/* Plan Interest */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Plan of Interest
                      </label>
                      <select
                        {...register('planInterest')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      >
                        <option value="starter">Starter Plan (5 Profiles)</option>
                        <option value="pro">Pro Growth Plan (15 Profiles)</option>
                        <option value="agency">Agency Scale Plan (50 Profiles)</option>
                        <option value="enterprise">Enterprise Custom Plan</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      How can our team help you? *
                    </label>
                    <textarea
                      rows={5}
                      {...register('message')}
                      placeholder="Tell us about your team size, number of social profiles, or specific workflow requirements..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                    {errors.message && (
                      <p className="text-xs text-rose-500 font-medium">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-400/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <span>Submit Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
