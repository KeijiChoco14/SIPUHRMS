import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function PerformanceIndex({ periods, selectedPeriodId, scores }: any) {
    const handlePeriodChange = (e: any) => {
        router.get(route('performance.index'), { period_id: e.target.value });
    };

    const handleCalculate = () => {
        router.post(route('performance.calculate'), { period_id: selectedPeriodId });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Employee Performance</h2>}
        >
            <Head title="Performance" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium text-gray-700">Select Period:</label>
                                <select 
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={selectedPeriodId}
                                    onChange={handlePeriodChange}
                                >
                                    {periods.map((period: any) => (
                                        <option key={period.id} value={period.id}>{period.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                onClick={handleCalculate}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Calculate EPI
                            </button>
                        </div>

                        {scores && scores.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Done</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Final EPI</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {scores.map((score: any) => (
                                            <tr key={score.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="text-sm font-medium text-gray-900">{score.employee?.user?.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {score.employee?.department?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {score.completed_tasks} / {score.assigned_tasks}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                    {score.on_time_rate}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-lg font-bold text-gray-700">{score.final_epi}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${score.category === 'Excellent' ? 'bg-green-100 text-green-800' : ''}
                                                        ${score.category === 'Very Good' ? 'bg-blue-100 text-blue-800' : ''}
                                                        ${score.category === 'Good' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                        ${score.category === 'Needs Improvement' ? 'bg-orange-100 text-orange-800' : ''}
                                                        ${score.category === 'Evaluation Required' ? 'bg-red-100 text-red-800' : ''}
                                                    `}>
                                                        {score.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('performance.show', [score.employee_id, score.performance_period_id])} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                        Detail
                                                    </Link>
                                                    <Link href={route('performance.assess', [score.employee_id, score.performance_period_id])} className="text-green-600 hover:text-green-900">
                                                        Assess
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No performance records found for this period. Click "Calculate EPI" to generate.
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
