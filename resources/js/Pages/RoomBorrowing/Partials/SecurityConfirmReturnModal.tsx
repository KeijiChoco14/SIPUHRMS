import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import Badge from '@/Components/Badge';
import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface PendingTransaction {
    id: number;
    transaction_number: string;
    borrowed_at: string;
    return_requested_at?: string;
    purpose?: string;
    return_notes?: string;
    room: {
        id: number;
        room_number: string;
        name: string;
        location?: string;
        key_code?: string;
    };
    borrower?: {
        id: number;
        employee_number: string;
        user?: {
            id: number;
            name: string;
            email: string;
        };
        department?: {
            id: number;
            name: string;
        };
        position?: {
            id: number;
            name: string;
        };
    };
}

interface SecurityConfirmReturnModalProps {
    show: boolean;
    onClose: () => void;
    transaction: PendingTransaction | null;
}

export default function SecurityConfirmReturnModal({
    show,
    onClose,
    transaction,
}: SecurityConfirmReturnModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        confirm_physical_receipt: false,
        security_notes: '',
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

        post(route('room-borrowing.confirm-return', transaction.id), {
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
        hour: '2-digit',
        minute: '2-digit',
    });

    const formattedRequestDate = transaction.return_requested_at
        ? new Date(transaction.return_requested_at).toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '-';

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Confirm Physical Key Receipt</h2>
                            <p className="text-xs text-slate-500">
                                Physically verify that the room key has been handed over at the Security post.
                            </p>
                        </div>
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

                {/* Room and Borrower Information Card */}
                <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-mono text-xs font-bold text-[#E31B23]">
                                {transaction.room.room_number}
                            </span>
                            <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                                {transaction.room.name}
                            </h3>
                        </div>
                        <Badge variant="warning" dot size="sm">Pending Return</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200/60">
                        <div>
                            <span className="font-medium text-slate-400 block">Borrower:</span>
                            <span className="font-semibold text-slate-800 text-[13px]">
                                {transaction.borrower?.user?.name || 'Staff Member'}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                                {transaction.borrower?.department?.name} • {transaction.borrower?.employee_number}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-400 block">Physical Key Tag:</span>
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                                {transaction.room.key_code || '-'}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-400 block">Borrowed At:</span>
                            <span className="font-semibold text-slate-700 tabular-nums">{formattedBorrowDate}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-400 block">Return Requested At:</span>
                            <span className="font-semibold text-slate-700 tabular-nums">{formattedRequestDate}</span>
                        </div>
                        {transaction.purpose && (
                            <div className="col-span-2">
                                <span className="font-medium text-slate-400 block">Purpose:</span>
                                <span className="text-slate-700 italic">"{transaction.purpose}"</span>
                            </div>
                        )}
                        {transaction.return_notes && (
                            <div className="col-span-2 pt-1 border-t border-slate-200/50">
                                <span className="font-medium text-slate-400 block">Borrower Notes:</span>
                                <span className="text-slate-700">"{transaction.return_notes}"</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    {/* Security Notes Input */}
                    <div>
                        <InputLabel htmlFor="security_notes" value="Security Officer Notes (Optional)" />
                        <textarea
                            id="security_notes"
                            rows={2}
                            value={data.security_notes}
                            onChange={(e) => setData('security_notes', e.target.value)}
                            placeholder="e.g., Physical key and tag received in good condition, room checked and secured..."
                            className="mt-1 block w-full rounded-xl border-slate-300 text-sm shadow-xs placeholder:text-slate-400 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                            maxLength={500}
                        />
                        <InputError message={errors.security_notes} className="mt-1.5" />
                    </div>

                    {/* Mandatory Physical Receipt Checkbox */}
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <Checkbox
                                name="confirm_physical_receipt"
                                checked={data.confirm_physical_receipt}
                                onChange={(e) => setData('confirm_physical_receipt', e.target.checked)}
                                className="mt-0.5 h-4.5 w-4.5 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-400"
                            />
                            <div className="text-xs text-slate-700 leading-relaxed">
                                <strong className="font-semibold text-emerald-950 block text-[13px] mb-0.5">
                                    Physical Room Key Verification
                                </strong>
                                I confirm that the <strong>physical room key and tag have been received directly</strong> at the Security post in complete condition, and the room is ready to return to <strong>Available</strong> status.
                            </div>
                        </label>
                        <InputError message={errors.confirm_physical_receipt} className="mt-2 text-xs" />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <SecondaryButton type="button" onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton
                        type="submit"
                        disabled={processing || !data.confirm_physical_receipt}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Confirm Key Receipt'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
