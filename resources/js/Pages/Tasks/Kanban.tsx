import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TaskDetailModal from '../Projects/TaskDetailModal';

const columnConfig: Record<string, { color: string; bg: string; border: string; icon: JSX.Element }> = {
    'To Do': {
        color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    },
    'In Progress': {
        color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    },
    'Review': {
        color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    },
    'Done': {
        color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
};

const priorityConfig: Record<string, { bg: string; text: string }> = {
    'Urgent': { bg: 'bg-red-100', text: 'text-red-700' },
    'High': { bg: 'bg-orange-100', text: 'text-orange-700' },
    'Normal': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Low': { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export default function Kanban({ auth, tasks, statuses, priorities }: any) {
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Sync selectedTask when tasks props update (e.g. after adding comment/checklist)
    useEffect(() => {
        if (selectedTask && tasks) {
            const updated = tasks.find((t: any) => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
        }
    }, [tasks]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'To Do': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Review': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const updateTaskStatus = (taskId: number, newStatus: string) => {
        router.put(route('tasks.update', taskId), {
            status: newStatus
        }, {
            preserveScroll: true
        });
    };

    const getTasksByStatus = (statusValue: string) => {
        return tasks?.filter((t: any) => t.status === statusValue) || [];
    };

    const kanbanColumns = ['To Do', 'In Progress', 'Review', 'Done'];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="font-bold text-xl text-gray-900">My Kanban Board</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Drag tasks across columns to update status</p>
                </div>
            }
        >
            <Head title="My Kanban" />

            <div className="mt-2">
                {/* Kanban Board */}
                <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 -mx-2 px-2">
                    {kanbanColumns.map(status => {
                        const config = columnConfig[status];
                        const columnTasks = getTasksByStatus(status);

                        return (
                            <div key={status} className="flex-shrink-0 w-80">
                                {/* Column Header */}
                                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl ${config.bg} border ${config.border} border-b-0`}>
                                    <span className={config.color}>{config.icon}</span>
                                    <h3 className={`font-bold text-sm ${config.color}`}>{status}</h3>
                                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                                        {columnTasks.length}
                                    </span>
                                </div>
                                
                                {/* Task Cards Container */}
                                <div className={`border ${config.border} border-t-0 rounded-b-xl bg-gray-50/50 p-2.5 space-y-2.5 min-h-[200px] max-h-[70vh] overflow-y-auto`}>
                                    {columnTasks.map((task: any) => {
                                        const priority = priorityConfig[task.priority] || priorityConfig['Normal'];
                                        const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Done';
                                        const assigneeNames = task.assignees?.map((a: any) => a.user?.name || 'Unknown') || [];
                                        
                                        return (
                                            <div 
                                                key={task.id} 
                                                className={`bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${isOverdue ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}
                                                onClick={() => setSelectedTask(task)}
                                            >
                                                <div className="p-3.5">
                                                    {/* Task Title */}
                                                    <h4 className="font-medium text-sm text-gray-900 leading-snug mb-1.5">{task.title}</h4>
                                                    
                                                    {/* Project Name */}
                                                    <p className="text-[11px] text-gray-400 mb-2.5 truncate">{task.project?.name}</p>

                                                    {/* Priority + Deadline Row */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${priority.bg} ${priority.text}`}>
                                                            {task.priority}
                                                        </span>
                                                        {task.deadline && (
                                                            <span className={`text-[10px] font-medium flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-50" onClick={e => e.stopPropagation()}>
                                                        {/* Assignee Avatars */}
                                                        <div className="flex -space-x-2">
                                                            {assigneeNames.slice(0, 3).map((name: string, idx: number) => (
                                                                <div key={idx} className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-[9px] font-bold border-2 border-white" title={name}>
                                                                    {name.charAt(0)}
                                                                </div>
                                                            ))}
                                                            {assigneeNames.length > 3 && (
                                                                <div className="h-6 w-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[9px] font-bold border-2 border-white">
                                                                    +{assigneeNames.length - 3}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Quick Actions */}
                                                        <div className="flex items-center gap-2">
                                                            {task.comments?.length > 0 && (
                                                                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                    {task.comments.length}
                                                                </span>
                                                            )}
                                                            {task.attachments?.length > 0 && (
                                                                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                                    {task.attachments.length}
                                                                </span>
                                                            )}
                                                            <select 
                                                                className={`text-[10px] border rounded font-semibold py-1 pl-2 pr-6 ${getStatusColor(task.status)} focus:ring-1 focus:ring-indigo-500`}
                                                                value={task.status}
                                                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                                            >
                                                                {kanbanColumns.map(col => (
                                                                    <option key={col} value={col}>{col}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {columnTasks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                            </div>
                                            <p className="text-xs text-gray-400">No tasks</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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
        </AuthenticatedLayout>
    );
}
