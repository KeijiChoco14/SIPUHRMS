import React, { useState, useEffect, useRef } from 'react';
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
    const [localTasks, setLocalTasks] = useState<any[]>(project.tasks || []);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
    const isDraggingRef = useRef(false);

    useEffect(() => {
        setLocalTasks(project.tasks || []);
    }, [project.tasks]);

    // Sync selectedTask when localTasks update (e.g. after adding comment/checklist/edit)
    useEffect(() => {
        if (selectedTask && localTasks) {
            const updated = localTasks.find((t: any) => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
        }
    }, [localTasks]);

    // Open task from URL query param if present (e.g. from notification)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const taskIdParam = params.get('task_id') || params.get('taskId');
        if (taskIdParam && localTasks) {
            const found = localTasks.find((t: any) => String(t.id) === String(taskIdParam));
            if (found) setSelectedTask(found);
        }
    }, [localTasks]);

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

    const handleDropTask = (taskId: number, newStatus: string) => {
        const currentTask = localTasks.find((t: any) => t.id === taskId);
        if (!currentTask || currentTask.status === newStatus) return;
        if (!canEditTaskStatus(currentTask)) return;

        const previousTasks = [...localTasks];
        setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        router.put(route('tasks.update', taskId), {
            status: newStatus,
        }, {
            preserveScroll: true,
            preserveState: true,
            onError: (errs) => {
                setLocalTasks(previousTasks);
                console.error('Failed to update task status:', errs);
            }
        });
    };

    const updateTaskStatus = (taskId: number, newStatus: string) => {
        handleDropTask(taskId, newStatus);
    };

    // Group tasks by status for the kanban board and sort by priority
    const getTasksByStatus = (statusValue: string) => {
        const priorityWeight: Record<string, number> = {
            'Urgent': 1,
            'High': 2,
            'Normal': 3,
            'Low': 4,
        };

        const filteredTasks = localTasks?.filter((t: any) => t.status === statusValue) || [];

        return filteredTasks.sort((a: any, b: any) => {
            const weightA = priorityWeight[a.priority] || 99;
            const weightB = priorityWeight[b.priority] || 99;
            return weightA - weightB;
        });
    };

    const canEditTaskStatus = (task: any) => {
        const userRoles = auth.user?.roles?.map((r: any) => r.name) || [];
        if (userRoles.some((role: string) => ['Super Admin'].includes(role))) {
            return true;
        }
        if (project.owner_id && auth.user?.employee?.id === project.owner_id) {
            return true;
        }
        if (project.created_by === auth.user?.id) {
            return true;
        }
        return task.assignees?.some((a: any) => a.user?.id === auth.user?.id || a.id === auth.user?.employee?.id);
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
            case 'Archived': return { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' };
            default: return { bg: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' };
        }
    };

    const kanbanColumns = ['To Do', 'In Progress', 'Review', 'Done'];
    const draggedTask = localTasks.find((t: any) => t.id === draggedTaskId);

    const totalTasks = localTasks?.length || 0;
    const completedTasks = localTasks?.filter((t: any) => t.status === 'Done')?.length || 0;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.progress || 0);
    const isCompleted = project.status === 'Completed' || (totalTasks > 0 && completedTasks >= totalTasks) || progressPercent >= 100;
    const pStyle = projectStatusStyle(isCompleted && project.status !== 'Archived' ? 'Completed' : project.status);
    const isOverdue = project.deadline && new Date(project.deadline) < new Date() && !isCompleted && project.status !== 'Archived' && project.status !== 'Cancelled';

    const isProjectCreator = canEdit ?? Boolean(
        project.created_by === auth.user?.id 
        || (project.owner_id && auth.user?.employee?.id === project.owner_id) 
        || auth.user?.roles?.some((r: any) => ['Super Admin'].includes(r.name))
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
                            <>
                                {project.status === 'Archived' ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Restore this project back to Active status?')) {
                                                router.post(route('projects.restore', project.id));
                                            }
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                                        title="Restore Project to Active Status"
                                    >
                                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Restore Project
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Archive this project? Archived projects will be hidden from the active list to prevent clutter.')) {
                                                router.post(route('projects.archive', project.id));
                                            }
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 text-gray-700 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                                        title="Archive Project"
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        Archive
                                    </button>
                                )}

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

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete project "${project.name}"? All tasks inside it will be permanently deleted.`)) {
                                            router.delete(route('projects.destroy', project.id));
                                        }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-semibold rounded-lg shadow-sm transition-colors"
                                    title="Permanently Delete Project"
                                >
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Project
                                </button>
                            </>
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
                    {/* Archived Notice Banner */}
                    {project.status === 'Archived' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between gap-3 text-purple-900 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📦</span>
                                <div>
                                    <p className="font-bold text-sm">This Project is Archived</p>
                                    <p className="text-xs text-purple-700 mt-0.5">This project is hidden from the active projects list to prevent clutter. You can restore it anytime to Active status.</p>
                                </div>
                            </div>
                            {isProjectCreator && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Restore this project back to Active status?')) {
                                            router.post(route('projects.restore', project.id));
                                        }
                                    }}
                                    className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-sm"
                                >
                                    Restore Project
                                </button>
                            )}
                        </div>
                    )}

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
                                        <span className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-gray-800'}`}>{progressPercent}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                                        <span>{completedTasks} of {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} completed</span>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 flex items-center gap-3">
                                    {project.start_date && (
                                        <span>Start: {new Date(project.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    )}
                                    {project.deadline && (
                                        <span className={`font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : isCompleted ? 'text-emerald-600 font-semibold' : 'text-gray-600'}`}>
                                            Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {isOverdue && ' (Overdue)'}
                                            {isCompleted && ' (Completed)'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <div className="flex flex-nowrap overflow-x-auto gap-5 pb-4">
                        {kanbanColumns.map((status) => {
                            const columnTasks = getTasksByStatus(status);
                            const isColumnDraggedOver = draggedOverColumn === status && draggedTask && draggedTask.status !== status;

                            return (
                                <div 
                                    key={status} 
                                    className={`flex-shrink-0 w-80 bg-gray-100/80 rounded-xl p-4 flex flex-col max-h-[75vh] border transition-all ${
                                        isColumnDraggedOver ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-400/40' : 'border-gray-200/60'
                                    }`}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                        if (draggedOverColumn !== status) {
                                            setDraggedOverColumn(status);
                                        }
                                    }}
                                    onDragEnter={(e) => {
                                        e.preventDefault();
                                        setDraggedOverColumn(status);
                                    }}
                                    onDragLeave={(e) => {
                                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                            if (draggedOverColumn === status) {
                                                setDraggedOverColumn(null);
                                            }
                                        }
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDraggedOverColumn(null);
                                        const taskIdStr = e.dataTransfer.getData('text/plain');
                                        const taskId = Number(taskIdStr) || draggedTaskId;
                                        if (taskId) {
                                            handleDropTask(taskId, status);
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                                            <span>{status}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-gray-600 border border-gray-200 font-semibold">
                                                {columnTasks.length}
                                            </span>
                                        </h3>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[140px]">
                                        {/* Drop placeholder preview */}
                                        {isColumnDraggedOver && (
                                            <div className="border-2 border-dashed border-indigo-400 bg-indigo-100/70 rounded-xl p-3 text-center text-xs font-semibold text-indigo-700 flex items-center justify-center gap-2 shadow-sm animate-pulse">
                                                <svg className="w-4 h-4 text-indigo-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                </svg>
                                                <span>Drop into {status}</span>
                                            </div>
                                        )}

                                        {columnTasks.map((task: any) => {
                                            const isBeingDragged = draggedTaskId === task.id;
                                            const canDrag = canEditTaskStatus(task);

                                            return (
                                                <div
                                                    key={task.id}
                                                    draggable={canDrag}
                                                    onDragStart={(e) => {
                                                        if (!canDrag) return;
                                                        isDraggingRef.current = true;
                                                        setDraggedTaskId(task.id);
                                                        e.dataTransfer.setData('text/plain', String(task.id));
                                                        e.dataTransfer.effectAllowed = 'move';
                                                    }}
                                                    onDragEnd={() => {
                                                        setDraggedTaskId(null);
                                                        setDraggedOverColumn(null);
                                                        setTimeout(() => {
                                                            isDraggingRef.current = false;
                                                        }, 100);
                                                    }}
                                                    onClick={() => {
                                                        if (!isDraggingRef.current) {
                                                            setSelectedTask(task);
                                                        }
                                                    }}
                                                    className={`group bg-white p-4 rounded-xl shadow-sm border transition-all duration-200 ${
                                                        canDrag ? 'cursor-grab active:cursor-grabbing select-none' : 'cursor-pointer'
                                                    } ${
                                                        isBeingDragged
                                                            ? 'opacity-30 scale-95 border-dashed border-2 border-indigo-400 bg-indigo-50/50 rotate-1 shadow-inner'
                                                            : 'border-gray-200/80 hover:shadow-md hover:border-indigo-300'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2 gap-2">
                                                        <h4 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                                                            {task.title}
                                                        </h4>
                                                        {canDrag && (
                                                            <span 
                                                                className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 pt-0.5 cursor-grab active:cursor-grabbing"
                                                                title="Drag and drop task card"
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                                                                </svg>
                                                            </span>
                                                        )}
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

                                                    <div 
                                                        className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2" 
                                                        onClick={(e) => e.stopPropagation()}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                    >
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
                                                                onClick={(e) => e.stopPropagation()}
                                                                onMouseDown={(e) => e.stopPropagation()}
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
                                            );
                                        })}

                                        {columnTasks.length === 0 && !isColumnDraggedOver && (
                                            <div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                                Tidak ada task
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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
                                        Add New Task to {project.name}
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                placeholder="Task title..."
                                                required
                                            />
                                            {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                            <textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                rows={3}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                placeholder="Task details..."
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
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
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
                                            <input
                                                type="date"
                                                value={data.deadline}
                                                onChange={(e) => setData('deadline', e.target.value)}
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Assignees</label>
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
                                        Save Task
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="mt-2 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
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
