import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';

interface ErrorProps {
    status?: number;
    title?: string;
    message?: string;
}

export default function ErrorPage({
    status = 403,
    title,
    message,
}: ErrorProps) {
    const auth = (usePage().props as any).auth;
    const user = auth?.user;
    const userRole = user?.roles?.[0]?.name ?? 'Staff / Employee';

    const defaultTitle = status === 403
        ? 'Access Denied (403 Forbidden)'
        : status === 404
        ? 'Page Not Found (404)'
        : 'System Error';

    const defaultMessage = status === 403
        ? 'Sorry, your account does not have the required permissions or role to view this page or module.'
        : status === 404
        ? 'The page or module you are looking for could not be found or has been moved.'
        : 'An unexpected server error occurred while processing your request.';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-rose-500 selection:text-white">
            <Head title={`${status} - ${title || defaultTitle}`} />

            {/* Top Brand Navbar */}
            <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center p-2 shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                        <ApplicationLogo className="h-full w-full object-contain filter brightness-0 invert" />
                    </div>
                    <div>
                        <span className="font-bold text-white text-base tracking-tight leading-none block">SIPU Management</span>
                        <span className="text-[10px] text-slate-400 leading-none mt-1 block">Swiss-Belinn SKA Pekanbaru</span>
                    </div>
                </Link>

                {user && (
                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                        <span className="text-slate-300">Logged in as:</span>
                        <span className="font-bold text-white truncate max-w-[120px]">{user.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                            {userRole}
                        </span>
                    </div>
                )}
            </header>

            {/* Main Error Centerpiece */}
            <main className="max-w-xl w-full mx-auto my-auto py-10">
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl text-center space-y-6">
                    {/* Glowing Shield Icon */}
                    <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
                        <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-xl animate-pulse"></div>
                        <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg border border-white/20">
                            {status === 403 ? (
                                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            ) : (
                                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                        </div>
                        <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-md border-2 border-slate-900">
                            {status}
                        </span>
                    </div>

                    {/* Headings */}
                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            {title || defaultTitle}
                        </h1>
                        <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                            {message || defaultMessage}
                        </p>
                    </div>

                    {/* Notice Card */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs text-slate-300 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-amber-300">
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Security & Access Policy Information:</span>
                        </div>
                        <p className="leading-relaxed text-slate-400">
                            This module is protected by Role-Based Access Control (RBAC). If you believe you should have access to this feature (such as the HR, Payroll, Employee Records, or System Settings modules), please contact HR or your System Administrator.
                        </p>
                    </div>

                    {/* Action Navigation Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Return to Main Menu
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Previous Page
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center py-4 text-[11px] text-slate-500">
                SIPU Security Subsystem • Swiss-Belinn SKA Pekanbaru
            </footer>
        </div>
    );
}
