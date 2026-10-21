import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface Room {
    id: number;
    room_number: string;
    name: string;
    location?: string;
    capacity?: number;
    description?: string;
    key_code?: string;
    is_active?: boolean;
}

interface RoomModalProps {
    show: boolean;
    onClose: () => void;
    room: Room | null;
}

export default function RoomModal({ show, onClose, room }: RoomModalProps) {
    const isEditing = !!room;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        room_number: '',
        name: '',
        location: '',
        capacity: '' as any,
        description: '',
        key_code: '',
        is_active: true,
    });

    useEffect(() => {
        if (room) {
            setData({
                room_number: room.room_number || '',
                name: room.name || '',
                location: room.location || '',
                capacity: room.capacity !== null && room.capacity !== undefined ? room.capacity : '',
                description: room.description || '',
                key_code: room.key_code || '',
                is_active: room.is_active ?? true,
            });
            clearErrors();
        } else {
            reset();
            clearErrors();
        }
    }, [room, show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && room) {
            put(route('room-borrowing.rooms.update', room.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('room-borrowing.rooms.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {isEditing ? 'Edit Room Details' : 'Add New Room'}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Manage hotel room identification, location, capacity, and physical key tag codes.
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

                <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="room_number" value="Room Code / Number *" />
                            <TextInput
                                id="room_number"
                                type="text"
                                value={data.room_number}
                                onChange={(e) => setData('room_number', e.target.value)}
                                placeholder="e.g., MTG-04 or BLR-02"
                                className="mt-1 block w-full font-mono uppercase"
                                required
                            />
                            <InputError message={errors.room_number} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel htmlFor="key_code" value="Physical Key Tag Code" />
                            <TextInput
                                id="key_code"
                                type="text"
                                value={data.key_code}
                                onChange={(e) => setData('key_code', e.target.value)}
                                placeholder="e.g., KEY-MR04"
                                className="mt-1 block w-full font-mono uppercase"
                            />
                            <InputError message={errors.key_code} className="mt-1.5" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="name" value="Room Name *" />
                        <TextInput
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Meeting Room SKA 4"
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name} className="mt-1.5" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="location" value="Room Location" />
                            <TextInput
                                id="location"
                                type="text"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                placeholder="e.g., 2nd Floor - East Wing"
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.location} className="mt-1.5" />
                        </div>

                        <div>
                            <InputLabel htmlFor="capacity" value="Capacity (Pax)" />
                            <TextInput
                                id="capacity"
                                type="number"
                                min="1"
                                value={data.capacity}
                                onChange={(e) => setData('capacity', e.target.value)}
                                placeholder="e.g., 20"
                                className="mt-1 block w-full tabular-nums"
                            />
                            <InputError message={errors.capacity} className="mt-1.5" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Room Description & Amenities" />
                        <textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Projector facilities, whiteboard, conference tables, surround sound..."
                            className="mt-1 block w-full rounded-xl border-slate-300 text-sm shadow-xs placeholder:text-slate-400 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                        />
                        <InputError message={errors.description} className="mt-1.5" />
                    </div>

                    {isEditing && (
                        <div className="pt-2">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox
                                    name="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded text-[#E31B23] focus:ring-[#E31B23]"
                                />
                                <span className="text-sm font-medium text-slate-700">
                                    Active Room (Visible and borrowable by staff)
                                </span>
                            </label>
                            <InputError message={errors.is_active} className="mt-1.5" />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                    <SecondaryButton type="button" onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing} className="bg-[#E31B23] hover:bg-[#C4141B]">
                        {processing ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Room')}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
