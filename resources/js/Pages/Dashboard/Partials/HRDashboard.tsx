import React from 'react';

export default function HRDashboard({ data }: { data: any }) {
    const stats = {
        employeeCount: data?.employeeCount ?? 0,
        departmentCount: data?.departmentCount ?? 0,
    };
    const employeeWorkload = data?.employeeWorkload || [];

    const statItems = [
        { label: 'Total Employees', value: stats.employeeCount, gradient: 'from-indigo-500 to-indigo-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
        { label: 'Departments', value: stats.departmentCount, gradient: 'from-teal-500 to-teal-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    ];

    const maxWorkload = Math.max(...employeeWorkload.map((e: any) => e.active_tasks_count || 0), 1);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
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
    );
}
