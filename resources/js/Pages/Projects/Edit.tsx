import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface EditProps extends PageProps {
    project: any;
    employees: any[];
    departments: any[];
    projectStatuses?: any[];
}

const formatDate = (dateStr: any) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string') {
        return dateStr.split('T')[0];
    }
    return '';
};

export default function Edit({
    auth,
    project,
    employees,
    departments,
    projectStatuses,
}: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'Planning',
        owner_id: project?.owner_id ? String(project.owner_id) : '',
        department_id: project?.department_id ? String(project.department_id) : '',
        start_date: formatDate(project?.start_date),
        deadline: formatDate(project?.deadline),
    });

    const availableStatuses = projectStatuses?.length
        ? projectStatuses.map((s) => (typeof s === 'string' ? s : s.value || s.name))
        : ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled', 'Archived'];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('projects.update', project.id));
    };

    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus project "${project.name}"? Semua task di dalamnya akan terhapus secara permanen.`)) {
            router.delete(route('projects.destroy', project.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-xl text-gray-800 leading-tight">Edit Project</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Ubah informasi project {project.name}</p>
                    </div>
                    <Link
                        href={route('projects.show', project.id)}
                        className="text-sm font-semibold text-gray-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        &larr; Kembali ke Project
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Project - ${project.name}`} />

            <div className="py-8">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100 p-6 sm:p-8">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Nama Project <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    placeholder="Nama project..."
                                    required
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Status Project <span className="text-red-500">*</span>
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
                                    {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Departemen / Divisi
                                    </label>
                                    <select
                                        value={data.department_id}
                                        onChange={(e) => setData('department_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    >
                                        <option value="">Pilih Departemen</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.department_id && <div className="text-red-500 text-xs mt-1">{errors.department_id}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Project Owner / PIC
                                </label>
                                <select
                                    value={data.owner_id}
                                    onChange={(e) => setData('owner_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">Pilih Penanggung Jawab</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.user?.name || emp.employee_number} {emp.department?.name ? `(${emp.department.name})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.owner_id && <div className="text-red-500 text-xs mt-1">{errors.owner_id}</div>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                    {errors.start_date && <div className="text-red-500 text-xs mt-1">{errors.start_date}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Tenggat Waktu (Deadline)
                                    </label>
                                    <input
                                        type="date"
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                    {errors.deadline && <div className="text-red-500 text-xs mt-1">{errors.deadline}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Deskripsi Project
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Deskripsi detail mengenai project..."
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                />
                                {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="text-sm text-red-600 hover:text-red-800 font-semibold px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Hapus Project
                                </button>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route('projects.show', project.id)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg text-sm shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
