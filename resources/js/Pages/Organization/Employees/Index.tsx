import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function EmployeesIndex({ auth, employees, departments, filters }: PageProps<{ employees: any, departments: any[], filters: any }>) {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('employees.index'), { ...filters, search: e.target.value }, { preserveState: true, replace: true });
    };

    const handleDeptFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('employees.index'), { ...filters, department: e.target.value }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('employees.index'), { ...filters, status: e.target.value }, { preserveState: true, replace: true });
    };

    const deleteEmployee = (emp: any) => {
        if (confirm(`Are you sure you want to delete ${emp.user?.name}?`)) {
            router.delete(route('employees.destroy', emp.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Employees</h2>
                    <Link href={route('employees.create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        + New Employee
                    </Link>
                </div>
            }
        >
            <Head title="Employees" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap gap-4">
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            defaultValue={filters.search}
                            onChange={handleSearch}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm w-72"
                        />
                        <select onChange={handleDeptFilter} defaultValue={filters.department || ''} className="border-gray-300 rounded-md shadow-sm sm:text-sm">
                            <option value="">All Departments</option>
                            {departments.map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <select onChange={handleStatusFilter} defaultValue={filters.status || ''} className="border-gray-300 rounded-md shadow-sm sm:text-sm">
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Resigned">Resigned</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {employees.data.map((emp: any) => (
                                        <tr key={emp.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <span className="text-indigo-600 font-semibold text-sm">
                                                            {emp.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{emp.user?.name}</div>
                                                        <div className="text-sm text-gray-500">{emp.user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.employee_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.department?.name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.position?.name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    emp.employment_status === 'Active' ? 'bg-green-100 text-green-800' :
                                                    emp.employment_status === 'Resigned' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {emp.employment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={route('employees.edit', emp.id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</Link>
                                                <button onClick={() => deleteEmployee(emp)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.data.length === 0 && (
                                        <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No employees found.</td></tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {employees.last_page > 1 && (
                                <div className="mt-4 flex justify-center gap-2">
                                    {employees.links.map((link: any, i: number) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
