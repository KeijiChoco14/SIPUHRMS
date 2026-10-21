import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface Transaction {
    id: number;
    transaction_number: string;
    borrowed_at: string;
    purpose?: string;
    room: {
        id: number;
        room_number: string;
        name: string;
        location?: string;
        key_code?: string;
    };
}

interface ReturnRequestModalProps {
    show: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export default function ReturnRequestModal({ show, onClose, transaction }: ReturnRequestModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        return_notes: '',
    });

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
        }
    }, [show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!transaction) return;

        post(route('room-borrowing.return-request', transaction.id), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    if (!transaction) return null;

    const formattedBorrowDate = new Date(transaction.borrowed_at).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Request Key Return</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Report key return in the system before handing over the physical key to the Security post.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-mono text-xs font-bold text-[#E31B23] tracking-wide">
                                {transaction.room.room_number}
                            </span>
                            <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                                {transaction.room.name}
                            </h3>
                        </div>
                        <span className="font-mono text-xs text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs tabular-nums">
                            {transaction.transaction_number}
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                        <div>
                            <span className="font-medium text-slate-400 block">Borrowed At:</span>
                            <span className="font-semibold text-slate-800 tabular-nums">{formattedBorrowDate}</span>
                        </div>
                        {transaction.room.key_code && (
                            <div>
                                <span className="font-medium text-slate-400 block">Key Tag:</span>
                                <span className="font-mono font-bold text-slate-800">{transaction.room.key_code}</span>
                            </div>
                        )}
                        {transaction.purpose && (
                            <div className="col-span-2 pt-1">
                                <span className="font-medium text-slate-400 block">Purpose:</span>
                                <span className="text-slate-700 italic">"{transaction.purpose}"</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    <div>
                        <InputLabel htmlFor="return_notes" value="Additional Return Notes (Optional)" />
                        <textarea
                            id="return_notes"
                            rows={3}
                            value={data.return_notes}
                            onChange={(e) => setData('return_notes', e.target.value)}
                            placeholder="e.g., AC and projector turned off, windows and doors securely locked..."
                            className="mt-1 block w-full rounded-xl border-slate-300 text-sm shadow-xs placeholder:text-slate-400 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                            maxLength={500}
                        />
                        <InputError message={errors.return_notes} className="mt-1.5" />
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                        <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="leading-relaxed">
                            <strong className="font-semibold block text-amber-950">Next Physical Step:</strong>
                            After submitting this return request, the room status changes to <strong>Awaiting Security Confirmation</strong>. You must hand over the physical key directly to the officer at the Security post for final verification.
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <SecondaryButton type="button" onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing} className="bg-[#E31B23] hover:bg-[#C4141B]">
                        {processing ? 'Submitting...' : 'Submit Return Request'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
