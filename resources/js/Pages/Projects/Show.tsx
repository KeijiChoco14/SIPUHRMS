import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import TaskDetailModal from './TaskDetailModal';
import AssigneeSelect from '@/Components/AssigneeSelect';
import EditProjectModal from '@/Components/EditProjectModal';

export default function Show({
    auth,
    project,
    statuses,
    priorities,
    employees,
    projectStatuses,
    departments,
    canEdit,
}: PageProps<{
    project: any;
    statuses: any[];
    priorities: any[];
    employees: any[];
    projectStatuses?: any[];
    departments?: any[];
    canEdit?: boolean;
}>) {
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Sync selectedTask when project props update (e.g. after adding comment/checklist/edit)
    useEffect(() => {
        if (selectedTask && project.tasks) {
            const updated = project.tasks.find((t: any) => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
        }
    }, [project.tasks]);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        priority: 'Normal',
        status: 'To Do',
        project_id: project.id,
        deadline: '',
        assignees: [] as number[],
    });

    const submitTask = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => {
                setShowTaskModal(false);
                reset();
            },
        });
    };

    const updateTaskStatus = (taskId: number, newStatus: string) => {
        router.put(route('tasks.update', taskId), {
            status: newStatus,
        }, {
            preserveScroll: true,
        });
    };

    // Group tasks by status for the kanban board and sort by priority
    const getTasksByStatus = (statusValue: string) => {
        const priorityWeight: Record<string, number> = {
            'Urgent': 1,
            'High': 2,
            'Normal': 3,
            'Low': 4,
        };

        const filteredTasks = project.tasks?.filter((t: any) => t.status === statusValue) || [];

        return filteredTasks.sort((a: any, b: any) => {
            const weightA = priorityWeight[a.priority] || 99;
            const weightB = priorityWeight[b.priority] || 99;
            return weightA - weightB;
        });
    };

    const canEditTaskStatus = (task: any) => {
        const userRoles = auth.user?.roles?.map((r: any) => r.name) || [];
        if (userRoles.some((role: string) => ['Super Admin', 'HRD / Admin', 'General Manager'].includes(role))) {
            return true;
        }
        if (project.owner_id === auth.user?.id) {
            return true;
        }
        return task.assignees?.some((a: any) => a.user?.id === auth.user?.id);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'To Do': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Review': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const projectStatusStyle = (st: string) => {
        switch (st) {
            case 'Active': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
            case 'Planning': return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' };
            case 'On Hold': return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
            case 'Completed': return { bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500' };
            case 'Cancelled': return { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };
        }
    };

    const kanbanColumns = ['To Do', 'In Progress', 'Review', 'Done'];

    const totalTasks = project.tasks?.length || 0;
    const completedTasks = project.tasks?.filter((t: any) => t.status === 'Done')?.length || 0;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.progress || 0);
    const pStyle = projectStatusStyle(project.status);
    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'Completed';

    const isProjectCreator = canEdit ?? Boolean(
        project.created_by === auth.user?.id 
        || (project.owner_id && auth.user?.employee?.id === project.owner_id) 
        || auth.user?.roles?.some((r: any) => ['Super Admin', 'HRD / Admin', 'General Manager'].includes(r.name))
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <Link href={route('projects.index')} className="text-gray-400 hover:text-gray-600 text-sm">
                                Projects
                            </Link>
                            <span className="text-gray-300">/</span>
                            <h2 className="font-bold text-xl text-gray-900 leading-tight truncate">
                                {project.name}
                            </h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                        {isProjectCreator && (
                            <button
                                type="button"
                                onClick={() => setShowEditProjectModal(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Project
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowTaskModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Task
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Project - ${project.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Project Overview Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${pStyle.bg}`}>
                                        <span className={`w-2 h-2 rounded-full ${pStyle.dot}`} />
                                        {project.status}
                                    </span>
                                    {project.department?.name && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            {project.department.name}
                                        </span>
                                    )}
                                    {project.owner && (
                                        <span className="text-xs text-gray-500">
                                            PIC: <strong className="text-gray-700">{project.owner.user?.name || project.owner.employee_number}</strong>
                                        </span>
                                    )}
                                </div>

                                {project.description && (
                                    <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
                                        {project.description}
                                    </p>
                                )}
                            </div>

                            {/* Progress & Dates */}
                            <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                <div className="w-full sm:w-48">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-500">Progress Task</span>
                                        <span className="font-bold text-gray-800">{progressPercent}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                                        <span>{completedTasks} dari {totalTasks} task selesai</span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 flex items-center gap-3">
                                    {project.start_date && (
                                        <span>Mulai: {new Date(project.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    )}
                                    {project.deadline && (
                                        <span className={`font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                            Deadline: {new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {isOverdue && ' (Overdue)'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <div className="flex flex-nowrap overflow-x-auto gap-5 pb-4">
                        {kanbanColumns.map((status) => (
                            <div key={status} className="flex-shrink-0 w-80 bg-gray-100/80 rounded-xl p-4 flex flex-col max-h-[75vh] border border-gray-200/60">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                                        <span>{status}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-600 border border-gray-200 font-semibold">
                                            {getTasksByStatus(status).length}
                                        </span>
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                    {getTasksByStatus(status).map((task: any) => (
                                        <div
                                            key={task.id}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-900 text-sm leading-snug hover:text-indigo-600 transition-colors">
                                                    {task.title}
                                                </h4>
                                            </div>

                                            {task.description && (
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                                    {task.description}
                                                </p>
                                            )}

                                            {/* Assignees avatars / chips */}
                                            {task.assignees?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {task.assignees.map((a: any) => (
                                                        <span key={a.id} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium border border-indigo-100">
                                                            {a.user?.name || a.employee_number}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2" onClick={(e) => e.stopPropagation()}>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border
                                                    ${task.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                    ${task.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                                    ${task.priority === 'Normal' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                    ${task.priority === 'Low' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                                                `}>
                                                    {task.priority}
                                                </span>

                                                {canEditTaskStatus(task) ? (
                                                    <select
                                                        className={`text-[10px] font-semibold border rounded-md py-1 pl-2 pr-6 ${getStatusColor(task.status)} focus:ring-1 focus:ring-indigo-500`}
                                                        value={task.status}
                                                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                                    >
                                                        {kanbanColumns.map((col) => (
                                                            <option key={col} value={col}>{col}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${getStatusColor(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {getTasksByStatus(status).length === 0 && (
                                        <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                            Tidak ada task
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    currentUser={auth.user}
                    project={project}
                    onClose={() => setSelectedTask(null)}
                    employees={employees}
                    statuses={statuses}
                    priorities={priorities}
                />
            )}

            {/* Edit Project Modal */}
            {isProjectCreator && (
                <EditProjectModal
                    show={showEditProjectModal}
                    onClose={() => setShowEditProjectModal(false)}
                    project={project}
                    departments={departments || []}
                    employees={employees}
                    projectStatuses={projectStatuses}
                />
            )}

            {/* Task Creation Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowTaskModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
                            <form onSubmit={submitTask}>
                                <div className="bg-white px-6 pt-5 pb-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4" id="modal-title">
                                        Tambah Task Baru ke {project.name}
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Task <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                placeholder="Judul task..."
                                                required
                                            />
                                            {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                                            <textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                rows={3}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                placeholder="Rincian task..."
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Prioritas</label>
                                                <select
                                                    value={data.priority}
                                                    onChange={(e) => setData('priority', e.target.value)}
                                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                >
                                                    {priorities.map((p) => {
                                                        const val = typeof p === 'string' ? p : p.value;
                                                        const label = typeof p === 'string' ? p : p.name;
                                                        return <option key={val} value={val}>{label}</option>;
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                                <select
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                >
                                                    {kanbanColumns.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tenggat Waktu (Deadline)</label>
                                            <input
                                                type="date"
                                                value={data.deadline}
                                                onChange={(e) => setData('deadline', e.target.value)}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Orang yang Ditugaskan (Assignees)</label>
                                            <AssigneeSelect
                                                employees={employees}
                                                selectedIds={data.assignees}
                                                onChange={(ids) => setData('assignees', ids)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-2 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto inline-flex justify-center rounded-lg shadow-sm px-5 py-2 bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        Simpan Task
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
