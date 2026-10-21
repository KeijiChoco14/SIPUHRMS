import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Badge from '@/Components/Badge';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useState, useMemo } from 'react';

interface Room {
    id: number;
    room_number: string;
    name: string;
    location?: string;
    capacity?: number;
    description?: string;
    key_code?: string;
    status: string;
}

interface BorrowRoomModalProps {
    show: boolean;
    onClose: () => void;
    room: Room | null;
}

const PRESET_DURATIONS = [
    { label: '1 Hour', hours: 1, sub: 'Quick session' },
    { label: '2 Hours', hours: 2, sub: 'Standard' },
    { label: '4 Hours', hours: 4, sub: 'Half day' },
    { label: '8 Hours', hours: 8, sub: 'Full shift' },
];

export default function BorrowRoomModal({ show, onClose, room }: BorrowRoomModalProps) {
    const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(2);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        room_id: 0,
        expected_duration_hours: 2,
        purpose: '',
    });

    useEffect(() => {
        if (room) {
            setData({
                room_id: room.id,
                expected_duration_hours: 2,
                purpose: '',
            });
            setSelectedPreset(2);
            clearErrors();
        } else {
            reset();
            setSelectedPreset(2);
        }
    }, [room, show]);

    const handleSelectPreset = (hours: number) => {
        setSelectedPreset(hours);
        setData('expected_duration_hours', hours);
    };

    const handleSelectCustom = () => {
        setSelectedPreset('custom');
    };

    // Calculate projected return time
    const projectedReturnTime = useMemo(() => {
        const hours = Number(data.expected_duration_hours);
        if (!hours || isNaN(hours) || hours <= 0) return null;

        const date = new Date(Date.now() + hours * 60 * 60 * 1000);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }, [data.expected_duration_hours]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('room-borrowing.borrow'), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    if (!room) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Borrow Room Key</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Confirm key borrowing, duration, and establish room custody.
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
                            <span className="font-mono text-xs font-bold text-[#E31B23] tracking-wide">{room.room_number}</span>
                            <h3 className="text-base font-semibold text-slate-900 mt-0.5">{room.name}</h3>
                        </div>
                        <Badge variant="success" dot size="sm">Available</Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                            <span className="font-medium text-slate-400 block">Location:</span>
                            <span className="font-semibold text-slate-800">{room.location || 'Hotel Area'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-slate-400 block">Capacity:</span>
                            <span className="font-semibold text-slate-800 tabular-nums">{room.capacity ? `${room.capacity} Pax` : 'Flexible'}</span>
                        </div>
                        {room.key_code && (
                            <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                                <span className="font-medium text-slate-500">Physical Key Tag:</span>
                                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    {room.key_code}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    {/* Expected Duration Selection */}
                    <div>
                        <div className="flex items-center justify-between">
                            <InputLabel htmlFor="duration_picker" value="Estimated Borrowing Duration *" />
                            <span className="text-[11px] font-semibold text-slate-400">
                                Max 72 Hours (3 Days)
                            </span>
                        </div>

                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {PRESET_DURATIONS.map((preset) => {
                                const isSelected = selectedPreset === preset.hours;
                                return (
                                    <button
                                        key={preset.hours}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset.hours)}
                                        className={`p-2.5 rounded-xl border text-left transition-all ${
                                            isSelected
                                                ? 'border-[#E31B23] bg-red-50/50 ring-2 ring-[#E31B23]/20'
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`text-xs font-bold ${isSelected ? 'text-[#E31B23]' : 'text-slate-800'}`}>
                                            {preset.label}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                            {preset.sub}
                                        </div>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={handleSelectCustom}
                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                    selectedPreset === 'custom'
                                        ? 'border-[#E31B23] bg-red-50/50 ring-2 ring-[#E31B23]/20'
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className={`text-xs font-bold ${selectedPreset === 'custom' ? 'text-[#E31B23]' : 'text-slate-800'}`}>
                                    Custom
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                    Specify hours
                                </div>
                            </button>
                        </div>

                        {selectedPreset === 'custom' && (
                            <div className="mt-3 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                                <label htmlFor="custom_hours" className="text-xs font-medium text-slate-700 whitespace-nowrap">
                                    Duration (Hours):
                                </label>
                                <input
                                    id="custom_hours"
                                    type="number"
                                    min={1}
                                    max={72}
                                    value={data.expected_duration_hours}
                                    onChange={(e) => setData('expected_duration_hours', parseInt(e.target.value) || 1)}
                                    className="w-24 rounded-lg border-slate-300 text-sm shadow-xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                                />
                                <span className="text-xs text-slate-500">hours</span>
                            </div>
                        )}

                        {/* Calculated Return Time Card */}
                        {projectedReturnTime && (
                            <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-emerald-900 font-medium">
                                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Expected Return By:</span>
                                </div>
                                <span className="font-bold text-emerald-800 tabular-nums">
                                    {projectedReturnTime} ({data.expected_duration_hours}h)
                                </span>
                            </div>
                        )}

                        <InputError message={errors.expected_duration_hours} className="mt-1.5" />
                    </div>

                    {/* Borrowing Purpose */}
                    <div>
                        <InputLabel htmlFor="borrow_purpose" value="Borrowing Purpose / Agenda (Optional)" />
                        <textarea
                            id="borrow_purpose"
                            rows={3}
                            value={data.purpose}
                            onChange={(e) => setData('purpose', e.target.value)}
                            placeholder="e.g., Weekly coordination meeting between Sales & Marketing with external vendor..."
                            className="mt-1 block w-full rounded-xl border-slate-300 text-sm shadow-xs placeholder:text-slate-400 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                            maxLength={500}
                        />
                        <InputError message={errors.purpose} className="mt-1.5" />
                        <InputError message={errors.room_id} className="mt-1.5" />
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
                        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="leading-relaxed">
                            <strong className="font-semibold block text-amber-900">Key Custody Commitment:</strong>
                            The physical key must be collected and maintained responsibly. After your session concludes, submit a return request in the system and return the physical key to the hotel Security post.
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <SecondaryButton type="button" onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing} className="bg-[#E31B23] hover:bg-[#C4141B]">
                        {processing ? 'Processing...' : 'Confirm Key Loan'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
