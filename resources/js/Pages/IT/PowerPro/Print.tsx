import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface Props {
    requestData: {
        id: number;
        request_number: string;
        request_type: 'create_new' | 'modify_access' | 'reset_password' | 'deactivate';
        request_type_label: string;
        employment_status?: string;
        system_type: string;
        power_pro_modules: string[];
        access_level: string;
        special_privileges?: string[];
        proposed_username?: string;
        reason?: string;
        status: 'On Request' | 'Approved' | 'Done' | 'Rejected';
        created_user_id?: string;
        it_notes?: string;
        requested_by_username?: string;
        requested_at?: string;
        requester_signature?: string;
        approved_by_username?: string;
        approved_at?: string;
        approver_signature?: string;
        approval_notes?: string;
        processed_by_username?: string;
        processed_at?: string;
        it_signature?: string;
        created_at: string;
        employee?: {
            employee_number: string;
            phone_number?: string;
            user?: {
                name: string;
                email: string;
            };
            department?: {
                name: string;
            };
            position?: {
                name: string;
            };
        };
        department?: {
            name: string;
        };
    };
    hodIT?: {
        user?: {
            name: string;
        };
        position?: {
            name: string;
        };
    } | null;
    gmUser?: {
        name: string;
    } | null;
}

export default function PowerProPrint({ requestData, hodIT, gmUser }: Props) {
    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 print:p-0 print:bg-white text-gray-900 font-sans">
            <Head title={`Power Pro Form - ${requestData.request_number}`} />

            {/* Print Controls (Hidden when printing) */}
            <div className="max-w-4xl mx-auto mb-6 print:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('power-pro.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Daftar
                    </Link>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                        Format Standar SOP IT Swiss-Belinn SKA Pekanbaru
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Cetak Formulir
                    </button>
                </div>
            </div>

            {/* Official Document Paper */}
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-lg print:shadow-none print:p-0 print:max-w-none border border-gray-200 print:border-none">
                {/* Official Letterhead */}
                <div className="border-b-2 border-gray-900 pb-4 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl border border-gray-200 overflow-hidden bg-white p-1 shrink-0 flex items-center justify-center">
                                <ApplicationLogo className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                                    Swiss-Belinn SKA Pekanbaru
                                </h1>
                                <p className="text-[11px] text-gray-600 font-medium">
                                    Komplek Mall SKA, Jl. Soekarno-Hatta, Pekanbaru 28294, Riau - Indonesia
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    Telp: +6276161888 • Email: pekanbaru-sbi@swiss-belhotel.com • www.swiss-belhotel.com
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-300 font-mono">
                                SOP-IT-ACC-004
                            </span>
                            <div className="mt-1 font-mono text-xs font-bold text-gray-800">
                                No: {requestData.request_number}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                                Status: <span className="font-bold text-gray-800">{requestData.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 text-center">
                        <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-gray-900 border-y border-gray-300 py-1.5 inline-block px-8">
                            Formulir Permohonan Pembuatan / Perubahan User ID Sistem Power Pro
                        </h2>
                        <p className="text-[11px] text-gray-500 mt-1 italic">
                            (Property Management System & Point of Sales Access Authorization Form)
                        </p>
                    </div>
                </div>

                {/* Section A: Data Karyawan */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white bg-gray-900 px-3 py-1 mb-2 rounded-xs">
                        A. Data Karyawan / Pemohon (Employee Information)
                    </h3>
                    <table className="w-full text-xs border border-gray-300">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-3 bg-gray-50 font-semibold w-1/4 text-gray-600">Nama Lengkap:</td>
                                <td className="py-2 px-3 font-bold text-gray-900 w-1/4">{requestData.employee?.user?.name || '-'}</td>
                                <td className="py-2 px-3 bg-gray-50 font-semibold w-1/4 text-gray-600">NIK / Employee ID:</td>
                                <td className="py-2 px-3 font-mono font-bold text-gray-900 w-1/4">{requestData.employee?.employee_number || '-'}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Departemen:</td>
                                <td className="py-2 px-3 text-gray-800">{requestData.department?.name || requestData.employee?.department?.name || '-'}</td>
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Jabatan / Posisi:</td>
                                <td className="py-2 px-3 text-gray-800">{requestData.employee?.position?.name || '-'}</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Status Kepegawaian:</td>
                                <td className="py-2 px-3 text-gray-800">{requestData.employment_status || 'Permanent'}</td>
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Tanggal Pengajuan:</td>
                                <td className="py-2 px-3 text-gray-800">{formatDate(requestData.requested_at || requestData.created_at)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section B: Detail Akses Sistem */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white bg-gray-900 px-3 py-1 mb-2 rounded-xs">
                        B. Detail Permohonan Akses Sistem (Access Specification)
                    </h3>
                    <table className="w-full text-xs border border-gray-300">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-3 bg-gray-50 font-semibold w-1/4 text-gray-600">Jenis Permohonan:</td>
                                <td className="py-2 px-3 font-bold text-red-700 w-1/4">{requestData.request_type_label}</td>
                                <td className="py-2 px-3 bg-gray-50 font-semibold w-1/4 text-gray-600">Role / Level Akses:</td>
                                <td className="py-2 px-3 font-semibold text-gray-900 w-1/4">{requestData.access_level}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Modul Power Pro yang Diminta:</td>
                                <td colSpan={3} className="py-2 px-3 text-gray-800">
                                    <div className="flex flex-wrap gap-1.5">
                                        {Array.isArray(requestData.power_pro_modules) && requestData.power_pro_modules.map((m, idx) => (
                                            <span key={idx} className="inline-block px-2 py-0.5 rounded bg-gray-100 border border-gray-300 font-semibold text-[11px] text-gray-800">
                                                [✓] {m}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Hak Akses Khusus / Privileges:</td>
                                <td colSpan={3} className="py-2 px-3 text-gray-800">
                                    {Array.isArray(requestData.special_privileges) && requestData.special_privileges.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {requestData.special_privileges.map((p, idx) => (
                                                <span key={idx} className="inline-block px-2 py-0.5 rounded bg-amber-50 border border-amber-300 font-medium text-[11px] text-amber-900">
                                                    • {p}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Tidak ada hak akses khusus transaksi</span>
                                    )}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Usulan Username (Login ID):</td>
                                <td colSpan={3} className="py-2 px-3 font-mono text-gray-800">
                                    {requestData.proposed_username || '-'}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Alasan / Keperluan Akses:</td>
                                <td colSpan={3} className="py-2 px-3 text-gray-700 italic">
                                    {requestData.reason || 'Kebutuhan operasional harian hotel sesuai tugas pokok dan fungsi jabatan.'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section C: Hasil Eksekusi Tim IT */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white bg-gray-900 px-3 py-1 mb-2 rounded-xs">
                        C. Realisasi Pembuatan Oleh Tim IT (IT Execution & Issuance)
                    </h3>
                    <table className="w-full text-xs border border-gray-300">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2 px-3 bg-gray-50 font-semibold w-1/4 text-gray-600">User ID Resmi yang Diterbitkan:</td>
                                <td className="py-2 px-3 font-mono font-bold text-sm text-red-700 w-1/4">
                                    {requestData.created_user_id || '(Belum Terbit)'}
                                </td>
                                <td className="py-2 px-3 bg-gray-50 font-semibold w-1/4 text-gray-600">Tanggal Selesai Eksekusi:</td>
                                <td className="py-2 px-3 text-gray-800 w-1/4">
                                    {formatDateTime(requestData.processed_at)}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-600">Catatan Petugas IT:</td>
                                <td colSpan={3} className="py-2 px-3 text-gray-700">
                                    {requestData.it_notes || 'Akun telah terdaftar di database Power Pro Server. Karyawan wajib menjaga kerahasiaan password dan tidak diperkenankan meminjamkan user ID kepada pihak lain.'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section D: Tanda Tangan & Otorisasi Formal */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white bg-gray-900 px-3 py-1 mb-2 rounded-xs">
                        D. Lembar Pengesahan & Otorisasi (Signatures & Approvals)
                    </h3>
                    <div className="grid grid-cols-4 border border-gray-300 text-center text-xs divide-x divide-gray-300">
                        {/* 1. Pemohon */}
                        <div className="p-3 flex flex-col justify-between h-44">
                            <div>
                                <span className="font-bold text-gray-700 block uppercase text-[10px]">Diajukan Oleh (Staff):</span>
                                <span className="text-[10px] text-gray-400">Pemohon Akun</span>
                            </div>

                            <div className="h-20 flex items-center justify-center my-1">
                                {requestData.requester_signature ? (
                                    <img src={requestData.requester_signature} alt="Sign Pemohon" className="max-h-full object-contain" />
                                ) : (
                                    <span className="text-[10px] text-gray-300 italic">Belum Tanda Tangan</span>
                                )}
                            </div>

                            <div>
                                <p className="font-bold text-gray-900 border-t border-gray-400 pt-1 truncate">
                                    {requestData.requested_by_username || requestData.employee?.user?.name}
                                </p>
                                <p className="text-[9px] text-gray-500">Tgl: {formatDate(requestData.requested_at || requestData.created_at)}</p>
                            </div>
                        </div>

                        {/* 2. Head of Department */}
                        <div className="p-3 flex flex-col justify-between h-44">
                            <div>
                                <span className="font-bold text-gray-700 block uppercase text-[10px]">Disetujui Oleh (HOD):</span>
                                <span className="text-[10px] text-gray-400">Head of Department Terkait</span>
                            </div>

                            <div className="h-20 flex items-center justify-center my-1">
                                {requestData.approver_signature ? (
                                    <img src={requestData.approver_signature} alt="Sign HOD" className="max-h-full object-contain" />
                                ) : (
                                    <span className="text-[10px] text-gray-300 italic">Belum Disetujui</span>
                                )}
                            </div>

                            <div>
                                <p className="font-bold text-gray-900 border-t border-gray-400 pt-1 truncate">
                                    {requestData.approved_by_username || 'Head of Department'}
                                </p>
                                <p className="text-[9px] text-gray-500">Tgl: {formatDate(requestData.approved_at)}</p>
                            </div>
                        </div>

                        {/* 3. IT Department */}
                        <div className="p-3 flex flex-col justify-between h-44">
                            <div>
                                <span className="font-bold text-gray-700 block uppercase text-[10px]">Dikerjakan Oleh (IT):</span>
                                <span className="text-[10px] text-gray-400">IT Officer / Supervisor</span>
                            </div>

                            <div className="h-20 flex items-center justify-center my-1">
                                {requestData.it_signature ? (
                                    <img src={requestData.it_signature} alt="Sign IT" className="max-h-full object-contain" />
                                ) : (
                                    <span className="text-[10px] text-gray-300 italic">Belum Dikerjakan</span>
                                )}
                            </div>

                            <div>
                                <p className="font-bold text-gray-900 border-t border-gray-400 pt-1 truncate">
                                    {requestData.processed_by_username || hodIT?.user?.name || 'IT Department'}
                                </p>
                                <p className="text-[9px] text-gray-500">Tgl: {formatDate(requestData.processed_at)}</p>
                            </div>
                        </div>

                        {/* 4. Management / GM */}
                        <div className="p-3 flex flex-col justify-between h-44">
                            <div>
                                <span className="font-bold text-gray-700 block uppercase text-[10px]">Diketahui Oleh:</span>
                                <span className="text-[10px] text-gray-400">Financial Controller / GM</span>
                            </div>

                            <div className="h-20 flex items-center justify-center my-1">
                                <span className="text-[10px] text-gray-300 italic font-mono">(Acknowledged)</span>
                            </div>

                            <div>
                                <p className="font-bold text-gray-900 border-t border-gray-400 pt-1 truncate">
                                    {gmUser?.name || 'General Manager'}
                                </p>
                                <p className="text-[9px] text-gray-500">General Manager</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer notes */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between items-center">
                    <div>
                        Dokumen ini adalah arsip audit resmi IT Swiss-Belinn SKA Pekanbaru. Segala penyalahgunaan User ID merupakan tanggung jawab pemegang akun.
                    </div>
                    <div className="font-mono">
                        Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                </div>
            </div>
        </div>
    );
}
