import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Payslip({ payroll }: any) {
    const earnings = payroll.items.filter((i: any) => i.type === 'Earnings');
    const deductions = payroll.items.filter((i: any) => i.type === 'Deduction');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Payslip: {payroll.period?.name}</h2>
                    <button 
                        onClick={() => window.print()} 
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
                    >
                        Print Slip
                    </button>
                </div>
            }
        >
            <Head title="Payslip" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-8 print:shadow-none print:p-0">
                        
                        <div className="text-center mb-8 border-b pb-6">
                            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">Swiss-Belinn SKA Pekanbaru</h1>
                            <p className="text-gray-500 text-sm mt-1">Salary Slip - {payroll.period?.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Employee Name</p>
                                <p className="font-semibold text-gray-900">{payroll.employee?.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Employee ID</p>
                                <p className="font-semibold text-gray-900">{payroll.employee?.employee_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Department</p>
                                <p className="font-semibold text-gray-900">{payroll.employee?.department?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Position / Role</p>
                                <p className="font-semibold text-gray-900">{payroll.employee?.user?.roles?.[0]?.name || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Earnings */}
                            <div className="border rounded-lg p-6 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Earnings</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Base Salary</span>
                                        <span className="font-medium">Rp {Number(payroll.base_salary).toLocaleString('id-ID')}</span>
                                    </div>
                                    {earnings.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.name}</span>
                                            <span className="font-medium">Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-3 border-t border-gray-200 flex justify-between font-bold text-green-700">
                                    <span>Total Earnings</span>
                                    <span>Rp {(Number(payroll.base_salary) + Number(payroll.total_allowance)).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="border rounded-lg p-6 bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Deductions</h3>
                                <div className="space-y-3">
                                    {deductions.length === 0 ? (
                                        <div className="text-sm text-gray-500 italic">No deductions</div>
                                    ) : (
                                        deductions.map((item: any) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.name}</span>
                                                <span className="font-medium text-red-600">- Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="mt-6 pt-3 border-t border-gray-200 flex justify-between font-bold text-red-700">
                                    <span>Total Deductions</span>
                                    <span>Rp {Number(payroll.total_deduction).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Pay */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 flex justify-between items-center print:bg-white print:border-gray-300">
                            <div>
                                <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-1 print:text-gray-900">Net Salary (Take Home Pay)</h3>
                                <p className="text-xs text-indigo-700 print:text-gray-500">Total Earnings minus Total Deductions</p>
                            </div>
                            <div className="text-3xl font-bold text-indigo-700 print:text-gray-900">
                                Rp {Number(payroll.net_salary).toLocaleString('id-ID')}
                            </div>
                        </div>

                        <div className="mt-12 pt-8 grid grid-cols-2 gap-8 text-center text-sm">
                            <div>
                                <p className="mb-16">Prepared By (HR Dept)</p>
                                <p className="font-semibold border-b border-gray-400 inline-block px-8 pb-1">_________________________</p>
                            </div>
                            <div>
                                <p className="mb-16">Received By (Employee)</p>
                                <p className="font-semibold border-b border-gray-400 inline-block px-8 pb-1">{payroll.employee?.user?.name}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
