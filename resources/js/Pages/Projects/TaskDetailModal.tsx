import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import AssigneeSelect from '@/Components/AssigneeSelect';

interface TaskDetailModalProps {
    task: any;
    onClose: () => void;
    currentUser: any;
    project?: any;
    employees?: any[];
    statuses?: any[];
    priorities?: any[];
}

const formatDate = (d: any) => {
    if (!d) return '';
    if (typeof d === 'string') return d.split('T')[0];
    return '';
};

export default function TaskDetailModal({
    task,
    onClose,
    currentUser,
    project,
    employees = [],
    statuses = [],
    priorities = [],
}: TaskDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'checklists' | 'attachments' | 'comments' | 'activity'>('details');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const [editData, setEditData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: typeof task?.priority === 'object' ? task.priority?.value || 'Normal' : task?.priority || 'Normal',
        status: typeof task?.status === 'object' ? task.status?.value || 'To Do' : task?.status || 'To Do',
        deadline: formatDate(task?.deadline),
        assignees: task?.assignees ? task.assignees.map((a: any) => a.id) : [],
    });

    useEffect(() => {
        if (task) {
            setEditData({
                title: task.title || '',
                description: task.description || '',
                priority: typeof task.priority === 'object' ? task.priority?.value || 'Normal' : task.priority || 'Normal',
                status: typeof task.status === 'object' ? task.status?.value || 'To Do' : task.status || 'To Do',
                deadline: formatDate(task.deadline),
                assignees: task.assignees ? task.assignees.map((a: any) => a.id) : [],
            });
        }
    }, [task]);

    const checklistForm = useForm({
        title: '',
    });

    const commentForm = useForm({
        content: '',
    });

    const attachmentForm = useForm({
        file: null as File | null,
    });

    const addChecklist = (e: React.FormEvent) => {
        e.preventDefault();
        checklistForm.post(route('tasks.checklists.store', task.id), {
            onSuccess: () => checklistForm.reset(),
            preserveScroll: true,
        });
    };

    const toggleChecklist = (checklist: any) => {
        router.put(route('tasks.checklists.update', checklist.id), {
            is_completed: !checklist.is_completed,
        }, { preserveScroll: true });
    };

    const deleteChecklist = (checklist: any) => {
        router.delete(route('tasks.checklists.destroy', checklist.id), { preserveScroll: true });
    };

    const addComment = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(route('tasks.comments.store', task.id), {
            onSuccess: () => commentForm.reset(),
            preserveScroll: true,
        });
    };

    const uploadAttachment = (e: React.FormEvent) => {
        e.preventDefault();
        attachmentForm.post(route('tasks.attachments.store', task.id), {
            onSuccess: () => attachmentForm.reset(),
            preserveScroll: true,
        });
    };

    const acknowledgeTask = () => {
        router.post(route('tasks.acknowledge', task.id), {}, { preserveScroll: true });
    };

    const handleSaveTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData.title.trim()) {
            setEditError('Judul task wajib diisi.');
            return;
        }

        setIsSaving(true);
        setEditError('');

        router.put(route('tasks.update', task.id), {
            title: editData.title,
            description: editData.description,
            priority: editData.priority,
            status: editData.status,
            deadline: editData.deadline || null,
            assignees: editData.assignees,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                setIsEditing(false);
            },
            onError: (errs) => {
                setIsSaving(false);
                setEditError(Object.values(errs)[0] as string || 'Terjadi kesalahan saat menyimpan.');
            },
        });
    };

    const handleDeleteTask = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus task "${task.title}"?`)) {
            router.delete(route('tasks.destroy', task.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    const isAssignee = task.assignees?.some((a: any) => a.user?.id === currentUser?.id);
    const hasAcknowledged = task.assignees?.find((a: any) => a.user?.id === currentUser?.id)?.pivot?.acknowledged_at !== null;

    const canEditTask = Boolean(
        (task?.created_by && task.created_by === currentUser?.id) ||
        (task?.project && task.project.created_by === currentUser?.id) ||
        (project && project.created_by === currentUser?.id) ||
        (project?.owner_id && currentUser?.employee?.id === project.owner_id) ||
        (task?.project?.owner_id && currentUser?.employee?.id === task.project.owner_id) ||
        currentUser?.roles?.some((r: any) => ['Super Admin'].includes(r.name))
    );

    const availableStatuses = statuses.length > 0
        ? statuses.map(s => typeof s === 'string' ? s : s.value || s.name)
        : ['To Do', 'In Progress', 'Review', 'Done'];

    const availablePriorities = priorities.length > 0
        ? priorities.map(p => typeof p === 'string' ? p : p.value || p.name)
        : ['Low', 'Normal', 'High', 'Urgent'];

    const priorityBadgeColor = (p: string) => {
        switch (p) {
            case 'Urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Normal': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const statusBadgeColor = (s: string) => {
        switch (s) {
            case 'To Do': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Review': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl h-[85vh] flex flex-col z-10 border border-gray-100">
                    
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b flex justify-between items-center shrink-0">
                        <div className="flex-1 min-w-0 pr-4">
                            {!isEditing ? (
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug break-words">
                                            {task.title}
                                        </h3>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${priorityBadgeColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusBadgeColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        {task.project?.name && (
                                            <span>Project: <span className="font-medium text-gray-700">{task.project.name}</span></span>
                                        )}
                                        {task.deadline && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                Deadline: {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Edit Informasi & Assignee Task
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Ubah judul, detail, atau tambah/kurang orang yang di-assign</p>
                                </div>
                            )}
                        </div>

                        {/* Action buttons in header */}
                        <div className="flex items-center gap-2 shrink-0">
                            {canEditTask && (!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors border border-indigo-200"
                                    title="Edit Task"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    Edit Task
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditError('');
                                    }}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                                >
                                    Batal Edit
                                </button>
                            ))}
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs (visible when not editing) */}
                    {!isEditing && (
                        <div className="border-b border-gray-200 bg-white px-6 shrink-0 overflow-x-auto">
                            <nav className="-mb-px flex space-x-6 min-w-max" aria-label="Tabs">
                                {[
                                    { id: 'details', label: 'Details' },
                                    { id: 'checklists', label: `Checklists (${task.checklists?.length || 0})` },
                                    { id: 'attachments', label: `Attachments (${task.attachments?.length || 0})` },
                                    { id: 'comments', label: `Comments (${task.comments?.length || 0})` },
                                    { id: 'activity', label: `Activity (${task.activities?.length || 0})` },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs sm:text-sm`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {/* EDIT MODE FORM */}
                        {isEditing ? (
                            <form onSubmit={handleSaveTask} className="space-y-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                {editError && (
                                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                                        {editError}
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Judul Task <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
                                        placeholder="Tuliskan judul task..."
                                        required
                                    />
                                </div>

                                {/* Priority, Status, Deadline */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Prioritas <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={editData.priority}
                                            onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        >
                                            {availablePriorities.map((p) => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={editData.status}
                                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        >
                                            {availableStatuses.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Tenggat Waktu (Deadline)
                                        </label>
                                        <input
                                            type="date"
                                            value={editData.deadline}
                                            onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Assignees */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Orang yang Ditugaskan (Assignees)
                                        </label>
                                        <span className="text-xs text-gray-400">
                                            {editData.assignees.length} orang terpilih
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Pilih departemen untuk memfilter staf, lalu pilih nama staf untuk menambah orang yang di-assign ke task ini.
                                    </p>
                                    <AssigneeSelect
                                        employees={employees}
                                        selectedIds={editData.assignees}
                                        onChange={(ids) => setEditData({ ...editData, assignees: ids })}
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Deskripsi Task
                                    </label>
                                    <textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        rows={4}
                                        placeholder="Rincian instruksi atau catatan mengenai task ini..."
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleDeleteTask}
                                        className="w-full sm:w-auto text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-2 rounded border border-red-200 hover:bg-red-50 transition-colors"
                                    >
                                        Hapus Task
                                    </button>

                                    <div className="flex w-full sm:w-auto justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            /* VIEW MODE */
                            <>
                                {/* Details Tab */}
                                {activeTab === 'details' && (
                                    <div className="space-y-6">
                                        {/* Description Card */}
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                            <h4 className="font-semibold text-gray-900 text-sm mb-2">Deskripsi</h4>
                                            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {task.description || (
                                                    <span className="italic text-gray-400">Tidak ada deskripsi.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Assignees Card */}
                                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900 text-sm">Orang yang Ditugaskan (Assignees)</h4>
                                                {canEditTask && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditing(true)}
                                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 inline-flex items-center gap-1 transition-colors"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                        Tambah / Kelola Assignee
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {task.assignees?.map((assignee: any) => (
                                                    <span
                                                        key={assignee.id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200"
                                                    >
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                                        <span>{assignee.user?.name || assignee.employee_number}</span>
                                                        {assignee.department?.name && (
                                                            <span className="text-[10px] text-indigo-500">({assignee.department.name})</span>
                                                        )}
                                                        {assignee.pivot?.acknowledged_at && (
                                                            <span
                                                                className="ml-1 text-green-600 font-bold"
                                                                title={`Diakui pada ${new Date(assignee.pivot.acknowledged_at).toLocaleString()}`}
                                                            >
                                                                ✓
                                                            </span>
                                                        )}
                                                    </span>
                                                ))}
                                                {(!task.assignees || task.assignees.length === 0) && (
                                                    <p className="text-sm text-gray-400 italic">Belum ada karyawan yang ditugaskan ke task ini.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acknowledge Alert */}
                                        {isAssignee && !hasAcknowledged && (
                                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-amber-800">
                                                            Anda ditugaskan pada task ini. Silakan konfirmasi penerimaan task.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={acknowledgeTask}
                                                        className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-4 rounded-lg shadow-sm transition-colors shrink-0 ml-4"
                                                    >
                                                        Konfirmasi Penerimaan Task
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Action Cards */}
                                        {canEditTask && (
                                            <div className="flex justify-end gap-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(true)}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    Edit Informasi & Assignee
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Checklists Tab */}
                                {activeTab === 'checklists' && (
                                    <div className="space-y-4">
                                        <form onSubmit={addChecklist} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={checklistForm.data.title}
                                                onChange={(e) => checklistForm.setData('title', e.target.value)}
                                                placeholder="Tambah item checklist baru..."
                                                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            />
                                            <button
                                                type="submit"
                                                disabled={checklistForm.processing || !checklistForm.data.title.trim()}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                Tambah
                                            </button>
                                        </form>

                                        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
                                            {task.checklists?.map((item: any) => (
                                                <div key={item.id} className="flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors">
                                                    <label className="flex items-center flex-1 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.is_completed}
                                                            onChange={() => toggleChecklist(item)}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                        <span className={`ml-3 text-sm ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                                            {item.title}
                                                        </span>
                                                    </label>
                                                    <button
                                                        onClick={() => deleteChecklist(item)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-medium ml-2 p-1 rounded hover:bg-red-50"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            ))}
                                            {task.checklists?.length === 0 && (
                                                <div className="p-6 text-center text-sm text-gray-400">Belum ada item checklist.</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Attachments Tab */}
                                {activeTab === 'attachments' && (
                                    <div className="space-y-4">
                                        <form onSubmit={uploadAttachment} className="flex items-end gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Unggah Berkas Baru</label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => attachmentForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                />
                                                {attachmentForm.errors.file && (
                                                    <p className="text-red-500 text-xs mt-1">{attachmentForm.errors.file}</p>
                                                )}
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={attachmentForm.processing || !attachmentForm.data.file}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 shrink-0"
                                            >
                                                Upload
                                            </button>
                                        </form>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {task.attachments?.map((attachment: any) => (
                                                <div key={attachment.id} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center shadow-sm">
                                                    <div className="flex items-center overflow-hidden">
                                                        <svg className="h-8 w-8 text-indigo-500 flex-shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        <div className="truncate">
                                                            <a
                                                                href={`/storage/${attachment.file_path}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs font-semibold text-indigo-600 hover:underline truncate block"
                                                            >
                                                                {attachment.file_name}
                                                            </a>
                                                            <span className="text-[10px] text-gray-500">
                                                                {(attachment.file_size / 1024).toFixed(1)} KB • Oleh {attachment.employee?.user?.name || 'Karyawan'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => router.delete(route('tasks.attachments.destroy', attachment.id), { preserveScroll: true })}
                                                        className="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {task.attachments?.length === 0 && (
                                            <div className="text-center py-8 text-sm text-gray-400 bg-white rounded-xl border border-gray-200">
                                                Belum ada berkas lampiran.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Comments Tab */}
                                {activeTab === 'comments' && (
                                    <div className="flex flex-col h-full space-y-4">
                                        <div className="flex-1 space-y-3">
                                            {task.comments?.map((comment: any) => (
                                                <div key={comment.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                                    <div className="flex justify-between items-start mb-1.5">
                                                        <div className="font-semibold text-xs text-gray-900">
                                                            {comment.employee?.user?.name || 'Karyawan'}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400">
                                                            {new Date(comment.created_at).toLocaleString('id-ID')}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                                </div>
                                            ))}
                                            {task.comments?.length === 0 && (
                                                <div className="text-center py-8 text-sm text-gray-400 bg-white rounded-xl border border-gray-200">
                                                    Belum ada komentar. Mulai diskusi di bawah!
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={addComment} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <textarea
                                                value={commentForm.data.content}
                                                onChange={(e) => commentForm.setData('content', e.target.value)}
                                                rows={3}
                                                placeholder="Tuliskan komentar atau pembaruan status..."
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm mb-2"
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={commentForm.processing || !commentForm.data.content.trim()}
                                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    Kirim Komentar
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Activity History Tab */}
                                {activeTab === 'activity' && (
                                    <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <ul className="relative border-l border-gray-200 ml-3 space-y-6">
                                            {task.activities?.map((activity: any) => (
                                                <li key={activity.id} className="ml-6">
                                                    <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-8 ring-white">
                                                        <svg className="w-3 h-3 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path>
                                                        </svg>
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{activity.description}</span>
                                                        <span className="text-[10px] text-gray-500 mt-0.5">
                                                            Oleh {activity.employee?.user?.name || 'System'} • {new Date(activity.created_at).toLocaleString('id-ID')}
                                                        </span>
                                                        {activity.old_value && activity.new_value && (
                                                            <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 border rounded-lg inline-block">
                                                                <span className="line-through text-red-500 mr-2">{JSON.stringify(activity.old_value)}</span>
                                                                <span>➔</span>
                                                                <span className="ml-2 font-semibold text-green-600">{JSON.stringify(activity.new_value)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                            {task.activities?.length === 0 && (
                                                <div className="text-sm text-gray-400 ml-4">Belum ada riwayat aktivitas.</div>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
