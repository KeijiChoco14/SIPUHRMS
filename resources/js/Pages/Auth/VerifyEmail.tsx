import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verify Email - SIPU Management" />

            <div className="mb-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mb-3 shadow-2xs border border-red-100">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Verify Your Email Address</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Confirm your email inbox to activate your account
                </p>
            </div>

            <div className="mb-5 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <p>
                    Thanks for registering for <strong className="text-slate-800">SIPU Management</strong>! Before accessing hotel modules, please verify your email address by clicking on the confirmation link we just emailed to you.
                </p>
                <p className="mt-2 text-slate-500">
                    If you do not see the message within a few minutes, please be sure to check your <strong className="text-slate-700">Spam or Junk folder</strong>.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>A fresh verification link has been sent to the email address provided during registration.</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <PrimaryButton
                    className="w-full justify-center py-2.5 bg-[#E31B23] hover:bg-[#c4141b] text-white font-semibold text-sm rounded-xl shadow-xs"
                    disabled={processing}
                >
                    {processing ? (
                        <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            Sending Link...
                        </span>
                    ) : (
                        'Resend Verification Email'
                    )}
                </PrimaryButton>

                <div className="text-center pt-2">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs text-slate-500 hover:text-slate-800 hover:underline font-medium"
                    >
                        Sign out and return to Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
