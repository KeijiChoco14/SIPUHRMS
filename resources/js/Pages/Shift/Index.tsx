import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

export default function ShiftIndex({ shifts }: { shifts: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        start_time: '',
        end_time: '',
        color: '#4f46e5',
    });

    const openModal = (shift: any = null) => {
        if (shift) {
            setEditingShift(shift);
            setData({
                name: shift.name,
                start_time: shift.start_time,
                end_time: shift.end_time,
                color: shift.color,
            });
        } else {
            setEditingShift(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => reset(), 200);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingShift) {
            put(route('shifts.update', editingShift.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('shifts.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this shift?')) {
            destroy(route('shifts.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Shift Types</h2>}>
            <Head title="Shifts" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Work Shifts</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage shift types to assign to your employees.</p>
                    </div>
                    <PrimaryButton onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700">
                        + New Shift
                    </PrimaryButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Color</th>
                                <th className="px-6 py-4">Shift Name</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {shifts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No shift types created yet.
                                    </td>
                                </tr>
                            ) : (
                                shifts.map((shift) => (
                                    <tr key={shift.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: shift.color }}></div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">{shift.name}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {shift.start_time} - {shift.end_time}
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => openModal(shift)} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(shift.id)} className="text-red-600 hover:text-red-900 font-medium text-xs bg-red-50 px-3 py-1.5 rounded">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="sm">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">{editingShift ? 'Edit Shift' : 'Create New Shift'}</h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Shift Name (e.g. Morning)" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="start_time" value="Start Time" />
                                <TextInput
                                    id="start_time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.start_time}
                                    onChange={e => setData('start_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.start_time} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="end_time" value="End Time" />
                                <TextInput
                                    id="end_time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.end_time}
                                    onChange={e => setData('end_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.end_time} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="color" value="Color Tag" />
                            <input
                                id="color"
                                type="color"
                                className="mt-1 block w-full h-10 p-1 border-gray-300 rounded-md cursor-pointer"
                                value={data.color}
                                onChange={e => setData('color', e.target.value)}
                            />
                            <InputError message={errors.color} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                            Save Shift
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
