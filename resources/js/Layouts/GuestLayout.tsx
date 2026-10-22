import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-50 pt-8 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="inline-block transition-transform hover:scale-105">
                    <ApplicationLogo className="h-24 w-24 object-cover rounded-2xl shadow-sm" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-8 py-8 shadow-sm rounded-2xl border border-slate-200 sm:max-w-md">
                {children}
            </div>

            {/* Footer */}
            <footer className="mt-8 mb-4 text-center text-xs text-slate-500 space-y-1.5">
                <p>&copy; {new Date().getFullYear()} <strong className="text-slate-700 font-semibold">Swiss-Belinn SKA Pekanbaru</strong>. All rights reserved.</p>
                <div className="flex items-center justify-center gap-1.5 text-slate-500">
                    <span>Developed by</span>
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px] shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23]"></span>
                        Stackbit
                    </span>
                </div>
            </footer>
        </div>
    );
}
