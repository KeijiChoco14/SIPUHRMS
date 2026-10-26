import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

export default function RegistrationPending() {
    return (
        <GuestLayout>
            <Head title="Registration Submitted Successfully - SIPU Management" />

            <div className="mb-6 text-center">
                {/* Brand / Status Icon */}
                <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-2xs border border-amber-200">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Pending IT Approval
                </div>

                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Registration Submitted Successfully
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    SIPU Management · Swiss-Belinn SKA Pekanbaru
                </p>
            </div>

            {/* Informational Card */}
            <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-2.5">
                    <p className="font-medium text-slate-800">
                        Your registration has been submitted successfully and is currently awaiting approval from the IT Department.
                    </p>
                    <p className="text-slate-600">
                        Your account will become available once your registration has been reviewed and approved.
                    </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <span className="font-semibold text-blue-950">Need assistance? </span>
                        If you require assistance or need an update regarding your registration, please contact the IT Department directly.
                    </div>
                </div>
            </div>

            {/* Primary Action */}
            <div className="space-y-3">
                <Link
                    href={route('login')}
                    className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-[#E31B23] hover:bg-[#c4141b] text-white font-semibold text-sm rounded-xl shadow-xs transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#E31B23] focus:ring-offset-2"
                >
                    Return to Login
                </Link>
            </div>
        </GuestLayout>
    );
}
