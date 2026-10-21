import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import Badge from '@/Components/Badge';

export default function OvertimeIndex({ overtimeRequests }: { overtimeRequests: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        date: '',
        start_time: '',
        end_time: '',
        reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('overtime.store'), {
            onSuccess: () => {
                closeModal();
            },
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            default: return 'warning';
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-bold text-xl text-slate-900 tracking-tight">Overtime Requests (SPKL)</h2>}>
            <Head title="Overtime Requests" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Overtime Request History</h3>
                                <p className="text-xs text-slate-500 mt-0.5">List of Overtime Work Order (SPKL) requests and supervisor verification status.</p>
                            </div>
                            <PrimaryButton onClick={() => setIsModalOpen(true)}>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Request Overtime
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200/80">
                                    <tr>
                                        <th className="px-6 py-3.5">Date</th>
                                        <th className="px-6 py-3.5">Overtime Hours</th>
                                        <th className="px-6 py-3.5">Reason / Task Description</th>
                                        <th className="px-6 py-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {overtimeRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No overtime requests found</p>
                                                <p className="text-xs text-slate-400 mt-1">Use the "Request Overtime" button above to submit a new request.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        overtimeRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50/75 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-900 tabular-nums">
                                                    {req.date}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 tabular-nums">
                                                    {req.start_time} - {req.end_time}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 max-w-md truncate">{req.reason}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant={getStatusVariant(req.status)} dot>
                                                        {req.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-5">Submit Overtime Request (SPKL)</h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="date" value="Overtime Date" />
                            <TextInput
                                id="date"
                                type="date"
                                className="mt-1.5 block w-full"
                                value={data.date}
                                onChange={e => setData('date', e.target.value)}
                                required
                            />
                            <InputError message={errors.date} className="mt-1.5" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="start_time" value="Start Time" />
                                <TextInput
                                    id="start_time"
                                    type="time"
                                    className="mt-1.5 block w-full"
                                    value={data.start_time}
                                    onChange={e => setData('start_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.start_time} className="mt-1.5" />
                            </div>
                            <div>
                                <InputLabel htmlFor="end_time" value="End Time" />
                                <TextInput
                                    id="end_time"
                                    type="time"
                                    className="mt-1.5 block w-full"
                                    value={data.end_time}
                                    onChange={e => setData('end_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.end_time} className="mt-1.5" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="reason" value="Reason / Task Description" />
                            <textarea
                                id="reason"
                                className="mt-1.5 block w-full rounded-xl border-slate-300 text-sm text-slate-900 shadow-xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] py-2.5 px-3"
                                rows={3}
                                placeholder="Describe the operational duties requiring overtime..."
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                required
                            ></textarea>
                            <InputError message={errors.reason} className="mt-1.5" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Saving...' : 'Submit Request'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
