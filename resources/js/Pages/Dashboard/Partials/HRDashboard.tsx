import React from 'react';
import { Link } from '@inertiajs/react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HRDashboard({ data }: { data: any }) {
    const stats = {
        employeeCount: data?.employeeCount ?? 0,
        departmentCount: data?.departmentCount ?? 0,
    };
    const employeeWorkload = data?.employeeWorkload || [];
    const departmentDistribution = data?.departmentDistribution || [];
    const announcements = data?.announcements || [];
    const attendanceToday = data?.attendanceTodaySummary || { total: 0, present: 0, late: 0, absent: 0 };
    const pendingLeaves = data?.pendingLeaves ?? 0;
    const pendingOvertime = data?.pendingOvertime ?? 0;
    const recentHires = data?.recentHires || [];

    const attendanceRate = attendanceToday.total > 0
        ? Math.round((attendanceToday.present / attendanceToday.total) * 100)
        : 0;

    const statItems = [
        { label: 'Total Employees', value: stats.employeeCount, gradient: 'from-indigo-500 to-indigo-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { label: 'Departments', value: stats.departmentCount, gradient: 'from-teal-500 to-teal-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
        { label: 'Pending Leaves', value: pendingLeaves, gradient: 'from-amber-500 to-amber-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { label: 'Pending Overtime', value: pendingOvertime, gradient: 'from-purple-500 to-purple-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ];

    const maxWorkload = Math.max(...employeeWorkload.map((e: any) => e.active_tasks_count || 0), 1);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6">
            {/* Announcement Banner */}
            {announcements.length > 0 && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-5 text-white shadow-lg">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-40" />
                    <div className="relative flex items-start gap-4">
                        <div className="flex-shrink-0 rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-lg leading-tight">{announcements[0].title}</h4>
                            <p className="mt-1 text-sm text-indigo-100 line-clamp-2">{announcements[0].message}</p>
                            <p className="mt-2 text-xs text-indigo-200">
                                {announcements[0].creator?.name} · {new Date(announcements[0].published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statItems.map((stat, idx) => (
                    <div key={idx} className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.gradient} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
                        <div className="flex items-center gap-4">
                            <div className={`inline-flex rounded-xl bg-gradient-to-br ${stat.gradient} p-3 text-white shadow-sm`}>
                                {stat.icon}
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                                <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Attendance Today + Recent Hires Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Today */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Today's Attendance
                        </h3>
                        <Link href={route('attendance.index')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All →</Link>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Ring chart */}
                        <div className="relative flex-shrink-0">
                            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="48" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                                <circle cx="60" cy="60" r="48" fill="none"
                                    stroke="#10b981"
                                    strokeWidth="14" strokeLinecap="round"
                                    strokeDasharray={`${(attendanceRate / 100) * 301.6} 301.6`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-800">{attendanceRate}%</span>
                                <span className="text-[9px] text-gray-400 font-semibold uppercase">Rate</span>
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="text-center p-3 rounded-lg bg-emerald-50">
                                <div className="text-xl font-bold text-emerald-700">{attendanceToday.present}</div>
                                <div className="text-[10px] font-semibold text-emerald-600 uppercase">Hadir</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-amber-50">
                                <div className="text-xl font-bold text-amber-700">{attendanceToday.late}</div>
                                <div className="text-[10px] font-semibold text-amber-600 uppercase">Telat</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-red-50">
                                <div className="text-xl font-bold text-red-700">{attendanceToday.absent}</div>
                                <div className="text-[10px] font-semibold text-red-600 uppercase">Absen</div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-gray-50">
                                <div className="text-xl font-bold text-gray-700">{attendanceToday.total}</div>
                                <div className="text-[10px] font-semibold text-gray-500 uppercase">Total</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Hires */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            Recent Hires
                        </h3>
                        <Link href={route('employees.index')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All →</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentHires.length > 0 ? recentHires.map((emp: any) => (
                            <div key={emp.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {emp.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{emp.user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {emp.position?.name} · {emp.department?.name}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-500">
                                            {emp.join_date ? new Date(emp.join_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="px-5 py-8 text-center">
                                <p className="text-sm text-gray-400">No recent hires</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            Employee Distribution
                        </h3>
                    </div>
                    <div className="p-6 flex justify-center items-center h-80">
                        {departmentDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={departmentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="employees_count"
                                        nameKey="name"
                                    >
                                        {departmentDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-gray-400 text-center">No department data available.</p>
                        )}
                    </div>
                </div>

                {/* Top Employee Workload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            Top Employee Workload
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-600">Top {employeeWorkload.length}</span>
                    </div>
                    <div className="p-5 space-y-3">
                        {employeeWorkload.length > 0 ? employeeWorkload.map((employee: any, idx: number) => {
                            const count = employee.active_tasks_count || 0;
                            const percentage = Math.round((count / maxWorkload) * 100);
                            const barColor = count > 10 ? 'bg-red-500' : count > 6 ? 'bg-amber-500' : 'bg-emerald-500';
                            
                            return (
                                <div key={employee.id} className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-300 w-5 text-right">{idx + 1}</span>
                                    <div className="flex items-center gap-3 w-40 flex-shrink-0">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                                            {employee.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 truncate">{employee.user?.name}</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold w-12 text-right ${count > 10 ? 'text-red-600' : count > 6 ? 'text-amber-600' : 'text-gray-700'}`}>
                                        {count} tasks
                                    </span>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-gray-400 text-center py-6">No workload data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
