import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
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
        color: '#E31B23',
    });

    const openModal = (shift: any = null) => {
        if (shift) {
            setEditingShift(shift);
            setData({
                name: shift.name,
                start_time: shift.start_time,
                end_time: shift.end_time,
                color: shift.color || '#E31B23',
            });
        } else {
            setEditingShift(null);
            reset();
            setData('color', '#E31B23');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingShift(null);
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
        <AuthenticatedLayout header={<h2 className="font-bold text-xl text-slate-900 tracking-tight">Work Shift Settings</h2>}>
            <Head title="Work Shifts" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Employee Shift List</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Manage shift types, hotel operational working hours, and roster color codes.</p>
                            </div>
                            <PrimaryButton onClick={() => openModal()}>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Shift
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200/80">
                                    <tr>
                                        <th className="px-6 py-3.5">Color</th>
                                        <th className="px-6 py-3.5">Shift Name</th>
                                        <th className="px-6 py-3.5">Operating Hours</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {shifts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">No work shifts found</p>
                                                <p className="text-xs text-slate-400 mt-1">Use the "Add Shift" button above to create a new shift.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        shifts.map((shift) => (
                                            <tr key={shift.id} className="hover:bg-slate-50/75 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="w-5 h-5 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: shift.color }}></div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">{shift.name}</td>
                                                <td className="px-6 py-4 text-slate-600 tabular-nums">
                                                    {shift.start_time} - {shift.end_time}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button 
                                                            onClick={() => openModal(shift)} 
                                                            className="text-slate-700 hover:text-slate-900 font-medium text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(shift.id)} 
                                                            className="text-rose-600 hover:text-rose-700 font-medium text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
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

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="sm">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-5">{editingShift ? 'Edit Work Shift' : 'Add New Shift'}</h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Shift Name (e.g., Morning Shift)" />
                            <TextInput
                                id="name"
                                className="mt-1.5 block w-full"
                                placeholder="Morning Shift..."
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-1.5" />
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
                            <InputLabel htmlFor="color" value="Shift Color Tag" />
                            <div className="flex items-center gap-3 mt-1.5">
                                <input
                                    id="color"
                                    type="color"
                                    className="h-10 w-16 p-1 border border-slate-300 rounded-xl cursor-pointer shadow-xs"
                                    value={data.color}
                                    onChange={e => setData('color', e.target.value)}
                                />
                                <span className="text-xs text-slate-500 font-mono">{data.color}</span>
                            </div>
                            <InputError message={errors.color} className="mt-1.5" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Saving...' : 'Save Shift'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
