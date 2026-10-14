import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';

interface TicketUpdate {
    id: number;
    user_id: number;
    user?: { name: string; email: string };
    status_from?: string;
    status_to?: string;
    message: string;
    created_at: string;
}

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    description: string;
    category: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'Open' | 'In Progress' | 'Pending Parts' | 'Resolved' | 'Closed';
    reported_by_employee_id: number;
    reporter?: {
        id: number;
        employee_number?: string;
        department?: { name: string };
        user?: { name: string; email: string };
    };
    assigned_to_user_id?: number;
    assigned_user?: { id: number; name: string; email: string };
    it_asset_id?: number;
    asset?: {
        id: number;
        asset_code: string;
        name: string;
        category: string;
        brand?: string;
        model?: string;
        specifications?: string;
        ip_address?: string;
        location?: string;
    };
    location?: string;
    resolved_at?: string;
    resolution_notes?: string;
    created_at: string;
    updates?: TicketUpdate[];
}

interface PageProps {
    ticket: Ticket;
    isItManager: boolean;
    itStaffUsers: { id: number; name: string; email: string }[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function TicketShow({ ticket, isItManager, itStaffUsers, flash }: PageProps) {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Reply Form
    const replyForm = useForm({
        message: '',
    });

    const submitReply = (e: React.FormEvent) => {
        e.preventDefault();
        replyForm.post(route('it.tickets.updates', ticket.id), {
            onSuccess: () => replyForm.reset(),
        });
    };

    // Status Update Form
    const statusForm = useForm({
        status: ticket.status,
        assigned_to_user_id: ticket.assigned_to_user_id ? String(ticket.assigned_to_user_id) : '',
        resolution_notes: ticket.resolution_notes || '',
        notes: '',
    });

    const submitStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.patch(route('it.tickets.status', ticket.id), {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                statusForm.reset('notes');
            },
        });
    };

    const confirmDeleteTicket = () => {
        router.delete(route('it.tickets.destroy', ticket.id));
    };

