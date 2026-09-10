import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function EmployeeForm({ auth, employee, currentRole, departments, positions, roles, supervisors }: PageProps<{
    employee?: any,
    currentRole?: string,
    departments: any[],
    positions: any[],
    roles: string[],
    supervisors: { id: number, name: string }[],
}>) {
    const isEditing = !!employee;

    const { data, setData, post, put, processing, errors } = useForm({
        name: employee?.user?.name || '',
        email: employee?.user?.email || '',
        password: '',
        employee_number: employee?.employee_number || '',
        phone_number: employee?.phone_number || '',
        department_id: employee?.department_id?.toString() || '',
        position_id: employee?.position_id?.toString() || '',
        supervisor_id: employee?.supervisor_id?.toString() || '',
        join_date: employee?.join_date || '',
        employment_status: employee?.employment_status || 'Active',
        role: currentRole || 'Staff / Employee',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('employees.update', employee.id));
        } else {
            post(route('employees.store'));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('employees.index')} className="text-indigo-600 hover:text-indigo-800">
                        ← Back
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {isEditing ? `Edit: ${employee.user?.name}` : 'New Employee'}
                    </h2>
                </div>
            }
        >
            <Head title={isEditing ? `Edit ${employee.user?.name}` : 'New Employee'} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Account Info */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Account Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Password {isEditing ? '(leave blank to keep current)' : <span className="text-red-500">*</span>}
                                        </label>
                                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" required={!isEditing} />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                                        <select value={data.role} onChange={e => setData('role', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" required>
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Employee Info */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Employee Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Employee Number <span className="text-red-500">*</span></label>
                                        <input type="text" value={data.employee_number} onChange={e => setData('employee_number', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                                        {errors.employee_number && <p className="text-red-500 text-xs mt-1">{errors.employee_number}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Department</label>
                                        <select value={data.department_id} onChange={e => setData('department_id', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                            <option value="">-- Select Department --</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Position</label>
                                        <select value={data.position_id} onChange={e => setData('position_id', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                            <option value="">-- Select Position --</option>
                                            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Supervisor</label>
                                        <select value={data.supervisor_id} onChange={e => setData('supervisor_id', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                            <option value="">-- No Supervisor --</option>
                                            {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Join Date</label>
                                        <input type="date" value={data.join_date} onChange={e => setData('join_date', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Employment Status <span className="text-red-500">*</span></label>
                                        <select value={data.employment_status} onChange={e => setData('employment_status', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500" required>
                                            <option value="Active">Active</option>
                                            <option value="Resigned">Resigned</option>
                                            <option value="On Leave">On Leave</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 border-t pt-4">
                                <Link href={route('employees.index')} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                                    {processing ? 'Saving...' : (isEditing ? 'Update Employee' : 'Create Employee')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
