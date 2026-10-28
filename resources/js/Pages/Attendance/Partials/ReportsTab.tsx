import React from 'react';

interface ReportsTabProps {
    startDate: string;
    endDate: string;
    filters: any;
    summary: any;
    departments: Array<{ id: number; name: string }>;
    departmentStats: any[];
    shifts: any[];
    onFilterChange: (newFilters: any) => void;
    onExportCsv: () => void;
}

export default function ReportsTab({
    startDate,
    endDate,
    filters,
    summary,
    departments,
    departmentStats,
    shifts,
    onFilterChange,
    onExportCsv,
}: ReportsTabProps) {
    const setPresetRange = (preset: 'this_week' | 'this_month' | 'last_month') => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (preset === 'this_week') {
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            start = new Date(today.setDate(diff));
            end = new Date(start);
            end.setDate(start.getDate() + 6);
        } else if (preset === 'this_month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (preset === 'last_month') {
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
        }

        const toIso = (d: Date) => d.toISOString().split('T')[0];
        onFilterChange({ ...filters, start_date: toIso(start), end_date: toIso(end) });
    };

    return (
        <div className="space-y-6">
            {/* Header Filter Panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-sm text-slate-900">Attendance & Punctuality Reports</h3>
                    <p className="text-xs text-slate-500">Generate period-based analytics and department time compliance reports</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setPresetRange('this_week')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                        This Week
                    </button>
                    <button
                        type="button"
                        onClick={() => setPresetRange('this_month')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                        This Month
                    </button>
                    <button
                        type="button"
                        onClick={() => setPresetRange('last_month')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                        Last Month
                    </button>

                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value })}
                            className="text-xs bg-transparent border-0 p-0 text-slate-800"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value })}
                            className="text-xs bg-transparent border-0 p-0 text-slate-800"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onExportCsv}
                        className="px-4 py-2 rounded-xl bg-[#E31B23] hover:bg-red-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download CSV Report</span>
                    </button>
                </div>
            </div>

            {/* Analytic Aggregation Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Recorded</span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-2">{summary.total_clocked_in}</div>
                    <p className="text-xs text-slate-500 mt-1">Clock events in period</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">On Time Compliance</span>
                    <div className="text-3xl font-extrabold text-emerald-700 mt-2">
                        {summary.total_clocked_in > 0 ? Math.round((summary.total_on_time / summary.total_clocked_in) * 100) : 100}%
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">{summary.total_on_time} on-time arrivals</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Late Incidents</span>
                    <div className="text-3xl font-extrabold text-amber-700 mt-2">{summary.total_late}</div>
                    <p className="text-xs text-amber-600 mt-1">Requires HR attention</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Unclosed Shifts</span>
                    <div className="text-3xl font-extrabold text-blue-700 mt-2">{summary.total_unclosed}</div>
                    <p className="text-xs text-blue-600 mt-1">Pending clock-out</p>
                </div>
            </div>

            {/* Department Punctuality & Compliance Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h4 className="font-bold text-sm text-slate-900">Department Compliance Ranking</h4>
                        <p className="text-xs text-slate-500">Comparison of attendance and timeliness across all hotel divisions</p>
                    </div>
                    <span className="text-xs text-slate-400">
                        Period: {startDate} to {endDate}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-3 py-3 text-center">Active Staff</th>
                                <th className="px-3 py-3 text-center">Present Staff</th>
                                <th className="px-3 py-3 text-center">Late Staff</th>
                                <th className="px-3 py-3">Attendance Progress</th>
                                <th className="px-4 py-3 text-right">Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {departmentStats.map((d: any) => {
                                const rate = d.total_employees > 0
                                    ? Math.round((d.present_employees / d.total_employees) * 100)
                                    : 0;

                                return (
                                    <tr key={d.id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-bold text-slate-900">{d.name}</td>
                                        <td className="px-3 py-3 text-center tabular-nums text-slate-600">{d.total_employees}</td>
                                        <td className="px-3 py-3 text-center tabular-nums font-semibold text-emerald-700">{d.present_employees}</td>
                                        <td className="px-3 py-3 text-center tabular-nums font-semibold text-amber-700">{d.late_employees}</td>
                                        <td className="px-3 py-3 min-w-[160px]">
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${Math.min(rate, 100)}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-extrabold text-slate-900 tabular-nums">{rate}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
