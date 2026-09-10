import React from 'react';
import { Link } from '@inertiajs/react';

const statCards = [
    { key: 'todo', label: 'To Do', gradient: 'from-slate-500 to-slate-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { key: 'in_progress', label: 'In Progress', gradient: 'from-blue-500 to-blue-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { key: 'review', label: 'Review', gradient: 'from-amber-500 to-amber-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
    { key: 'done', label: 'Completed', gradient: 'from-emerald-500 to-emerald-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { key: 'overdue', label: 'Overdue', gradient: 'from-red-500 to-rose-600', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg> },
];

const priorityColors: Record<string, string> = {
    Urgent: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Normal: 'bg-blue-100 text-blue-700 border-blue-200',
    Low: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function EmployeeDashboard({ data }: { data: any }) {
    const summary = data?.tasksSummary || { todo: 0, in_progress: 0, review: 0, done: 0, overdue: 0 };
    const upcomingTasks = data?.upcomingTasks || [];
    const announcements = data?.announcements || [];

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

            {/* Task Summary Cards */}
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Task Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {statCards.map(card => (
                        <div key={card.key} className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${card.gradient} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
                            <div className={`inline-flex rounded-lg bg-gradient-to-br ${card.gradient} p-2 text-white shadow-sm mb-3`}>
                                {card.icon}
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{(summary as any)[card.key]}</div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Two-column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Upcoming Deadlines
                        </h3>
                        <Link href={route('tasks.index')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All →</Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {upcomingTasks.length > 0 ? upcomingTasks.map((task: any) => {
                            const isOverdue = new Date(task.deadline) < new Date();
                            const daysLeft = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={task.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityColors[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                                                    {task.priority}
                                                </span>
                                                <span className="text-xs text-gray-400">{task.status}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-xs font-bold ${isOverdue ? 'text-red-600' : daysLeft <= 3 ? 'text-amber-600' : 'text-gray-600'}`}>
                                                {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <p className={`text-[10px] mt-0.5 font-medium ${isOverdue ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                                                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="px-5 py-8 text-center">
                                <svg className="mx-auto w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="mt-2 text-sm text-gray-400">No upcoming deadlines 🎉</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            My Performance
                        </h3>
                    </div>
                    {data?.latestPerformanceScore ? (
                        <div className="p-6 flex flex-col items-center">
                            <div className="relative">
                                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                                    <circle cx="60" cy="60" r="52" fill="none" 
                                        stroke={data.latestPerformanceScore.final_epi >= 80 ? '#6366f1' : data.latestPerformanceScore.final_epi >= 60 ? '#f59e0b' : '#ef4444'} 
                                        strokeWidth="12" strokeLinecap="round"
                                        strokeDasharray={`${(data.latestPerformanceScore.final_epi / 100) * 327} 327`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-gray-800">{data.latestPerformanceScore.final_epi}</span>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase">EPI Score</span>
                                </div>
                            </div>
                            <span className={`mt-4 px-4 py-1.5 text-sm font-semibold rounded-full ${
                                data.latestPerformanceScore.category === 'Excellent' ? 'bg-emerald-100 text-emerald-700' :
                                data.latestPerformanceScore.category === 'Very Good' ? 'bg-blue-100 text-blue-700' :
                                data.latestPerformanceScore.category === 'Good' ? 'bg-amber-100 text-amber-700' :
                                data.latestPerformanceScore.category === 'Needs Improvement' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {data.latestPerformanceScore.category}
                            </span>
                            <Link 
                                href={route('performance.show', [data.latestPerformanceScore.employee_id, data.latestPerformanceScore.performance_period_id])} 
                                className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                View Details →
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-6">
                            <div className="rounded-full bg-gray-100 p-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="mt-3 text-sm text-gray-400 text-center">No performance data available yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
