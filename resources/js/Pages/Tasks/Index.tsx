import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CreateTaskModal from '@/Components/CreateTaskModal';
import TaskDetailModal from '../Projects/TaskDetailModal';
import TaskViewSwitcher from '@/Components/TaskViewSwitcher';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, tasks, employees, statuses, priorities, filters, projects = [] }: any) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Sync selectedTask when tasks props update
    useEffect(() => {
        if (selectedTask && tasks) {
            const updated = tasks.find((t: any) => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
        }
    }, [tasks]);

    // Open task or create modal from URL query param if present (e.g. from notification or dashboard link)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const taskIdParam = params.get('task_id') || params.get('taskId');
        if (taskIdParam && tasks) {
            const found = tasks.find((t: any) => String(t.id) === String(taskIdParam));
            if (found) setSelectedTask(found);
        }
        if (params.get('create') === '1' || params.get('create') === 'true') {
            setShowCreateModal(true);
        }
    }, [tasks]);

    // Sort tasks by priority
    const sortedTasks = [...(tasks || [])].sort((a: any, b: any) => {
        const priorityWeight: Record<string, number> = {
            'Urgent': 1,
            'High': 2,
            'Normal': 3,
            'Low': 4,
        };
        const weightA = priorityWeight[a.priority] || 99;
        const weightB = priorityWeight[b.priority] || 99;
        return weightA - weightB;
    });

    const activeFilterLabel = filters?.filter === 'active' 
        ? 'Active' 
        : filters?.filter === 'completed' 
        ? 'Completed' 
        : filters?.filter === 'overdue' 
        ? 'Overdue' 
        : filters?.status 
        ? `Status: ${filters.status}` 
        : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-bold text-xl text-gray-900 leading-tight">List Task</h2>
                        <p className="text-sm text-gray-500 mt-0.5">List of all assigned tasks and responsibilities</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <TaskViewSwitcher current="list" />
                        <PrimaryButton onClick={() => setShowCreateModal(true)}>
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Task
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="List Task" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xs rounded-2xl border border-slate-200">
                        <div className="p-6 text-slate-900">
                            {/* Filter Tabs */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                                    <Link
                                        href={route('tasks.index')}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            !filters?.filter && !filters?.status
                                                ? 'bg-white text-[#E31B23] shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                        }`}
                                    >
                                        All Tasks
                                    </Link>
                                    <Link
                                        href={route('tasks.index', { filter: 'active' })}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            filters?.filter === 'active'
                                                ? 'bg-white text-blue-700 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                    >
                                        Active
                                    </Link>
                                    <Link
                                        href={route('tasks.index', { status: 'Done' })}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            filters?.status === 'Done'
                                                ? 'bg-white text-amber-700 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                    >
                                        Menunggu Approval
                                    </Link>
                                    <Link
                                        href={route('tasks.index', { filter: 'completed' })}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            filters?.filter === 'completed' || filters?.status === 'Approved'
                                                ? 'bg-white text-emerald-700 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                    >
                                        Approved (Selesai)
                                    </Link>
                                    <Link
                                        href={route('tasks.index', { filter: 'overdue' })}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            filters?.filter === 'overdue'
                                                ? 'bg-white text-red-700 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                    >
                                        Overdue
                                    </Link>
                                </div>

                                <div className="flex items-center gap-3">
                                    {activeFilterLabel && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">
                                                Filter: <span className="font-semibold text-[#E31B23]">{activeFilterLabel}</span>
                                            </span>
                                            <Link
                                                href={route('tasks.index')}
                                                className="text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors border border-slate-200"
                                            >
                                                ✕ Reset
                                            </Link>
                                        </div>
                                    )}
                                    <span className="text-xs text-slate-400 font-medium">Total: {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-slate-800">
                                    {activeFilterLabel ? `Task List (${activeFilterLabel})` : 'Task List'}
                                </h3>
                            </div>
                            
                            {tasks.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline</th>
                                                <th scope="col" className="relative px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-100">
                                            {sortedTasks.map((task: any) => (
                                                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {task.project_id ? (
                                                            <Link href={route('projects.show', task.project_id)} className="text-[#E31B23] hover:text-[#c4141b] font-medium">
                                                                {task.project?.name || 'Unknown Project'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-slate-400 italic text-xs">Standalone Task</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedTask(task)}
                                                            className="text-sm font-semibold text-slate-900 hover:text-[#E31B23] text-left transition-colors cursor-pointer"
                                                        >
                                                            {task.title}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border
                                                            ${task.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                            ${task.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                                            ${task.priority === 'Normal' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                            ${task.priority === 'Low' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
                                                        `}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                                            task.status === 'To Do' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            task.status === 'Review' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            task.status === 'Done' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                            task.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                            'bg-slate-100 text-slate-800 border-slate-200'
                                                        }`}>
                                                            {task.status === 'Done' ? 'Done (Menunggu Approval)' : task.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                                        {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {(() => {
                                                                const canEditThisTask = Boolean(
                                                                    (task.created_by && task.created_by === auth.user?.id) ||
                                                                    (task.project && task.project.created_by === auth.user?.id) ||
                                                                    (task.project && task.project.owner_id && auth.user?.employee?.id === task.project.owner_id) ||
                                                                    auth.user?.roles?.some((r: any) => ['Super Admin'].includes(r.name))
                                                                );
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedTask(task)}
                                                                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                                                            canEditThisTask 
                                                                                ? 'text-[#E31B23] hover:text-[#c4141b] bg-red-50 hover:bg-red-100 ring-1 ring-red-100' 
                                                                                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                                                                        }`}
                                                                    >
                                                                        {canEditThisTask ? 'Detail & Edit' : 'Detail'}
                                                                    </button>
                                                                );
                                                            })()}
                                                            {task.project_id ? (
                                                                <Link href={route('projects.show', task.project_id)} className="text-xs text-slate-400 hover:text-slate-600">Board</Link>
                                                            ) : (
                                                                <Link href={route('tasks.kanban')} className="text-xs text-slate-400 hover:text-slate-600">My List</Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 text-sm mb-3">No tasks currently assigned to you.</p>
                                    <button 
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E31B23] text-white rounded-xl text-xs font-semibold hover:bg-[#c4141b] active:bg-[#a30f15] shadow-xs transition-colors"
                                    >
                                        + Create New Task
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Detail & Edit Modal */}
            {selectedTask && (
                <TaskDetailModal 
                    task={selectedTask} 
                    currentUser={auth.user} 
                    onClose={() => setSelectedTask(null)} 
                    employees={employees}
                    statuses={statuses}
                    priorities={priorities}
                />
            )}

            <CreateTaskModal 
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                employees={employees}
                statuses={statuses}
                priorities={priorities}
                projects={projects}
                defaultProjectId={null}
            />
        </AuthenticatedLayout>
    );
}
