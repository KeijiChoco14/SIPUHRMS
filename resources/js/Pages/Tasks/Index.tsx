import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import CreateTaskModal from '@/Components/CreateTaskModal';
import TaskDetailModal from '../Projects/TaskDetailModal';

export default function Index({ auth, tasks, employees, statuses, priorities }: any) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Sync selectedTask when tasks props update
    useEffect(() => {
        if (selectedTask && tasks) {
            const updated = tasks.find((t: any) => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-xl text-gray-900 leading-tight">My Tasks</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Daftar semua tugas dan pekerjaan yang ditugaskan</p>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-sm transition-colors"
                    >
                        + Create Task
                    </button>
                </div>
            }
        >
            <Head title="My Tasks" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100">
                        <div className="p-6 text-gray-900">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-800">Task List</h3>
                                <span className="text-xs text-gray-500">Total: {sortedTasks.length} task</span>
                            </div>
                            
                            {tasks.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
                                                <th scope="col" className="relative px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {sortedTasks.map((task: any) => (
                                                <tr key={task.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {task.project_id ? (
                                                            <Link href={route('projects.show', task.project_id)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                                                                {task.project?.name || 'Unknown Project'}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-400 italic text-xs">Task Mandiri</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedTask(task)}
                                                            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 text-left transition-colors cursor-pointer"
                                                        >
                                                            {task.title}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border
                                                            ${task.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                                            ${task.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                                            ${task.priority === 'Normal' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                            ${task.priority === 'Low' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                                                        `}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                                            task.status === 'To Do' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            task.status === 'Review' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            task.status === 'Done' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                            'bg-gray-100 text-gray-800 border-gray-200'
                                                        }`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                                        {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {(() => {
                                                                const canEditThisTask = Boolean(
                                                                    (task.created_by && task.created_by === auth.user?.id) ||
                                                                    (task.project && task.project.created_by === auth.user?.id) ||
                                                                    auth.user?.roles?.some((r: any) => ['Super Admin', 'HRD / Admin', 'General Manager'].includes(r.name))
                                                                );
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedTask(task)}
                                                                        className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                                                                            canEditThisTask 
                                                                                ? 'text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100' 
                                                                                : 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
                                                                        }`}
                                                                    >
                                                                        {canEditThisTask ? 'Detail & Edit' : 'Detail'}
                                                                    </button>
                                                                );
                                                            })()}
                                                            {task.project_id ? (
                                                                <Link href={route('projects.show', task.project_id)} className="text-xs text-gray-400 hover:text-gray-600">Board</Link>
                                                            ) : (
                                                                <Link href={route('tasks.kanban')} className="text-xs text-gray-400 hover:text-gray-600">Kanban</Link>
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
                                    <p className="text-gray-500 text-sm mb-3">Belum ada task yang ditugaskan kepada Anda saat ini.</p>
                                    <button 
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                                    >
                                        + Buat Task Baru
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
                defaultProjectId={null}
            />
        </AuthenticatedLayout>
    );
}
