import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState } from 'react';

export default function Register({
    corporateDomain = 'swissbelhotel.com',
}: {
    corporateDomain?: string;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register - SIPU Management" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Staff Account</h1>
                <p className="text-xs text-slate-500 mt-1">
                    SIPU Management · Swiss-Belinn SKA Pekanbaru
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Full Name */}
                <div>
                    <InputLabel htmlFor="name" value="Full Name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        placeholder="e.g. John Doe"
                        className="mt-1.5 block w-full text-sm"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                {/* Username */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="username" value="Username" />
                        <span className="text-[11px] text-slate-400">3-30 letters, numbers, dot, or _</span>
                    </div>
                    <TextInput
                        id="username"
                        name="username"
                        value={data.username}
                        placeholder="e.g. john.doe"
                        className="mt-1.5 block w-full text-sm lowercase"
                        autoComplete="username"
                        onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                        required
                    />
                    <InputError message={errors.username} className="mt-1.5" />
                </div>

                {/* Email Address with Corporate Email Notice */}
                <div>
                    <InputLabel htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder={`e.g. staff@${corporateDomain} or personal email`}
                        className="mt-1.5 block w-full text-sm lowercase"
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value.toLowerCase().trim())}
                        required
                    />
                    <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                        Staff with an official hotel email must register using their <span className="font-semibold text-slate-700">@{corporateDomain}</span> address. Other team members may use their personal email.
                    </p>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password with Visibility Toggle */}
                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <div className="relative mt-1.5">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="At least 8 characters"
                            className="block w-full pr-10 text-sm"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Confirm Password with Visibility Toggle */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <div className="relative mt-1.5">
                        <TextInput
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="Re-enter your password"
                            className="block w-full pr-10 text-sm"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {showConfirmPassword ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                {/* Terms of Service & Account Policy Checkbox */}
                <div className="pt-1">
                    <label className="flex items-start cursor-pointer select-none">
                        <Checkbox
                            name="terms"
                            checked={data.terms}
                            onChange={(e) => setData('terms', e.target.checked)}
                            className="mt-0.5"
                            required
                        />
                        <span className="ms-2 text-xs text-slate-600 leading-normal">
                            I accept the internal Swiss-Belinn account-use policy. I understand that email verification is required and module authorizations remain subject to management verification.
                        </span>
                    </label>
                    <InputError message={errors.terms} className="mt-1.5" />
                </div>

                {/* Submit Action */}
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
                                Creating Account...
                            </span>
                        ) : (
                            'Register Account'
                        )}
                    </PrimaryButton>
                </div>

                {/* Sign In Link */}
                <div className="text-center pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="font-bold text-[#E31B23] hover:text-[#c4141b] hover:underline"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
