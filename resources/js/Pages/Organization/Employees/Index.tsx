import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import Badge from '@/Components/Badge';

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

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Resigned': return 'danger';
            case 'On Leave': return 'warning';
            default: return 'neutral';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-slate-800 leading-tight">Employees</h2>
                    <Link 
                        href={route('employees.create')} 
                        className="inline-flex items-center px-4 py-2 bg-[#E31B23] hover:bg-[#c4141b] active:bg-[#a30f15] text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-colors shadow-xs"
                    >
                        + New Employee
                    </Link>
                </div>
            }
        >
            <Head title="Employees" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-72">
                            <input
                                type="text"
                                placeholder="Search by name, email, or ID..."
                                defaultValue={filters.search}
                                onChange={handleSearch}
                                className="w-full text-xs pl-8 pr-3 py-2 border-slate-300 rounded-xl shadow-xs focus:ring-1 focus:ring-[#E31B23] focus:border-[#E31B23] text-slate-900"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select 
                            onChange={handleDeptFilter} 
                            defaultValue={filters.department || ''} 
                            className="text-xs border-slate-300 rounded-xl shadow-xs py-2 px-3 focus:ring-1 focus:ring-[#E31B23] focus:border-[#E31B23] text-slate-900"
                        >
                            <option value="">All Departments</option>
                            {departments.map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <select 
                            onChange={handleStatusFilter} 
                            defaultValue={filters.status || ''} 
                            className="text-xs border-slate-300 rounded-xl shadow-xs py-2 px-3 focus:ring-1 focus:ring-[#E31B23] focus:border-[#E31B23] text-slate-900"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Resigned">Resigned</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                    </div>

                    <div className="bg-white overflow-hidden shadow-xs rounded-2xl border border-slate-200">
                        <div className="p-6 text-slate-900 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Employee</th>
                                        <th className="px-6 py-3.5 text-left font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                                        <th className="px-6 py-3.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3.5 text-left font-semibold text-slate-600 uppercase tracking-wider">Join Date</th>
                                        <th className="px-6 py-3.5 text-right font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {employees.data.map((emp: any) => (
                                        <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                                        <span className="text-[#E31B23] font-bold text-sm">
                                                            {emp.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3.5">
                                                        <div className="text-sm font-semibold text-slate-900">{emp.user?.name}</div>
                                                        <div className="text-xs text-slate-500">{emp.user?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs">{emp.employee_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{emp.department?.name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{emp.position?.name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getStatusVariant(emp.employment_status)} dot>
                                                    {emp.employment_status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 tabular-nums">
                                                {emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <Link href={route('employees.edit', emp.id)} className="text-[#E31B23] hover:text-[#c4141b] font-semibold transition-colors">Edit</Link>
                                                <button onClick={() => deleteEmployee(emp)} className="text-slate-400 hover:text-red-600 font-semibold transition-colors">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.data.length === 0 && (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">No employees found.</td></tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {employees.last_page > 1 && (
                                <div className="mt-6 flex justify-center gap-1.5 pt-4 border-t border-slate-100">
                                    {employees.links.map((link: any, i: number) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                                link.active 
                                                    ? 'bg-[#E31B23] text-white shadow-xs' 
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
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
