import React, { useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';

interface EditProjectModalProps {
    show: boolean;
    onClose: () => void;
    project: any;
    departments: any[];
    employees: any[];
    projectStatuses?: any[];
}

const formatDate = (dateStr: any) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string') {
        return dateStr.split('T')[0];
    }
    return '';
};

export default function EditProjectModal({
    show,
    onClose,
    project,
    departments,
    employees,
    projectStatuses,
}: EditProjectModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'Planning',
        department_id: project?.department_id ? String(project.department_id) : '',
        owner_id: project?.owner_id ? String(project.owner_id) : '',
        start_date: formatDate(project?.start_date),
        deadline: formatDate(project?.deadline),
    });

    useEffect(() => {
        if (project) {
            setData({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'Planning',
                department_id: project.department_id ? String(project.department_id) : '',
                owner_id: project.owner_id ? String(project.owner_id) : '',
                start_date: formatDate(project.start_date),
                deadline: formatDate(project.deadline),
            });
        }
    }, [project]);

    if (!show || !project) return null;

    const availableStatuses = projectStatuses?.length
        ? projectStatuses.map((s) => (typeof s === 'string' ? s : s.value || s.name))
        : ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled', 'Archived'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('projects.update', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete project "${project.name}"? All tasks within it will also be deleted.`)) {
            router.delete(route('projects.destroy', project.id), {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                    aria-hidden="true" 
                    onClick={onClose}
                />
                
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold leading-6">Edit Project</h3>
                                <p className="text-xs text-indigo-100 mt-0.5">Update project information and settings</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-indigo-200 hover:text-white rounded-lg p-1 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Project Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Restaurant 2nd Floor Renovation"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Status & Department */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Project Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        required
                                    >
                                        {availableStatuses.map((st) => (
                                            <option key={st} value={st}>
                                                {st}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Department / Division
                                    </label>
                                    <select
                                        value={data.department_id}
                                        onChange={(e) => setData('department_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.department_id && <p className="text-red-500 text-xs mt-1">{errors.department_id}</p>}
                                </div>
                            </div>

                            {/* Project Owner / PIC */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Project Owner / PIC
                                </label>
                                <select
                                    value={data.owner_id}
                                    onChange={(e) => setData('owner_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">Select Owner / PIC</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.user?.name || emp.employee_number} {emp.department?.name ? `(${emp.department.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.owner_id && <p className="text-red-500 text-xs mt-1">{errors.owner_id}</p>}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Due Date (Deadline)
                                    </label>
                                    <input
                                        type="date"
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                    {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Project Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Project details and objectives..."
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="w-full sm:w-auto text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-2 rounded border border-red-200 hover:bg-red-50 transition-colors"
                            >
                                Delete Project
                            </button>

                            <div className="flex w-full sm:w-auto justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
