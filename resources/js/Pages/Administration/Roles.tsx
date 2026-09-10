import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Roles({ auth, roles }: PageProps<{ roles: any[] }>) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Roles & Permissions</h2>}
        >
            <Head title="Roles & Permissions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <p className="text-sm text-gray-500 mb-6">
                                Below are the system roles and the permissions assigned to each. Roles are managed by the system administrator.
                            </p>
                            <div className="space-y-6">
                                {roles.map((role: any) => (
                                    <div key={role.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                {role.permissions?.length || 0} permissions
                                            </span>
                                        </div>
                                        {role.permissions && role.permissions.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {role.permissions.map((perm: any) => (
                                                    <span key={perm.id} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
                                                        {perm.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">Full access (Super Admin) or no specific permissions configured.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
