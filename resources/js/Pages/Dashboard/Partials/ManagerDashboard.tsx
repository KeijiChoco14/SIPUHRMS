import React from 'react';

export default function ManagerDashboard({ data }: { data: any }) {
    const stats = {
        activeProjects: data?.activeProjects ?? 0,
        activeTasks: data?.activeTasks ?? 0,
        completedThisMonth: data?.completedThisMonth ?? 0,
        overdueTasks: data?.overdueTasks ?? 0,
    };
    const projectProgress = data?.projectProgress || [];

    const statItems = [
        { label: 'Active Projects', value: stats.activeProjects, gradient: 'from-indigo-500 to-indigo-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { label: 'Active Tasks', value: stats.activeTasks, gradient: 'from-blue-500 to-blue-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
        { label: 'Completed (Month)', value: stats.completedThisMonth, gradient: 'from-emerald-500 to-emerald-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { label: 'Overdue Tasks', value: stats.overdueTasks, gradient: 'from-red-500 to-rose-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg> },
    ];

    const statusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700';
            case 'Planning': return 'bg-blue-100 text-blue-700';
            case 'On Hold': return 'bg-amber-100 text-amber-700';
            case 'Completed': return 'bg-gray-100 text-gray-600';
            case 'Cancelled': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Executive Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statItems.map((stat, idx) => (
                    <div key={idx} className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.gradient} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
                        <div className={`inline-flex rounded-lg bg-gradient-to-br ${stat.gradient} p-2 text-white shadow-sm mb-3`}>
                            {stat.icon}
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Project Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Project Progress Overview
                    </h3>
                    <span className="text-xs text-gray-400">{projectProgress.length} projects</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {projectProgress.length > 0 ? projectProgress.map((project: any) => {
                        const progressColor = project.progress >= 75 ? 'bg-emerald-500' : project.progress >= 40 ? 'bg-blue-500' : project.progress >= 20 ? 'bg-amber-500' : 'bg-gray-400';
                        return (
                            <div key={project.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <h4 className="text-sm font-semibold text-gray-800 truncate">{project.name}</h4>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${statusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        <span className="text-xs text-gray-400">{project.completed_tasks}/{project.total_tasks} tasks</span>
                                        <span className="text-sm font-bold text-gray-700">{project.progress}%</span>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div className={`h-full rounded-full ${progressColor} transition-all duration-700`} style={{ width: `${project.progress}%` }} />
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="px-5 py-8 text-center">
                            <p className="text-sm text-gray-400">No projects found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
