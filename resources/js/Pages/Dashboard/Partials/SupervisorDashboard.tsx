import React from 'react';
import { Link } from '@inertiajs/react';

export default function SupervisorDashboard({ data }: { data: any }) {
    const stats = {
        activeProjects: data?.activeProjects ?? 0,
        totalTasks: data?.totalTasks ?? 0,
        completedTasks: data?.completedTasks ?? 0,
        overdueTasks: data?.overdueTasks ?? 0,
        pendingReview: data?.pendingReview ?? 0,
    };
    const teamWorkload = data?.teamWorkload || [];

    const statItems = [
        { label: 'Active Projects', value: stats.activeProjects, gradient: 'from-indigo-500 to-indigo-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { label: 'Total Tasks', value: stats.totalTasks, gradient: 'from-blue-500 to-blue-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { label: 'Completed', value: stats.completedTasks, gradient: 'from-emerald-500 to-emerald-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { label: 'Overdue', value: stats.overdueTasks, gradient: 'from-red-500 to-rose-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg> },
        { label: 'Pending Review', value: stats.pendingReview, gradient: 'from-amber-500 to-amber-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
    ];

    const maxWorkload = Math.max(...teamWorkload.map((e: any) => e.active_tasks_count || 0), 1);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statItems.map((stat, idx) => (
                    <div key={idx} className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${stat.gradient} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
                        <div className={`inline-flex rounded-lg bg-gradient-to-br ${stat.gradient} p-2 text-white shadow-sm mb-3`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Team Workload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Team Workload
                    </h3>
                    <span className="text-xs text-gray-400">{teamWorkload.length} members</span>
                </div>
                <div className="p-5 space-y-3">
                    {teamWorkload.length > 0 ? teamWorkload.map((employee: any) => {
                        const count = employee.active_tasks_count || 0;
                        const percentage = Math.round((count / maxWorkload) * 100);
                        const barColor = count > 10 ? 'bg-red-500' : count > 6 ? 'bg-amber-500' : 'bg-indigo-500';
                        
                        return (
                            <div key={employee.id} className="flex items-center gap-4">
                                <div className="flex items-center gap-3 w-44 flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                                        {employee.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{employee.user?.name}</p>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                                <span className={`text-sm font-bold w-12 text-right ${count > 10 ? 'text-red-600' : count > 6 ? 'text-amber-600' : 'text-gray-700'}`}>
                                    {count}
                                </span>
                            </div>
                        );
                    }) : (
                        <p className="text-sm text-gray-400 text-center py-4">No team members found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
