import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    'Planning': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    'Active': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    'Completed': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
    'Cancelled': { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400' },
    'Archived': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export default function Index({ projects, auth, filters }: any) {
    const activeStatus = filters?.status;
    const isAllSelected = !activeStatus || activeStatus === 'all';

    const handleArchive = (e: React.MouseEvent, projectId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Arsipkan project ini? Project yang diarsipkan akan disembunyikan dari daftar aktif agar tidak menumpuk.')) {
            router.post(route('projects.archive', projectId), {}, { preserveScroll: true });
        }
    };

    const handleRestore = (e: React.MouseEvent, projectId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm('Pulihkan project ini kembali ke status Aktif?')) {
            router.post(route('projects.restore', projectId), {}, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between w-full gap-4">
                    <div className="min-w-0">
                        <h2 className="font-bold text-xl text-gray-900 truncate">Projects</h2>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">Kelola dan pantau seluruh project hotel</p>
                    </div>
                    <Link 
                        href={route('projects.create')} 
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Project
                    </Link>
                </div>
            }
        >
            <Head title="Projects" />

            {/* Filter Tabs & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 mb-4 pb-2 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl border border-gray-200/60">
                    <Link
                        href={route('projects.index', { status: 'all' })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isAllSelected
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                        Semua Proyek
                    </Link>
                    <Link
                        href={route('projects.index', { status: 'Active' })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeStatus === 'Active'
                                ? 'bg-white text-emerald-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                        Aktif
                    </Link>
                    <Link
                        href={route('projects.index', { status: 'Planning' })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeStatus === 'Planning'
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                        Perencanaan
                    </Link>
                    <Link
                        href={route('projects.index', { status: 'Completed' })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeStatus === 'Completed'
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                        Selesai
                    </Link>
                    <Link
                        href={route('projects.index', { status: 'Archived' })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeStatus === 'Archived'
                                ? 'bg-white text-purple-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                    >
                        Diarsipkan 📦
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    {activeStatus && activeStatus !== 'all' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                                Filter: <span className="font-semibold text-indigo-600">{activeStatus}</span>
                            </span>
                            <Link
                                href={route('projects.index')}
                                className="text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors border border-gray-200"
                            >
                                ✕ Reset Filter
                            </Link>
                        </div>
                    )}
                    <span className="text-xs text-gray-400 font-medium">Total: {projects.total ?? projects.data?.length ?? 0} project</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                {projects.data.map((project: any) => {
                    const progressPercent = project.total_tasks > 0 
                        ? Math.round(((project.completed_tasks || 0) / project.total_tasks) * 100) 
                        : (project.progress || 0);
                    const isCompleted = project.status === 'Completed' || (project.total_tasks > 0 && (project.completed_tasks || 0) >= project.total_tasks) || progressPercent >= 100;
                    const status = statusConfig[isCompleted && project.status !== 'Archived' ? 'Completed' : project.status] || statusConfig['Planning'];
                    const progressColor = isCompleted ? 'bg-emerald-500' : progressPercent >= 75 ? 'bg-emerald-500' : progressPercent >= 40 ? 'bg-blue-500' : progressPercent >= 20 ? 'bg-amber-500' : 'bg-gray-300';
                    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && !isCompleted && project.status !== 'Archived' && project.status !== 'Cancelled';
                    const isProjectCreator = project.created_by === auth?.user?.id 
                        || (project.owner_id && auth?.user?.employee?.id === project.owner_id) 
                        || auth?.user?.roles?.some((r: any) => ['Super Admin', 'HRD / Admin', 'General Manager'].includes(r.name));
                    
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
                                        <div className="flex items-center gap-1.5">
                                            {project.total_tasks !== undefined && project.total_tasks > 0 && (
                                                <span className="text-[11px] text-gray-400 font-medium">
                                                    {project.completed_tasks || 0}/{project.total_tasks} tasks
                                                </span>
                                            )}
                                            <span className="text-xs font-bold text-gray-700">{progressPercent}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                        <div className={`h-full rounded-full ${progressColor} transition-all duration-700`} style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50 gap-2">
                                    {project.deadline ? (
                                        <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-500' : isCompleted ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {isOverdue && <span className="ml-1 text-red-500 font-semibold">• Overdue</span>}
                                            {isCompleted && <span className="ml-1 text-emerald-600 font-semibold">• Selesai</span>}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-300">No deadline</span>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        {isProjectCreator && (
                                            <>
                                                {project.status === 'Archived' ? (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleRestore(e, project.id)}
                                                        className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md border border-purple-200 transition-colors inline-flex items-center gap-1"
                                                        title="Pulihkan Project ke Status Aktif"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Pulihkan
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleArchive(e, project.id)}
                                                        className="text-xs font-medium text-gray-500 hover:text-amber-700 bg-gray-50 hover:bg-amber-50 px-2 py-1 rounded-md border border-gray-200 hover:border-amber-200 transition-colors inline-flex items-center gap-1"
                                                        title="Arsipkan Project agar tidak menumpuk"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                        </svg>
                                                        Arsip
                                                    </button>
                                                )}

                                                <Link
                                                    href={route('projects.edit', project.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-xs font-semibold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-2 py-1 rounded-md border border-gray-200 hover:border-indigo-200 transition-colors inline-flex items-center gap-1"
                                                    title="Edit Project"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                            </>
                                        )}
                                        <span className="text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            Board →
                                        </span>
                                    </div>
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {activeStatus ? `Tidak ada project dengan status "${activeStatus}"` : 'Belum ada project'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {activeStatus 
                            ? 'Coba ganti filter status atau reset filter untuk melihat project lainnya' 
                            : 'Mulai dengan membuat project baru untuk tim Anda'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        {activeStatus && (
                            <Link 
                                href={route('projects.index')} 
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Reset Filter
                            </Link>
                        )}
                        <Link 
                            href={route('projects.create')} 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Create Project
                        </Link>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
