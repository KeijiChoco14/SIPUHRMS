import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function MyAttendance({ attendances, selectedMonth }: any) {
    const handleMonthChange = (e: any) => {
        router.get(route('attendance.my'), { month: e.target.value });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Attendance</h2>}
        >
            <Head title="My Attendance" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-100">
                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium text-gray-700">Month:</label>
                                <input 
                                    type="month"
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                />
                            </div>
                        </div>

                        {attendances && attendances.length > 0 ? (
                            <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {attendances.map((attendance: any) => (
                                            <tr key={attendance.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {new Date(attendance.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-700">
                                                    {attendance.clock_in ? attendance.clock_in.substring(0, 5) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-700">
                                                    {attendance.clock_out ? attendance.clock_out.substring(0, 5) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${attendance.status === 'Present' ? 'bg-green-100 text-green-800' : ''}
                                                        ${attendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                        ${attendance.status === 'Absent' ? 'bg-red-100 text-red-800' : ''}
                                                        ${attendance.status === 'Leave' ? 'bg-blue-100 text-blue-800' : ''}
                                                        ${attendance.status === 'Off' ? 'bg-gray-100 text-gray-800' : ''}
                                                    `}>
                                                        {attendance.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {attendance.late_duration_minutes > 0 ? (
                                                        <span className="text-red-600 font-medium text-xs border border-red-200 bg-red-50 px-2 py-1 rounded">Late: {attendance.late_duration_minutes}m</span>
                                                    ) : attendance.overtime_minutes > 0 ? (
                                                        <span className="text-green-600 font-medium text-xs border border-green-200 bg-green-50 px-2 py-1 rounded">OT: {attendance.overtime_minutes}m</span>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                No attendance records found for {selectedMonth}.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
