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
        <AuthenticatedLayout header={<h2 className="font-bold text-xl text-slate-900 tracking-tight">Pengajuan Lembur (SPKL)</h2>}>
            <Head title="Pengajuan Lembur" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Riwayat Pengajuan Lembur</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Daftar permohonan Surat Perintah Kerja Lembur (SPKL) dan status verifikasi.</p>
                            </div>
                            <PrimaryButton onClick={() => setIsModalOpen(true)}>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Ajukan Lembur
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200/80">
                                    <tr>
                                        <th className="px-6 py-3.5">Tanggal</th>
                                        <th className="px-6 py-3.5">Jam Lembur</th>
                                        <th className="px-6 py-3.5">Alasan / Uraian Tugas</th>
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
                                                <p className="text-sm font-medium text-slate-700">Belum ada pengajuan lemur</p>
                                                <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Ajukan Lembur" di atas untuk membuat pengajuan baru.</p>
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
                    <h2 className="text-lg font-bold text-slate-900 mb-5">Ajukan Surat Perintah Kerja Lembur (SPKL)</h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="date" value="Tanggal Lembur" />
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
                                <InputLabel htmlFor="start_time" value="Jam Mulai" />
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
                                <InputLabel htmlFor="end_time" value="Jam Selesai" />
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
                            <InputLabel htmlFor="reason" value="Alasan / Uraian Tugas Lembur" />
                            <textarea
                                id="reason"
                                className="mt-1.5 block w-full rounded-xl border-slate-300 text-sm text-slate-900 shadow-xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] py-2.5 px-3"
                                rows={3}
                                placeholder="Jelaskan pekerjaan operasional yang membutuhkan lembur..."
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                required
                            ></textarea>
                            <InputError message={errors.reason} className="mt-1.5" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Kirim Pengajuan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
