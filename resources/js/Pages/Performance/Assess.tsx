import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PerformanceAssess({ employee, period, assessment }: any) {
    const { data, setData, post, processing, errors } = useForm({
        work_quality: assessment?.work_quality || 3,
        accuracy: assessment?.accuracy || 3,
        responsibility: assessment?.responsibility || 3,
        communication: assessment?.communication || 3,
        notes: assessment?.notes || ''
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('performance.storeAssessment', [employee.id, period.id]));
    };

    const renderSlider = (name: string, label: string) => (
        <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <span className="text-2xl font-bold text-indigo-600">{(data as any)[name]}</span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="5" 
                step="1"
                value={(data as any)[name]}
                onChange={e => setData(name as any, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                <span>Poor (1)</span>
                <span>Fair (2)</span>
                <span>Good (3)</span>
                <span>Very Good (4)</span>
                <span>Excellent (5)</span>
            </div>
            {errors[name as keyof typeof errors] && <div className="text-red-500 text-xs mt-1">{errors[name as keyof typeof errors]}</div>}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Supervisor Assessment
                    </h2>
                    <Link href={route('performance.show', [employee.id, period.id])} className="text-sm text-indigo-600 hover:text-indigo-900">
                        &larr; Back to Detail
                    </Link>
                </div>
            }
        >
            <Head title="Supervisor Assessment" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{employee.user.name}</h3>
                                    <p className="text-sm text-gray-500">{employee.department?.name} &bull; {employee.position?.title}</p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                        Period: {period.name}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={submit}>
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-6">
                                    <h4 className="font-medium text-gray-800 mb-6 text-center">Rate Employee Performance (1 - 5)</h4>
                                    
                                    {renderSlider('work_quality', 'Work Quality')}
                                    {renderSlider('accuracy', 'Accuracy & Precision')}
                                    {renderSlider('responsibility', 'Responsibility & Ownership')}
                                    {renderSlider('communication', 'Communication & Teamwork')}
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Notes (Optional)</label>
                                    <textarea
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        rows={4}
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="Add any specific comments about the employee's performance in this period..."
                                    ></textarea>
                                    {errors.notes && <div className="text-red-500 text-xs mt-1">{errors.notes}</div>}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <Link href={route('performance.show', [employee.id, period.id])} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded shadow-sm">
                                        Cancel
                                    </Link>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded shadow-sm disabled:opacity-75"
                                    >
                                        Save Assessment & Calculate EPI
                                    </button>
                                </div>
                            </form>
                            
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
