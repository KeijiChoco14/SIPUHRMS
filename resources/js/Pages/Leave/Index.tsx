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

export default function LeaveIndex({ leaveRequests }: { leaveRequests: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'Annual',
        start_date: '',
        end_date: '',
        reason: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('leave.store'), {
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
        <AuthenticatedLayout header={<h2 className="font-bold text-xl text-slate-900 tracking-tight">Pengajuan Cuti Karyawan</h2>}>
            <Head title="Cuti Karyawan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">Riwayat Pengajuan Cuti</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Daftar riwayat permohonan cuti dan status persetujuan HOD / HRD.</p>
                            </div>
                            <PrimaryButton onClick={() => setIsModalOpen(true)}>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Ajukan Cuti
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/80 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200/80">
                                    <tr>
                                        <th className="px-6 py-3.5">Jenis Cuti</th>
                                        <th className="px-6 py-3.5">Durasi</th>
                                        <th className="px-6 py-3.5">Alasan</th>
                                        <th className="px-6 py-3.5 text-center">Status</th>
                                        <th className="px-6 py-3.5 text-right">Tanggal Pengajuan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {leaveRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">Belum ada permohonan cuti</p>
                                                <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Ajukan Cuti" di atas untuk membuat permohonan baru.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        leaveRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50/75 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-900">{req.type}</td>
                                                <td className="px-6 py-4 text-slate-600 tabular-nums">
                                                    {req.start_date} s/d {req.end_date}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{req.reason}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant={getStatusVariant(req.status)} dot>
                                                        {req.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs text-right tabular-nums">
                                                    {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                    <h2 className="text-lg font-bold text-slate-900 mb-5">Ajukan Permohonan Cuti</h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="type" value="Jenis Cuti" />
                            <select
                                id="type"
                                className="mt-1.5 block w-full rounded-xl border-slate-300 text-sm text-slate-900 shadow-xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] py-2.5 px-3"
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                            >
                                <option value="Annual">Annual Leave (Cuti Tahunan)</option>
                                <option value="Sick">Sick Leave (Cuti Sakit)</option>
                                <option value="Unpaid">Unpaid Leave (Cuti Tanpa Gaji)</option>
                                <option value="Maternity">Maternity Leave (Cuti Melahirkan)</option>
                                <option value="Other">Other (Lainnya)</option>
                            </select>
                            <InputError message={errors.type} className="mt-1.5" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="start_date" value="Tanggal Mulai" />
                                <TextInput
                                    id="start_date"
                                    type="date"
                                    className="mt-1.5 block w-full"
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.start_date} className="mt-1.5" />
                            </div>
                            <div>
                                <InputLabel htmlFor="end_date" value="Tanggal Selesai" />
                                <TextInput
                                    id="end_date"
                                    type="date"
                                    className="mt-1.5 block w-full"
                                    value={data.end_date}
                                    onChange={e => setData('end_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.end_date} className="mt-1.5" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="reason" value="Alasan Cuti" />
                            <textarea
                                id="reason"
                                className="mt-1.5 block w-full rounded-xl border-slate-300 text-sm text-slate-900 shadow-xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] py-2.5 px-3"
                                rows={3}
                                placeholder="Jelaskan keperluan cuti..."
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
                            {processing ? 'Menyimpan...' : 'Kirim Permohonan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
