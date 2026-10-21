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
        </div>
    );
}
