import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function MyPayslips({ payrolls }: any) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Payslips</h2>}
        >
            <Head title="My Payslips" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {payrolls && payrolls.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {payrolls.map((pr: any) => (
                                    <div key={pr.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
                                        <div className="p-5 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                                            <h3 className="font-bold text-gray-900">{pr.period?.name}</h3>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block
                                                ${pr.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                            `}>
                                                {pr.status}
                                            </span>
                                        </div>
                                        <div className="p-5 flex-grow">
                                            <div className="flex justify-between mb-2 text-sm">
                                                <span className="text-gray-500">Take Home Pay</span>
                                                <span className="font-bold text-gray-900">Rp {Number(pr.net_salary).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-100 text-center">
                                            <Link 
                                                href={route('payroll.show', pr.id)} 
                                                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                                            >
                                                View Details &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                You don't have any payslips available yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
