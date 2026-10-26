import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password - SIPU Management" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reset Account Password</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Receive a secure, time-limited reset link to your email
                </p>
            </div>

            <div className="mb-5 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                Enter the email address registered with your account. We will send a secure password reset link that will allow you to set a new password.
            </div>

            {status && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="e.g. employee@swissbelhotel.com"
                        className="mt-1.5 block w-full text-sm lowercase"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value.toLowerCase().trim())}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div className="pt-2">
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
                                Sending Reset Link...
                            </span>
                        ) : (
                            'Email Password Reset Link'
                        )}
                    </PrimaryButton>
                </div>

                <div className="text-center pt-3 border-t border-slate-100">
                    <Link
                        href={route('login')}
                        className="text-xs text-slate-500 hover:text-slate-800 hover:underline font-medium"
                    >
                        Return to Sign In
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
