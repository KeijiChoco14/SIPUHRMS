import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function PerformanceShow({ employee, period, score, assessment }: any) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Performance Report: {employee.user.name}
                    </h2>
                    <Link href={route('performance.index')} className="text-sm text-indigo-600 hover:text-indigo-900">
                        &larr; Back to List
                    </Link>
                </div>
            }
        >
            <Head title={`Performance - ${employee.user.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header Info */}
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{employee.user.name}</h3>
                            <p className="text-sm text-gray-500">{employee.department?.name} &bull; {period.name}</p>
                        </div>
                        {score && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Final EPI</p>
                                <div className="flex items-end space-x-2">
                                    <span className="text-4xl font-bold text-indigo-600">{score.final_epi}</span>
                                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full mb-1
                                        ${score.category === 'Excellent' ? 'bg-green-100 text-green-800' : ''}
                                        ${score.category === 'Very Good' ? 'bg-blue-100 text-blue-800' : ''}
                                        ${score.category === 'Good' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${score.category === 'Needs Improvement' ? 'bg-orange-100 text-orange-800' : ''}
                                        ${score.category === 'Evaluation Required' ? 'bg-red-100 text-red-800' : ''}
                                    `}>
                                        {score.category}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!score ? (
                        <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100 text-center py-10">
                            <p className="text-gray-500">No performance score calculated for this period yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Task Metrics */}
                            <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                                <h4 className="text-md font-semibold text-gray-800 mb-4 border-b pb-2">Task Metrics (70%)</h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">Completion Rate (30%)</span>
                                            <span className="font-bold">{score.completion_rate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${score.completion_rate}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{score.completed_tasks} of {score.assigned_tasks} tasks completed</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">On-Time Rate (25%)</span>
                                            <span className="font-bold">{score.on_time_rate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${score.on_time_rate}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{score.completed_on_time_tasks} of {score.completed_tasks} completed on time ({score.overdue_tasks} overdue)</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">Task Weight Score (15%)</span>
                                            <span className="font-bold">{score.task_weight_score}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${score.task_weight_score}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Average priority complexity</p>
                                    </div>
                                </div>
                            </div>

                            {/* Supervisor Assessment */}
                            <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h4 className="text-md font-semibold text-gray-800">Supervisor Assessment (30%)</h4>
                                    <Link href={route('performance.assess', [employee.id, period.id])} className="text-xs text-indigo-600 border border-indigo-600 px-2 py-1 rounded hover:bg-indigo-50">
                                        {assessment ? 'Edit Assessment' : 'Give Assessment'}
                                    </Link>
                                </div>
                                
                                {assessment ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-center">
                                                <p className="text-xs text-gray-500 uppercase">Work Quality</p>
                                                <p className="text-xl font-bold text-gray-800">{assessment.work_quality} <span className="text-sm text-gray-400">/ 5</span></p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-center">
                                                <p className="text-xs text-gray-500 uppercase">Accuracy</p>
                                                <p className="text-xl font-bold text-gray-800">{assessment.accuracy} <span className="text-sm text-gray-400">/ 5</span></p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-center">
                                                <p className="text-xs text-gray-500 uppercase">Responsibility</p>
                                                <p className="text-xl font-bold text-gray-800">{assessment.responsibility} <span className="text-sm text-gray-400">/ 5</span></p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-100 text-center">
                                                <p className="text-xs text-gray-500 uppercase">Communication</p>
                                                <p className="text-xl font-bold text-gray-800">{assessment.communication} <span className="text-sm text-gray-400">/ 5</span></p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">Total Supervisor Score</span>
                                                <span className="font-bold">{score.supervisor_score}%</span>
                                            </div>
                                        </div>

                                        {assessment.notes && (
                                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-gray-700 border border-yellow-100">
                                                <span className="font-bold block mb-1">Supervisor Notes:</span>
                                                {assessment.notes}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-400 text-right">Assessed by: {assessment.supervisor?.user?.name}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded border border-dashed border-gray-300">
                                        <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <p className="text-sm text-gray-500">No supervisor assessment provided yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
