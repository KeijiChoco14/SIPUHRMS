import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function DirectoryIndex({ employees, departments, filters }: any) {
    const handleSearch = (e: any) => {
        router.get(route('directory.index'), { ...filters, search: e.target.value }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleDepartmentChange = (e: any) => {
        router.get(route('directory.index'), { ...filters, department_id: e.target.value }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Employee Directory</h2>}
        >
            <Head title="Employee Directory" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex-1 max-w-md relative">
                            <input 
                                type="text"
                                placeholder="Search by name, ID, email..."
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm pl-10"
                                defaultValue={filters.search}
                                onChange={(e) => {
                                    // simple debounce would be better here in real app
                                    handleSearch(e);
                                }}
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="w-full md:w-64">
                            <select 
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                defaultValue={filters.department_id || ''}
                                onChange={handleDepartmentChange}
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept: any) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {employees.map((employee: any) => (
                            <div key={employee.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                                <div className="px-6 pb-6 relative flex-grow flex flex-col items-center text-center">
                                    <div className="h-20 w-20 rounded-full bg-white p-1 absolute -top-10 shadow-sm border-2 border-white">
                                        <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {employee.photo ? (
                                                <img src={`/storage/${employee.photo}`} alt={employee.user?.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-500">
                                                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-12">
                                        <h3 className="text-lg font-bold text-gray-900">{employee.user?.name || `${employee.first_name} ${employee.last_name}`}</h3>
                                        <p className="text-sm font-medium text-indigo-600">{employee.user?.roles?.[0]?.name || 'Employee'}</p>
                                        <p className="text-xs text-gray-500 mt-1">{employee.department?.name || 'No Department'}</p>
                                    </div>
                                    
                                    <div className="mt-6 w-full space-y-3">
                                        <div className="flex items-center text-sm text-gray-600 justify-center">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <a href={`mailto:${employee.email}`} className="hover:text-indigo-600 truncate">{employee.email}</a>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600 justify-center">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <a href={`tel:${employee.phone_number}`} className="hover:text-indigo-600 truncate">{employee.phone_number || '-'}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {employees.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
