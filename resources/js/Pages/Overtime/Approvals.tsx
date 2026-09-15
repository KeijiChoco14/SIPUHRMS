import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function OvertimeApprovals({ overtimeRequests }: { overtimeRequests: any[] }) {

    const updateStatus = (id: number, status: string) => {
        router.patch(route('overtime.status', id), { status }, {
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Overtime Approvals</h2>}>
            <Head title="Overtime Approvals" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">All Overtime Requests</h3>
                    <p className="text-sm text-gray-500 mt-1">Review and manage employee overtime requests.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {overtimeRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No overtime requests found.
                                    </td>
                                </tr>
                            ) : (
                                overtimeRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{req.employee?.user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{req.employee?.employee_id}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{req.date}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {req.start_time} - {req.end_time}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{req.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                            {req.approver && (
                                                <div className="text-[10px] text-gray-400 mt-1">by {req.approver.name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.status === 'Pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateStatus(req.id, 'Approved')}
                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded text-xs font-bold transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(req.id, 'Rejected')}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-bold transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
