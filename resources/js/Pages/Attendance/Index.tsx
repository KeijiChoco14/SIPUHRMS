import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import { Head, router } from '@inertiajs/react';

export default function AttendanceIndex({ attendances, selectedDate }: any) {
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('attendance.index'), { date: e.target.value });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Present':
                return 'success';
            case 'Late':
                return 'warning';
            case 'Absent':
                return 'danger';
            case 'Leave':
                return 'info';
            case 'Off':
            default:
                return 'neutral';
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-xl text-slate-900 tracking-tight">Daily Attendance Log</h2>}
        >
            <Head title="Attendance Log" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Catatan Kehadiran Karyawan</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Pantau status clock in, clock out, dan keterlambatan shift harian.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Tanggal:</label>
                                <input 
                                    type="date"
                                    className="rounded-xl border-slate-300 shadow-xs text-sm text-slate-900 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] py-2 px-3"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>

                        {attendances && attendances.length > 0 ? (
                            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                                <table className="min-w-full divide-y divide-slate-200 text-left">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan</th>
                                            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departemen</th>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Clock In</th>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Clock Out</th>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Late / OT</th>
                                            <th className="px-6 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Sumber</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {attendances.map((attendance: any) => (
                                            <tr key={attendance.id} className="hover:bg-slate-50/75 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                                                    {attendance.employee?.user?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {attendance.employee?.department?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium tabular-nums text-slate-700">
                                                    {attendance.clock_in ? attendance.clock_in.substring(0, 5) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium tabular-nums text-slate-700">
                                                    {attendance.clock_out ? attendance.clock_out.substring(0, 5) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Badge variant={getStatusVariant(attendance.status)} dot>
                                                        {attendance.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center tabular-nums">
                                                    {attendance.late_duration_minutes > 0 ? (
                                                        <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs">
                                                            {attendance.late_duration_minutes}m late
                                                        </span>
                                                    ) : attendance.overtime_minutes > 0 ? (
                                                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                                                            {attendance.overtime_minutes}m OT
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-center text-slate-500">
                                                    {attendance.source || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-500">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-slate-700">Tidak ada catatan kehadiran</p>
                                <p className="text-xs text-slate-400 mt-1">Belum ada karyawan yang clock in pada tanggal ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
