import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Settings({ auth }: PageProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">System Settings</h2>}
        >
            <Head title="Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 space-y-8">
                            {/* Application Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Application Info</h3>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Application Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">Internal Management System</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Organization</dt>
                                        <dd className="mt-1 text-sm text-gray-900">Swiss-Belhotel SKA Pekanbaru</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Version</dt>
                                        <dd className="mt-1 text-sm text-gray-900">1.0.0</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Environment</dt>
                                        <dd className="mt-1 text-sm text-gray-900">Development</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Performance Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">EPI Configuration</h3>
                                <p className="text-sm text-gray-500 mb-4">Employee Performance Index formula weights. These values are used to calculate the overall EPI score.</p>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex justify-between border rounded p-3">
                                        <span className="text-sm font-medium text-gray-700">Completion Rate Weight</span>
                                        <span className="text-sm text-indigo-600 font-semibold">30%</span>
                                    </div>
                                    <div className="flex justify-between border rounded p-3">
                                        <span className="text-sm font-medium text-gray-700">On-Time Rate Weight</span>
                                        <span className="text-sm text-indigo-600 font-semibold">25%</span>
                                    </div>
                                    <div className="flex justify-between border rounded p-3">
                                        <span className="text-sm font-medium text-gray-700">Task Weight Score</span>
                                        <span className="text-sm text-indigo-600 font-semibold">15%</span>
                                    </div>
                                    <div className="flex justify-between border rounded p-3">
                                        <span className="text-sm font-medium text-gray-700">Supervisor Assessment</span>
                                        <span className="text-sm text-indigo-600 font-semibold">30%</span>
                                    </div>
                                </dl>
                            </div>

                            {/* Priority Weights */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Task Priority Weights</h3>
                                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="flex justify-between border rounded p-3">
                                        <span className="text-sm font-medium text-gray-700">Low</span>
                                        <span className="text-sm text-gray-600 font-semibold">1</span>
                                    </div>
                                    <div className="flex justify-between border rounded p-3">
                                        <span className="text-sm font-medium text-gray-700">Normal</span>
                                        <span className="text-sm text-blue-600 font-semibold">2</span>
                                    </div>
                                    <div className="flex justify-between border rounded p-3">
                                        <span className="text-sm font-medium text-gray-700">High</span>
                                        <span className="text-sm text-orange-600 font-semibold">3</span>
                                    </div>
                                    <div className="flex justify-between border rounded p-3">
                                        <span className="text-sm font-medium text-gray-700">Urgent</span>
                                        <span className="text-sm text-red-600 font-semibold">4</span>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
