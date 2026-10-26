import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword = true,
}: {
    status?: string;
    canResetPassword?: boolean;
}) {
    const rememberedLogin = typeof window !== 'undefined' ? localStorage.getItem('remember_login') || '' : '';
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        login: rememberedLogin,
        email: rememberedLogin,
        password: '',
        remember: !!rememberedLogin,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (data.remember) {
            localStorage.setItem('remember_login', data.login);
        } else {
            localStorage.removeItem('remember_login');
        }

        data.email = data.login;

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const loginError = errors.login || errors.email;

    return (
        <GuestLayout>
            <Head title="Sign In - SIPU Management" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sign In to SIPU Management</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Swiss-Belinn SKA Pekanbaru Employee Portal
                </p>
            </div>

            {status && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email or Username Identifier */}
                <div>
                    <InputLabel htmlFor="login" value="Email or Username" />
                    <TextInput
                        id="login"
                        type="text"
                        name="login"
                        value={data.login}
                        placeholder="e.g. employee@swissbelhotel.com or username"
                        className="mt-1.5 block w-full text-sm"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('login', e.target.value)}
                        required
                    />
                    <InputError message={loginError} className="mt-1.5" />
                </div>

                {/* Password with Visibility Toggle */}
                <div>
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-[#E31B23] hover:text-[#c4141b] hover:underline font-medium"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="relative mt-1.5">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            className="block w-full pr-10 text-sm"
                            autoComplete="current-password"
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
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                    <label htmlFor="remember" className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-xs text-slate-600">
                            Remember this device
                        </span>
                    </label>
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
                                Signing In...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </PrimaryButton>
                </div>

                {/* Self-Registration Link */}
                <div className="text-center pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Don't have an account yet?{' '}
                        <Link
                            href={route('register')}
                            className="font-bold text-[#E31B23] hover:text-[#c4141b] hover:underline"
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