    // Styling helpers
    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
            case 'High':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Medium':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Low':
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Open':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'In Progress':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Pending Parts':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Resolved':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Closed':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('it.index', { tab: 'tickets' })}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center justify-center shadow-2xs transition-colors shrink-0"
                            title="Kembali ke Daftar Tiket"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-cyan-700 px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200">
                                    {ticket.ticket_number}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(ticket.priority)}`}>
                                    Prioritas {ticket.priority}
                                </span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mt-0.5">
                                {ticket.title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {isItManager && (
                            <button
                                onClick={() => setIsStatusModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 shadow-2xs transition-all hover:scale-102 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Ubah Status / Penugasan</span>
                            </button>
                        )}

                        {!isItManager && ticket.status === 'Resolved' && (
                            <button
                                onClick={() => {
                                    if (confirm('Konfirmasi bahwa kendala IT Anda telah terselesaikan dan tiket siap ditutup?')) {
                                        router.patch(route('it.tickets.status', ticket.id), {
                                            status: 'Closed',
                                            notes: 'Pelapor mengonfirmasi kendala telah teratasi dan menutup tiket.',
                                        });
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all hover:scale-102 cursor-pointer"
                            >
                                <span>✅</span>
                                <span>Tutup Tiket (Kendala Selesai)</span>
                            </button>
                        )}

                        {isItManager && (
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                                title="Hapus Tiket"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`${ticket.ticket_number} - ${ticket.title} - IT Helpdesk`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-2xs">
                        <span>✅</span>
                        <span>{flash.success}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT 2 COLS: Issue Details, Resolution & Timeline Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Issue Details Card */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs text-gray-500">
                                <span>Kategori: <strong className="text-gray-800">{ticket.category}</strong></span>
                                <span>
                                    Dilaporkan pada {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Rincian Masalah / Deskripsi Kendala
                                </h3>
                                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                                    {ticket.description}
                                </div>
                            </div>

                            {/* Resolution Notes (if resolved) */}
                            {ticket.resolution_notes && (
                                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                        <span>✅</span>
                                        <span>Catatan Penyelesaian Masalah:</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-emerald-950 whitespace-pre-wrap">
                                        {ticket.resolution_notes}
                                    </p>
                                    {ticket.resolved_at && (
                                        <p className="text-[11px] text-emerald-700 mt-1">
                                            Selesai pada: {new Date(ticket.resolved_at).toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Interactive Timeline & Discussion */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 sm:p-6 space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                        Riwayat & Diskusi Penanganan
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Jejak aktivitas, pergantian status, dan komunikasi tim
                                    </p>
                                </div>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {ticket.updates?.length || 0} Aktivitas
                                </span>
                            </div>

                            {/* Timeline stream */}
                            <div className="space-y-4">
                                {ticket.updates && ticket.updates.length > 0 ? (
                                    ticket.updates.map((upd, idx) => (
                                        <div key={upd.id} className="flex items-start gap-3 relative">
                                            {/* Vertical connector line */}
                                            {idx < (ticket.updates?.length || 0) - 1 && (
                                                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 -mb-4"></div>
                                            )}

                                            <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-2xs">
                                                {upd.user?.name ? upd.user.name.charAt(0) : 'U'}
                                            </div>

                                            <div className="flex-1 bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 text-xs sm:text-sm">
                                                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <strong className="text-gray-900 font-semibold">
                                                            {upd.user?.name || 'Sistem'}
                                                        </strong>
                                                        {upd.status_to && upd.status_from !== upd.status_to && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                                                                Status: {upd.status_to}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-gray-400">
                                                        {new Date(upd.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>

                                                <p className="text-gray-800 whitespace-pre-wrap mt-1">
                                                    {upd.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-gray-400 text-xs">
                                        Belum ada riwayat update.
                                    </div>
                                )}
                            </div>

                            {/* Reply Input Box */}
                            <form onSubmit={submitReply} className="pt-4 border-t border-gray-100 space-y-2">
                                <label className="block text-xs font-bold text-gray-700">
                                    Tulis Tanggapan / Update Perkembangan:
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Tulis pesan atau update status penanganan di sini..."
                                    value={replyForm.data.message}
                                    onChange={(e) => replyForm.setData('message', e.target.value)}
                                    className="w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    required
                                />
                                <div className="flex justify-end">
                                    <PrimaryButton disabled={replyForm.processing} className="bg-cyan-600 hover:bg-cyan-700 text-xs">
                                        {replyForm.processing ? 'Mengirim...' : 'Kirim Tanggapan'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT 1 COL: Meta Cards, Reporter Info, Asset Details */}
                    <div className="space-y-6">
                        {/* Reporter & Location Card */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 space-y-4">
                            <h3 className="font-bold text-gray-900 text-sm pb-2 border-b border-gray-100">
                                Informasi Pelapor
                            </h3>

                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                                    {(ticket.reporter?.user?.name || 'P').charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-gray-900 text-sm truncate">
                                        {ticket.reporter?.user?.name || (ticket.reporter ? `Emp #${ticket.reporter.employee_number}` : 'Karyawan Hotel')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {ticket.reporter?.department?.name || 'Department'}
                                    </div>
                                    {ticket.reporter?.user?.email && (
                                        <div className="text-[11px] text-gray-400 truncate">
                                            {ticket.reporter.user.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 space-y-2 text-xs">
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Lokasi Kendala:</span>
                                    <strong className="text-gray-900">{ticket.location || 'Area Hotel'}</strong>
                                </div>
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Teknisi Ditugaskan:</span>
                                    <strong className="text-cyan-800">
                                        {ticket.assigned_user ? ticket.assigned_user.name : 'Belum Ditugaskan'}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* Associated IT Asset Card (If linked) */}
                        {ticket.asset ? (
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-900 text-sm">
                                        Perangkat Terkait
                                    </h3>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                                        {ticket.asset.asset_code}
                                    </span>
                                </div>

                                <div>
                                    <div className="font-bold text-gray-900 text-sm">
                                        {ticket.asset.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {ticket.asset.brand || ''} {ticket.asset.model || ''} • {ticket.asset.category}
                                    </div>
                                </div>

                                {ticket.asset.specifications && (
                                    <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-mono">
                                        {ticket.asset.specifications}
                                    </div>
                                )}

                                {ticket.asset.ip_address && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">IP Address:</span>
                                        <span className="font-mono text-cyan-700 font-semibold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                                            {ticket.asset.ip_address}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 text-center text-xs text-gray-400">
                                <span className="text-2xl block mb-1">💻</span>
                                Tidak ada perangkat fisik yang ditautkan ke tiket ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL: UPDATE STATUS & ASSIGNMENT */}
            <Modal show={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} maxWidth="lg">
                <form onSubmit={submitStatusUpdate} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <div>
                            <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
                                {ticket.ticket_number}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900">
                                Perbarui Status & Teknisi
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsStatusModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm">
                        <div>
                            <InputLabel htmlFor="status_select" value="Status Tiket *" />
                            <select
                                id="status_select"
                                className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-cyan-500 focus:ring-cyan-500"
                                value={statusForm.data.status}
                                onChange={(e) => statusForm.setData('status', e.target.value as any)}
                                required
                            >
                                <option value="Open">Open - Tiket Baru</option>
                                <option value="In Progress">In Progress - Sedang Dikerjakan</option>
                                <option value="Pending Parts">Pending Parts - Menunggu Spare Part/Vendor</option>
                                <option value="Resolved">Resolved - Masalah Selesai Diperbaiki</option>
                                <option value="Closed">Closed - Tiket Ditutup</option>
                            </select>
                        </div>

                        {isItManager && (
                            <div>
                                <InputLabel htmlFor="technician_select" value="Tugaskan ke Teknisi IT" />
                                <select
                                    id="technician_select"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    value={statusForm.data.assigned_to_user_id}
                                    onChange={(e) => statusForm.setData('assigned_to_user_id', e.target.value)}
                                >
                                    <option value="">-- Belum Ditugaskan --</option>
                                    {itStaffUsers.map((st) => (
                                        <option key={st.id} value={st.id}>
                                            {st.name} ({st.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {['Resolved', 'Closed'].includes(statusForm.data.status) && (
                            <div>
                                <InputLabel htmlFor="res_notes" value="Catatan Solusi / Penyelesaian Masalah *" />
                                <textarea
                                    id="res_notes"
                                    rows={3}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-cyan-500 focus:ring-cyan-500"
                                    placeholder="Jelaskan tindakan teknis yang telah diambil untuk menyelesaikan kendala..."
                                    value={statusForm.data.resolution_notes}
                                    onChange={(e) => statusForm.setData('resolution_notes', e.target.value)}
                                    required={['Resolved', 'Closed'].includes(statusForm.data.status)}
                                />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="notes_input" value="Catatan Tambahan untuk Timeline (Opsional)" />
                            <TextInput
                                id="notes_input"
                                type="text"
                                className="mt-1 block w-full text-xs sm:text-sm"
                                placeholder="Contoh: Menunggu kabel pengganti dari vendor..."
                                value={statusForm.data.notes}
                                onChange={(e) => statusForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                        <SecondaryButton type="button" onClick={() => setIsStatusModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={statusForm.processing} className="bg-cyan-600 hover:bg-cyan-700">
                            {statusForm.processing ? 'Menyimpan...' : 'Simpan Status'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL: DELETE CONFIRMATION */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">
                        Hapus Tiket IT?
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus tiket <strong className="text-gray-800">{ticket.ticket_number}</strong> beserta seluruh riwayat percakapannya? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={confirmDeleteTicket}>
                            Ya, Hapus Tiket
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
