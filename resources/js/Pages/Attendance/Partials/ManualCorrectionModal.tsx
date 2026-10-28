import React, { useEffect } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

interface ManualCorrectionModalProps {
    show: boolean;
    onClose: () => void;
    record: any | null;
}

export default function ManualCorrectionModal({
    show,
    onClose,
    record,
}: ManualCorrectionModalProps) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        clock_in: '',
        clock_out: '',
        status: 'Present',
        late_duration_minutes: 0,
        overtime_minutes: 0,
        correction_reason: '',
    });

    useEffect(() => {
        if (record) {
            setData({
                clock_in: record.clock_in ? record.clock_in.substring(0, 5) : '',
                clock_out: record.clock_out ? record.clock_out.substring(0, 5) : '',
                status: record.status || 'Present',
                late_duration_minutes: record.late_duration_minutes || 0,
                overtime_minutes: record.overtime_minutes || 0,
                correction_reason: '',
            });
        }
    }, [record]);

    if (!record) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('attendance.correct', record.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">Manual Attendance Correction</h3>
                            <p className="text-xs text-slate-500">
                                {record.employee?.user?.name} &bull; {record.date}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-3 mb-4 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-800 leading-relaxed">
                    <strong>Audit Notice:</strong> Manual corrections are audited permanently with your username, timestamp, and IP address. Please provide a clear, legitimate reason.
                </div>

                <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="corr_clock_in" value="Clock-In Time (HH:mm)" />
                            <TextInput
                                id="corr_clock_in"
                                type="time"
                                value={data.clock_in}
                                onChange={(e) => setData('clock_in', e.target.value)}
                                className="mt-1 block w-full text-xs"
                            />
                            <InputError message={errors.clock_in} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="corr_clock_out" value="Clock-Out Time (HH:mm)" />
                            <TextInput
                                id="corr_clock_out"
                                type="time"
                                value={data.clock_out}
                                onChange={(e) => setData('clock_out', e.target.value)}
                                className="mt-1 block w-full text-xs"
                            />
                            <InputError message={errors.clock_out} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <InputLabel htmlFor="corr_status" value="Attendance Status" />
                            <select
                                id="corr_status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-slate-300 text-xs shadow-xs focus:border-[#E31B23] focus:ring-[#E31B23]"
                            >
                                <option value="Present">Present</option>
                                <option value="Late">Late</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Incomplete">Incomplete</option>
                                <option value="Absent">Absent</option>
                            </select>
                            <InputError message={errors.status} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="corr_late" value="Late Duration (Minutes)" />
                            <TextInput
                                id="corr_late"
                                type="number"
                                min={0}
                                value={data.late_duration_minutes}
                                onChange={(e) => setData('late_duration_minutes', parseInt(e.target.value) || 0)}
                                className="mt-1 block w-full text-xs"
                            />
                            <InputError message={errors.late_duration_minutes} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="corr_reason" value="Mandatory Correction Reason *" />
                        <textarea
                            id="corr_reason"
                            rows={3}
                            required
                            placeholder="e.g. Employee biometric fingerprint machine offline on morning shift. Verified by Duty Manager."
                            value={data.correction_reason}
                            onChange={(e) => setData('correction_reason', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-slate-300 text-xs shadow-xs focus:border-[#E31B23] focus:ring-[#E31B23]"
                        />
                        <InputError message={errors.correction_reason} className="mt-1" />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton disabled={processing || !data.correction_reason.trim()}>
                        {processing ? 'Saving...' : 'Apply Correction & Audit'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
