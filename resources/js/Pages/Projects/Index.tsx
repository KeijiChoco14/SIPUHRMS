import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    'Planning': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    'Active': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    'Completed': { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
    'Cancelled': { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
};

export default function Index({ projects }: any) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-xl text-gray-900">Projects</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Manage and monitor all projects</p>
                    </div>
                    <Link 
                        href={route('projects.create')} 
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Project
                    </Link>
                </div>
            }
        >
            <Head title="Projects" />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                {projects.data.map((project: any) => {
                    const status = statusConfig[project.status] || statusConfig['Planning'];
                    const progressColor = project.progress >= 75 ? 'bg-emerald-500' : project.progress >= 40 ? 'bg-blue-500' : project.progress >= 20 ? 'bg-amber-500' : 'bg-gray-300';
                    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'Completed';
                    
                    return (
                        <Link 
                            key={project.id} 
                            href={route('projects.show', project.id)}
                            className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            {/* Colored top bar */}
                            <div className={`h-1.5 ${status.dot}`} />
                            
                            <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{project.name}</h3>
                                        {project.department?.name && (
                                            <p className="text-xs text-gray-400 mt-0.5">{project.department.name}</p>
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${status.bg} ${status.text} flex-shrink-0`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                        {project.status}
                                    </span>
                                </div>

                                {/* Description */}
                                {project.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>
                                )}

                                {/* Progress */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-gray-500">Progress</span>
                                        <span className="text-xs font-bold text-gray-700">{project.progress || 0}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                        <div className={`h-full rounded-full ${progressColor} transition-all duration-700`} style={{ width: `${project.progress || 0}%` }} />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    {project.deadline ? (
                                        <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {isOverdue && <span className="ml-1 text-red-500 font-semibold">• Overdue</span>}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-300">No deadline</span>
                                    )}
                                    <span className="text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Board →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {projects.data.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-flex rounded-full bg-indigo-50 p-4 mb-4">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No projects yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Create your first project to get started</p>
                    <Link 
                        href={route('projects.create')} 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Create Project
                    </Link>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
