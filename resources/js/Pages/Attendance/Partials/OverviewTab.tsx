import React from 'react';
import { Link, router } from '@inertiajs/react';

interface OverviewTabProps {
    summary: {
        total_scheduled: number;
        total_clocked_in: number;
        total_on_time: number;
        total_late: number;
        total_unclosed: number;
        total_missing_in: number;
        total_needs_review: number;
    };
    startDate: string;
    endDate: string;
    filters: any;
    departments: Array<{ id: number; name: string }>;
    departmentStats: any[];
    recentEvents: any[];
    shifts: any[];
    onFilterByStatus: (status: string) => void;
    onDateChange: (start: string, end: string) => void;
    onDepartmentChange: (deptId: string) => void;
}

export default function OverviewTab({
    summary,
    startDate,
    endDate,
    filters,
    departments,
    departmentStats,
    recentEvents,
    shifts,
    onFilterByStatus,
    onDateChange,
    onDepartmentChange,
}: OverviewTabProps) {
    const isToday = startDate === new Date().toISOString().split('T')[0] && endDate === startDate;

    const setQuickDate = (preset: 'today' | 'yesterday' | 'this_week' | 'this_month') => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (preset === 'today') {
            // default start = end = today
        } else if (preset === 'yesterday') {
            start.setDate(today.getDate() - 1);
            end.setDate(today.getDate() - 1);
        } else if (preset === 'this_week') {
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
            start = new Date(today.setDate(diff));
            end = new Date(start);
            end.setDate(start.getDate() + 6);
        } else if (preset === 'this_month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }

        const formatIso = (d: Date) => d.toISOString().split('T')[0];
        onDateChange(formatIso(start), formatIso(end));
    };

    const attendanceRate = summary.total_scheduled > 0
        ? Math.round((summary.total_clocked_in / summary.total_scheduled) * 100)
        : summary.total_clocked_in > 0 ? 100 : 0;

    const punctualityRate = summary.total_clocked_in > 0
        ? Math.round((summary.total_on_time / summary.total_clocked_in) * 100)
        : 100;

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Period:</span>
                    <button
                        type="button"
                        onClick={() => setQuickDate('today')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isToday ? 'bg-[#E31B23] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuickDate('yesterday')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                    >
                        Yesterday
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuickDate('this_week')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                    >
                        This Week
                    </button>
                    <button
                        type="button"
                        onClick={() => setQuickDate('this_month')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                    >
                        This Month
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600">Department:</label>
                        <select
                            value={filters.department_id || ''}
                            onChange={(e) => onDepartmentChange(e.target.value)}
                            className="text-xs rounded-xl border-slate-200 py-1.5 px-3 focus:ring-[#E31B23] focus:border-[#E31B23] text-slate-800"
                        >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600">Date Range:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onDateChange(e.target.value, endDate)}
                            className="text-xs rounded-xl border-slate-200 py-1.5 px-2.5 focus:ring-[#E31B23] focus:border-[#E31B23]"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onDateChange(startDate, e.target.value)}
                            className="text-xs rounded-xl border-slate-200 py-1.5 px-2.5 focus:ring-[#E31B23] focus:border-[#E31B23]"
                        />
                    </div>
                </div>
            </div>

            {/* Metric KPI Cards (Clickable to jump directly into filtered Attendance Data) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Scheduled */}
                <button
                    type="button"
                    onClick={() => onFilterByStatus('')}
                    className="text-left bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden"
                >
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scheduled</span>
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{summary.total_scheduled}</div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <span>Roster assignments</span>
                        <span className="text-slate-400">&rarr;</span>
                    </p>
                </button>

                {/* 2. Clocked In (Present) */}
                <button
                    type="button"
                    onClick={() => onFilterByStatus('Present')}
                    className="text-left bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group relative overflow-hidden"
                >
                    <div className="flex items-center justify-between text-emerald-600 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Present</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">{summary.total_clocked_in}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                            {attendanceRate}% Rate
                        </span>
                    </div>
                </button>

                {/* 3. On Time */}
                <button
                    type="button"
                    onClick={() => onFilterByStatus('Present')}
                    className="text-left bg-white p-4 rounded-2xl border border-teal-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all group relative overflow-hidden"
                >
                    <div className="flex items-center justify-between text-teal-600 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">On Time</span>
                        <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-teal-700">{summary.total_on_time}</div>
                    <p className="text-[11px] text-teal-600/80 mt-1">
                        {punctualityRate}% Punctual
                    </p>
                </button>

                {/* 4. Late */}
                <button
                    type="button"
                    onClick={() => onFilterByStatus('Late')}
                    className="text-left bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group relative overflow-hidden"
                >
                    <div className="flex items-center justify-between text-amber-600 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Late</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-700">{summary.total_late}</div>
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">Click to inspect &rarr;</p>
                </button>

                {/* 5. In Progress (Missing Out) */}
                <button
                    type="button"
                    onClick={() => onFilterByStatus('In Progress')}
                    className="text-left bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group relative overflow-hidden"
                >
                    <div className="flex items-center justify-between text-blue-600 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">In Progress</span>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{summary.total_unclosed}</div>
                    <p className="text-[11px] text-blue-600/80 mt-1">Pending clock-out</p>
                </button>

                {/* 6. Needs Review */}
                <button
                    type="button"
                    onClick={() => onFilterByStatus('Needs Review')}
                    className="text-left bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all group relative overflow-hidden"
                >
                    <div className="flex items-center justify-between text-purple-600 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Review</span>
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">{summary.total_needs_review}</div>
                    <p className="text-[11px] text-purple-600/80 mt-1">Corrections / Anomaly</p>
                </button>
            </div>

            {/* Split Content Row: Department Performance + Quick Actions + Live Event Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Department Performance & Operational Shortcuts (7 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Department Progress Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900">Department Attendance Performance</h3>
                                <p className="text-xs text-slate-500">Breakdown of attendance and punctuality by hotel division</p>
                            </div>
                            <span className="text-xs font-semibold text-[#E31B23] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                {departmentStats.length} Departments
                            </span>
                        </div>

                        <div className="space-y-3.5 divide-y divide-slate-100">
                            {departmentStats.map((dept: any) => {
                                const rate = dept.total_employees > 0
                                    ? Math.round((dept.present_employees / dept.total_employees) * 100)
                                    : 0;

                                return (
                                    <div key={dept.id} className="pt-3 first:pt-0">
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <div className="font-semibold text-slate-800 flex items-center gap-2">
                                                <span>{dept.name}</span>
                                                <span className="text-[10px] text-slate-400 font-normal">
                                                    ({dept.present_employees}/{dept.total_employees} staff)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {dept.late_employees > 0 && (
                                                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                        {dept.late_employees} Late
                                                    </span>
                                                )}
                                                <span className="font-bold text-slate-700 tabular-nums">{rate}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                                style={{ width: `${Math.min(rate, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Operational Shortcuts */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-md p-5 text-white">
                        <h3 className="font-bold text-sm text-white mb-1">Time Management Shortcuts</h3>
                        <p className="text-xs text-slate-300 mb-4">Direct navigation to active HR operational tools</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <button
                                type="button"
                                onClick={() => router.get(route('attendance.index'), { tab: 'data' })}
                                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left border border-white/10 group"
                            >
                                <div className="text-[#E31B23] bg-white rounded-lg w-7 h-7 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold block text-white">Attendance Data</span>
                                <span className="text-[10px] text-slate-300">Detailed records</span>
                            </button>

                            <Link
                                href={route('schedules.index')}
                                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left border border-white/10 group block"
                            >
                                <div className="text-indigo-400 bg-white rounded-lg w-7 h-7 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold block text-white">Shift Roster</span>
                                <span className="text-[10px] text-slate-300">Weekly scheduler</span>
                            </Link>

                            <Link
                                href={route('shifts.index')}
                                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left border border-white/10 group block"
                            >
                                <div className="text-amber-500 bg-white rounded-lg w-7 h-7 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold block text-white">Shifts Master</span>
                                <span className="text-[10px] text-slate-300">Shift windows</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => router.get(route('attendance.index'), { tab: 'settings' })}
                                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left border border-white/10 group"
                            >
                                <div className="text-emerald-500 bg-white rounded-lg w-7 h-7 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold block text-white">Hotel Geofence</span>
                                <span className="text-[10px] text-slate-300">Radius & GPS</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Live Activity & Audit Stream (5 Cols) */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Live Attendance Activity
                                </h3>
                                <p className="text-xs text-slate-500">Real-time GPS clock events & audit triggers</p>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400">Latest 15</span>
                        </div>

                        <div className="space-y-3 overflow-y-auto flex-1 max-h-[480px] pr-1">
                            {recentEvents.length > 0 ? (
                                recentEvents.map((event: any) => {
                                    const isSuccess = event.status === 'success';
                                    const isClockIn = event.event_type === 'clock_in';
                                    const isClockOut = event.event_type === 'clock_out';
                                    const isCorrection = event.event_type === 'manual_correction';

                                    return (
                                        <div
                                            key={event.id}
                                            className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors border border-slate-100 flex items-start gap-3"
                                        >
                                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                                                isCorrection
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : isSuccess
                                                        ? (isClockIn ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700')
                                                        : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {isCorrection ? 'CR' : (isClockIn ? 'IN' : (isClockOut ? 'OUT' : '!'))}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-xs font-bold text-slate-800 truncate">
                                                        {event.employee?.user?.name || 'Staff Member'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                        {new Date(event.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} WIB
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                                        isCorrection
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : isSuccess
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {isCorrection ? 'HR Correction' : (isClockIn ? 'Clock In' : (isClockOut ? 'Clock Out' : 'Rejected'))}
                                                    </span>

                                                    {event.distance_meters !== null && event.distance_meters !== undefined && (
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {event.distance_meters}m from hotel
                                                        </span>
                                                    )}
                                                </div>

                                                {event.notes && (
                                                    <p className="text-[11px] text-slate-500 mt-1 truncate" title={event.notes}>
                                                        {event.notes}
                                                    </p>
                                                )}
                                                {event.reason && (
                                                    <p className="text-[10px] text-rose-600 mt-0.5 font-medium truncate">
                                                        Reason: {event.reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-slate-400 text-xs">
                                    No attendance events recorded yet for this period.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
