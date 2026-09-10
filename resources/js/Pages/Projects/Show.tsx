import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import TaskDetailModal from './TaskDetailModal';

export default function Show({ auth, project, statuses, priorities }: PageProps<{ project: any, statuses: any[], priorities: any[] }>) {
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    
    // Sync selectedTask when project props update (e.g. after adding comment/checklist)
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
    });

    const submitTask = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => {
                setShowTaskModal(false);
                reset();
            }
        });
    };

    const updateTaskStatus = (taskId: number, newStatus: string) => {
        router.put(route('tasks.update', taskId), {
            status: newStatus
        });
    };

    // Group tasks by status for the kanban board
    const getTasksByStatus = (statusValue: string) => {
        return project.tasks?.filter((t: any) => t.status === statusValue) || [];
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
        switch(status) {
            case 'To Do': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Review': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const kanbanColumns = ['To Do', 'In Progress', 'Review', 'Done'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {project.name}
                    </h2>
                    <button 
                        onClick={() => setShowTaskModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                        + Add Task
                    </button>
                </div>
            }
        >
            <Head title={project.name} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Kanban Board */}
                    <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4">
                        {kanbanColumns.map(status => (
                            <div key={status} className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4 flex flex-col max-h-[75vh]">
                                <h3 className="font-bold text-gray-700 mb-4 px-2">{status}</h3>
                                
                                <div className="flex-1 overflow-y-auto space-y-3">
                                    {getTasksByStatus(status).map((task: any) => (
                                        <div 
                                            key={task.id} 
                                            className="bg-white p-4 rounded shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm leading-snug">{task.title}</h4>
                                            </div>
                                            
                                            <div className="flex justify-between items-center mt-3" onClick={e => e.stopPropagation()}>
                                                <span className={`text-xs px-2 py-1 rounded font-semibold
                                                    ${task.priority === 'Urgent' ? 'bg-red-100 text-red-800' : ''}
                                                    ${task.priority === 'High' ? 'bg-orange-100 text-orange-800' : ''}
                                                    ${task.priority === 'Normal' ? 'bg-blue-100 text-blue-800' : ''}
                                                    ${task.priority === 'Low' ? 'bg-gray-100 text-gray-800' : ''}
                                                `}>
                                                    {task.priority}
                                                </span>
                                                
                                                {canEditTaskStatus(task) ? (
                                                    <select 
                                                        className={`text-[10px] font-semibold border rounded py-1 pl-2 pr-6 ${getStatusColor(task.status)} focus:ring-1 focus:ring-indigo-500`}
                                                        value={task.status}
                                                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                                    >
                                                        {kanbanColumns.map(col => (
                                                            <option key={col} value={col}>{col}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${getStatusColor(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {getTasksByStatus(status).length === 0 && (
                                        <div className="text-center py-4 text-sm text-gray-400 border-2 border-dashed border-gray-300 rounded">
                                            No tasks
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
                    onClose={() => setSelectedTask(null)} 
                />
            )}

            {/* Task Creation Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowTaskModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={submitTask}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                                        Create New Task
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={e => setData('title', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                            {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            ></textarea>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                                <select
                                                    value={data.priority}
                                                    onChange={e => setData('priority', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                >
                                                    {priorities.map(p => {
                                                        const val = typeof p === 'string' ? p : p.value;
                                                        const label = typeof p === 'string' ? p : p.name;
                                                        return <option key={val} value={val}>{label}</option>
                                                    })}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                                <select
                                                    value={data.status}
                                                    onChange={e => setData('status', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                >
                                                    {kanbanColumns.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Save Task
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
