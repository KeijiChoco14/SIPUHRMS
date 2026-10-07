import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TaskDetailModal from '../Projects/TaskDetailModal';
import CreateTaskModal from '@/Components/CreateTaskModal';
import TaskViewSwitcher from '@/Components/TaskViewSwitcher';

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

export default function Kanban({ auth, tasks, statuses, priorities, employees, projects = [] }: any) {
    const [localTasks, setLocalTasks] = useState<any[]>(tasks || []);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
    const isDraggingRef = useRef(false);

    // Keep localTasks in sync with Inertia tasks prop updates
    useEffect(() => {
        setLocalTasks(tasks || []);
    }, [tasks]);

    // Sync selectedTask when localTasks update (e.g. after adding comment/checklist)
    useEffect(() => {
        if (selectedTask && localTasks) {
            const updated = localTasks.find((t: any) => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
        }
    }, [localTasks]);

    // Open task or create modal from URL query param if present
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const taskIdParam = params.get('task_id') || params.get('taskId');
        if (taskIdParam && localTasks) {
            const found = localTasks.find((t: any) => String(t.id) === String(taskIdParam));
            if (found) setSelectedTask(found);
        }
        if (params.get('create') === '1' || params.get('create') === 'true') {
            setShowCreateModal(true);
        }
    }, [localTasks]);

    // Ensure drag state is cleared if drag ends anywhere on window
    useEffect(() => {
        const handleDragClean = () => {
            setDraggedTaskId(null);
            setDraggedOverColumn(null);
            setTimeout(() => {
                isDraggingRef.current = false;
            }, 50);
        };
        window.addEventListener('dragend', handleDragClean);
        window.addEventListener('drop', handleDragClean);
        return () => {
            window.removeEventListener('dragend', handleDragClean);
            window.removeEventListener('drop', handleDragClean);
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'To Do': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Review': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleDropTask = (taskId: number, newStatus: string) => {
        // Immediately reset drag states to prevent cards from staying greyed out
        setDraggedTaskId(null);
        setDraggedOverColumn(null);
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 50);

        const currentTask = localTasks.find((t: any) => t.id === taskId);
        if (!currentTask || currentTask.status === newStatus) return;

        const previousTasks = [...localTasks];

        // Optimistic UI update for instantaneous snappy feedback
        setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        router.put(route('tasks.update', taskId), {
            status: newStatus
        }, {
            preserveScroll: true,
            preserveState: true,
            onError: (errs) => {
                // Revert if error occurs
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
            'Low': 4
        };

        const filteredTasks = localTasks?.filter((t: any) => t.status === statusValue) || [];
        
        return filteredTasks.sort((a: any, b: any) => {
            const weightA = priorityWeight[a.priority] || 99;
            const weightB = priorityWeight[b.priority] || 99;
            return weightA - weightB;
        });
    };

    const kanbanColumns = ['To Do', 'In Progress', 'Review', 'Done'];
    const draggedTask = localTasks.find((t: any) => t.id === draggedTaskId);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-bold text-xl text-gray-900">My Kanban Board</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Drag and drop task cards between columns to update status instantly</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <TaskViewSwitcher current="kanban" />
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-sm transition-colors"
                        >
                            + Create Task
                        </button>
                    </div>
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
                        const isColumnDraggedOver = draggedOverColumn === status && draggedTask && draggedTask.status !== status;

                        return (
                            <div 
                                key={status} 
                                className="flex-shrink-0 w-80 flex flex-col"
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
                                    setDraggedTaskId(null);
                                    isDraggingRef.current = false;
                                    const taskIdStr = e.dataTransfer.getData('text/plain');
                                    const taskId = Number(taskIdStr) || draggedTaskId;
                                    if (taskId) {
                                        handleDropTask(taskId, status);
                                    }
                                }}
                            >
                                {/* Column Header */}
                                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl ${config.bg} border ${config.border} border-b-0 transition-all ${
                                    isColumnDraggedOver ? 'ring-2 ring-indigo-400 border-indigo-400' : ''
                                }`}>
                                    <span className={config.color}>{config.icon}</span>
                                    <h3 className={`font-bold text-sm ${config.color}`}>{status}</h3>
                                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                                        {columnTasks.length}
                                    </span>
                                </div>
                                
                                {/* Task Cards Container */}
                                <div className={`border ${
                                    isColumnDraggedOver 
                                        ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-400/30' 
                                        : `${config.border} bg-gray-50/50`
                                } border-t-0 rounded-b-xl p-2.5 space-y-2.5 min-h-[260px] max-h-[72vh] overflow-y-auto transition-all duration-150`}>
                                    
                                    {/* Drop Target Preview Banner */}
                                    {isColumnDraggedOver && (
                                        <div className="border-2 border-dashed border-indigo-400 bg-indigo-100/70 rounded-xl p-3 text-center text-xs font-semibold text-indigo-700 flex items-center justify-center gap-2 shadow-sm animate-pulse">
                                            <svg className="w-4 h-4 text-indigo-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                            <span>Drop into {status} column</span>
                                        </div>
                                    )}

                                    {columnTasks.map((task: any) => {
                                        const isBeingDragged = draggedTaskId === task.id;
                                        const priority = priorityConfig[task.priority] || priorityConfig['Normal'];
                                        const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Done';
                                        const assigneeNames = task.assignees?.map((a: any) => a.user?.name || 'Unknown') || [];
                                        
                                        return (
                                            <div 
                                                key={task.id} 
                                                draggable
                                                onDragStart={(e) => {
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
                                                className={`group bg-white rounded-xl shadow-sm border transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                                                    isBeingDragged
                                                        ? 'opacity-30 scale-95 border-dashed border-2 border-indigo-400 bg-indigo-50/50 rotate-1 shadow-inner'
                                                        : 'hover:shadow-md hover:-translate-y-0.5 border-gray-200/80 hover:border-indigo-300'
                                                } ${isOverdue && !isBeingDragged ? 'border-red-200 ring-1 ring-red-100' : ''}`}
                                            >
                                                <div className="p-3.5">
                                                    {/* Task Title + Drag Handle Icon */}
                                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                                        <h4 className="font-semibold text-sm text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
                                                            {task.title}
                                                        </h4>
                                                        <span 
                                                            className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 pt-0.5 cursor-grab active:cursor-grabbing"
                                                            title="Drag and drop task card"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    
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
                                                                {new Date(task.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Footer */}
                                                    <div 
                                                        className="flex items-center justify-between pt-2.5 border-t border-gray-50" 
                                                        onClick={e => e.stopPropagation()}
                                                        onMouseDown={e => e.stopPropagation()}
                                                    >
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
                                                                onClick={e => e.stopPropagation()}
                                                                onMouseDown={e => e.stopPropagation()}
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
                                    
                                    {columnTasks.length === 0 && !isColumnDraggedOver && (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 text-gray-300">
                                                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                            </div>
                                            <p className="text-xs text-gray-400">No tasks yet</p>
                                            <p className="text-[11px] text-gray-400/80 mt-0.5">Drag tasks here</p>
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
