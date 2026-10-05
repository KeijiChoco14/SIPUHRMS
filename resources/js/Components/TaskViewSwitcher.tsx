import React from 'react';
import { Link } from '@inertiajs/react';

interface TaskViewSwitcherProps {
    current: 'list' | 'kanban' | 'calendar';
}

export default function TaskViewSwitcher({ current }: TaskViewSwitcherProps) {
    return (
        <div className="inline-flex items-center p-1 bg-gray-100/90 rounded-xl border border-gray-200/80 shadow-inner">
            <Link
                href={route('tasks.index')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    current === 'list'
                        ? 'bg-white text-indigo-700 shadow-sm font-bold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>List</span>
            </Link>

            <Link
                href={route('tasks.kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    current === 'kanban'
                        ? 'bg-white text-indigo-700 shadow-sm font-bold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>Kanban</span>
            </Link>

            <Link
                href={route('tasks.calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    current === 'calendar'
                        ? 'bg-white text-indigo-700 shadow-sm font-bold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendar</span>
            </Link>
        </div>
    );
}
