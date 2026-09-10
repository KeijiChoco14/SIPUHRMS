import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function AuditLogs({ auth, logs, filters }: PageProps<{ logs: any, filters: any }>) {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('audit-logs.index'), { ...filters, search: e.target.value }, { preserveState: true, replace: true });
    };

    const handleActionFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('audit-logs.index'), { ...filters, action: e.target.value }, { preserveState: true, replace: true });
    };

    const actionColor = (action: string) => {
        switch (action) {
            case 'created': return 'bg-green-100 text-green-800';
            case 'updated': return 'bg-blue-100 text-blue-800';
            case 'deleted': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Audit Logs</h2>}
        >
            <Head title="Audit Logs" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap gap-4">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            defaultValue={filters.search}
                            onChange={handleSearch}
                            className="border-gray-300 rounded-md shadow-sm sm:text-sm w-72 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <select onChange={handleActionFilter} defaultValue={filters.action || ''} className="border-gray-300 rounded-md shadow-sm sm:text-sm">
                            <option value="">All Actions</option>
                            <option value="created">Created</option>
                            <option value="updated">Updated</option>
                            <option value="deleted">Deleted</option>
                        </select>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data.map((log: any) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.user?.name || 'System'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${actionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                                {log.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                {log.ip_address}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.data.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No audit logs found.</td></tr>
                                    )}
                                </tbody>
                            </table>

                            {logs.last_page > 1 && (
                                <div className="mt-4 flex justify-center gap-2">
                                    {logs.links.map((link: any, i: number) => (
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
