import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function PerformanceShow({ employee, period, score, assessment, tasks = [] }: any) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Performance Report: {employee.user.name}
                    </h2>
                    <Link href={route('performance.index')} className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
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
                        <>
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
                                            <p className="text-xs text-gray-500 mt-1">{score.completed_tasks} of {score.assigned_tasks} tasks completed (hanya tugas yang dikonfirmasi)</p>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-700">On-Time Rate (25%)</span>
                                                <span className="font-bold">{score.on_time_rate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${score.on_time_rate}%` }}></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{score.completed_on_time_tasks} of {score.completed_tasks} completed on time ({score.overdue_tasks} overdue / belum dikonfirmasi)</p>
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
                                        <Link href={route('performance.assess', [employee.id, period.id])} className="text-xs text-indigo-600 border border-indigo-600 px-2 py-1 rounded hover:bg-indigo-50 font-medium">
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

                            {/* Evaluated Tasks List */}
                            <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-4 border-b pb-3">
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900">Daftar Tugas Periode Ini ({tasks.length})</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">Hanya tugas yang berstatus "Done" DAN telah dikonfirmasi penerimaannya yang dihitung sebagai tugas selesai.</p>
                                    </div>
                                </div>

                                {tasks.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4 text-center">Tidak ada tugas yang ditugaskan pada periode ini.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Judul Tugas</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Project</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Prioritas</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Status Tugas</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Konfirmasi (Acknowledge)</th>
                                                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Kredit Poin EPI</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {tasks.map((task: any) => {
                                                    const isAck = !!task.pivot?.acknowledged_at;
                                                    const isDone = (task.status?.value || task.status) === 'Done';
                                                    const getsCredit = isDone && isAck;

                                                    return (
                                                        <tr key={task.id} className="hover:bg-gray-50/50">
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {task.title}
                                                                {task.deadline && (
                                                                    <div className="text-xs text-gray-400 font-normal">
                                                                        Deadline: {new Date(task.deadline).toLocaleDateString('id-ID')}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">
                                                                {task.project?.name || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                                                    {task.priority?.value || task.priority}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                                    isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {task.status?.value || task.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {isAck ? (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        Dikonfirmasi
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                                        <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                        </svg>
                                                                        Belum Dikonfirmasi
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {getsCredit ? (
                                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                                        +1 Selesai
                                                                    </span>
                                                                ) : isDone && !isAck ? (
                                                                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded" title="Task selesai tapi Anda tidak pernah mengonfirmasi penerimaan tugas">
                                                                        Tidak Terhitung (Unacknowledged)
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">
                                                                        -
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
