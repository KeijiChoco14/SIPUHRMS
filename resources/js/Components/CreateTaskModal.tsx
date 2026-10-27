import React, { useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import AssigneeSelect from './AssigneeSelect';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const DEFAULT_EMPTY_ASSIGNEES: number[] = [];

export default function CreateTaskModal({ 
    show, 
    onClose, 
    employees, 
    statuses, 
    priorities, 
    projects = [],
    defaultProjectId = null,
    defaultDeadline = '',
    defaultAssignees = DEFAULT_EMPTY_ASSIGNEES,
    defaultEstimatedDuration = 60,
}: { 
    show: boolean, 
    onClose: () => void, 
    employees: any[], 
    statuses: any[], 
    priorities: any[], 
    projects?: any[],
    defaultProjectId?: number | null,
    defaultDeadline?: string,
    defaultAssignees?: number[],
    defaultEstimatedDuration?: number | null,
}) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        priority: 'Normal',
        status: 'To Do',
        project_id: defaultProjectId || (projects.length > 0 ? projects[0].id : ''),
        deadline: defaultDeadline || '',
        start_date: defaultDeadline || '',
        estimated_duration: defaultEstimatedDuration || 60,
        assignees: defaultAssignees || ([] as number[]),
    });

    const prevShowRef = useRef(false);

    useEffect(() => {
        if (show && !prevShowRef.current) {
            setData({
                title: '',
                description: '',
                priority: 'Normal',
                status: 'To Do',
                project_id: defaultProjectId || (projects.length > 0 ? projects[0].id : ''),
                deadline: defaultDeadline || '',
                start_date: defaultDeadline || '',
                estimated_duration: defaultEstimatedDuration || 60,
                assignees: defaultAssignees || [],
            });
        }
        prevShowRef.current = show;
    }, [show, defaultProjectId, defaultDeadline, defaultEstimatedDuration]);

    const submitTask = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => {
                onClose();
                reset();
            }
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
                    <form onSubmit={submitTask}>
                        <div className="bg-white px-5 pt-6 pb-5 sm:p-6">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900" id="modal-title">
                                    Create New Task
                                </h3>
                                <button 
                                    type="button" 
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 rounded-lg p-1 text-sm transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Discuss design drafts and make a decision"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                                        required
                                    />
                                    {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                                </div>

                                {projects.length > 0 && !defaultProjectId && (
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Project</label>
                                        <select
                                            value={data.project_id || ''}
                                            onChange={e => setData('project_id', e.target.value ? Number(e.target.value) : '')}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                                        >
                                            <option value="">No Project (General)</option>
                                            {projects.map((proj: any) => (
                                                <option key={proj.id} value={proj.id}>{proj.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Add notes, context, or deliverables..."
                                        rows={2}
                                        className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                                    ></textarea>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Priority</label>
                                        <select
                                            value={data.priority}
                                            onChange={e => setData('priority', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                                        >
                                            {priorities.map(p => {
                                                const val = typeof p === 'string' ? p : p.value;
                                                const label = typeof p === 'string' ? p : p.name;
                                                return <option key={val} value={val}>{label}</option>
                                            })}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                                        >
                                            {statuses.map(s => {
                                                const val = typeof s === 'string' ? s : s.value;
                                                const label = typeof s === 'string' ? s : s.name;
                                                return <option key={val} value={val}>{label}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setData(d => ({
                                                    ...d,
                                                    start_date: val,
                                                    deadline: d.deadline && d.deadline >= val ? d.deadline : val,
                                                }));
                                            }}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Deadline (End)</label>
                                        <input
                                            type="date"
                                            value={data.deadline}
                                            min={data.start_date || undefined}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setData(d => ({
                                                    ...d,
                                                    deadline: val,
                                                    start_date: d.start_date || val,
                                                }));
                                            }}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Est. Duration</label>
                                        <select
                                            value={data.estimated_duration || 60}
                                            onChange={e => setData('estimated_duration', Number(e.target.value))}
                                            className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3"
                                        >
                                            <option value={30}>30 mins (0:30h)</option>
                                            <option value={45}>45 mins (0:45h)</option>
                                            <option value={60}>1 hour (1:00h)</option>
                                            <option value={90}>1.5 hours (1:30h)</option>
                                            <option value={120}>2 hours (2:00h)</option>
                                            <option value={180}>3 hours (3:00h)</option>
                                            <option value={240}>4 hours (4:00h)</option>
                                            <option value={300}>5 hours (5:00h)</option>
                                            <option value={480}>Full day (8:00h)</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Assignees</label>
                                    <AssigneeSelect 
                                        employees={employees}
                                        selectedIds={data.assignees}
                                        onChange={(ids) => setData('assignees', ids)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50/80 px-5 py-3.5 sm:px-6 flex flex-row-reverse gap-3 border-t border-slate-100">
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Task'}
                            </PrimaryButton>
                            <SecondaryButton onClick={onClose}>
                                Cancel
                            </SecondaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
