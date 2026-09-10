import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link, useForm } from '@inertiajs/react';

export default function PayrollIndex({ periods, selectedPeriodId, payrolls, flash }: any) {
    const [showGenerate, setShowGenerate] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const handlePeriodChange = (e: any) => {
        router.get(route('payroll.index'), { period_id: e.target.value });
    };

    const submitGenerate = (e: any) => {
        e.preventDefault();
        post(route('payroll.generate'), {
            onSuccess: () => setShowGenerate(false)
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Payroll Management</h2>}
        >
            <Head title="Payroll" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium text-gray-700">Payroll Period:</label>
                                <select 
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={selectedPeriodId || ''}
                                    onChange={handlePeriodChange}
                                >
                                    {periods.length === 0 && <option value="">No periods available</option>}
                                    {periods.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={() => setShowGenerate(!showGenerate)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium transition-colors"
                            >
                                Generate Payroll
                            </button>
                        </div>

                        {showGenerate && (
                            <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Payroll</h3>
                                <form onSubmit={submitGenerate} className="flex items-end space-x-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                        <select 
                                            value={data.month} 
                                            onChange={e => setData('month', parseInt(e.target.value))}
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-32"
                                        >
                                            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                        <input 
                                            type="number" 
                                            value={data.year} 
                                            onChange={e => setData('year', parseInt(e.target.value))}
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm w-32"
                                            min="2020" max="2099"
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm font-medium disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Run Calculation'}
                                    </button>
                                </form>
                                {errors.month && <p className="text-red-500 text-xs mt-2">{errors.month}</p>}
                                {errors.year && <p className="text-red-500 text-xs mt-2">{errors.year}</p>}
                            </div>
                        )}

                        {payrolls && payrolls.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payrolls.map((pr: any) => (
                                            <tr key={pr.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{pr.employee?.user?.name}</div>
                                                    <div className="text-sm text-gray-500">{pr.employee?.department?.name || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                                    Rp {Number(pr.base_salary).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                                                    + Rp {Number(pr.total_allowance).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                                                    - Rp {Number(pr.total_deduction).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                                    Rp {Number(pr.net_salary).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <Link href={route('payroll.show', pr.id)} className="text-indigo-600 hover:text-indigo-900">
                                                        View Slip
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                {selectedPeriodId ? 'No payroll generated for this period yet.' : 'Please select or generate a payroll period.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
