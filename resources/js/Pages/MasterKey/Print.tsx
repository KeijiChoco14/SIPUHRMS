import { Head, Link } from '@inertiajs/react';
import React from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface Props {
    requestData: {
        id: number;
        request_number: string;
        request_type: 'create_new' | 'extension' | 'replacement';
        request_type_label: string;
        key_number: string;
        key_type: string;
        room_range_access: string;
        valid_from: string;
        valid_until: string;
        renewal_cycle_months: number;
        remark?: string;
        purpose?: string;
        status: 'On Request' | 'Done';
        requested_by_username?: string;
        requested_at?: string;
        done_by_username?: string;
        done_at?: string;
        done_notes?: string;
        requester_signature?: string;
        approver_signature?: string;
        created_at: string;
        employee: {
            employee_number: string;
            phone_number?: string;
            user: {
                name: string;
                email: string;
            };
            department?: {
                name: string;
            };
            position?: {
                name: string;
            };
            supervisor?: {
                user?: {
                    name: string;
                };
                position?: {
                    name: string;
                };
            };
        };
        requested_by?: {
            name: string;
        };
        done_by?: {
            name: string;
        };
        previous_request?: {
            request_number: string;
            valid_until: string;
        };
    };
    hodHK?: {
        user?: {
            name: string;
        };
        position?: {
            name: string;
        };
    };
}

export default function MasterKeyPrint({ requestData, hodHK }: Props) {
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
            <Head title={`Form Master Key - ${requestData.request_number}`} />

            {/* Print Controls (Hidden when printing) */}
            <div className="max-w-4xl mx-auto mb-6 print:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('master-keys.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Daftar
                    </Link>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                        Format Cetak SOP Housekeeping Swiss-Belinn SKA Pekanbaru
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Cetak Formulir (Print)
                    </button>
                </div>
            </div>

            {/* Document Paper Container */}
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-lg print:shadow-none print:p-0 print:max-w-none border border-gray-200 print:border-none">
                {/* Official Letterhead */}
                <div className="border-b-2 border-gray-900 pb-5 mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl border border-gray-200 overflow-hidden bg-white p-1 shrink-0 flex items-center justify-center shadow-xs">
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
                                        Telp: (0761) 61888 • Email: pekanbaru-sbi@swiss-belhotel.com • www.swiss-belhotel.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-300 font-mono">
                                SOP-HK-SEC-012
                            </span>
                            <div className="mt-1 font-mono text-xs font-bold text-gray-800">
                                No: {requestData.request_number}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                                Status: <span className={`font-bold ${requestData.status === 'Done' ? 'text-emerald-700' : 'text-amber-700'}`}>{requestData.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <h2 className="text-base font-extrabold uppercase tracking-wide text-gray-900 border-y border-gray-200 py-1.5 inline-block px-6">
                            Formulir Permohonan & Serah Terima Akses Master Key
                        </h2>
                        <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">
                            Departemen Housekeeping • Jangka Waktu Evaluasi: 3 Bulan Sekali
                        </p>
                    </div>

                    {/* Tipe Permohonan Checklist Box */}
                    <div className="mt-4 flex items-center justify-center gap-6 text-xs font-semibold bg-gray-50 py-2 px-4 rounded-xl border border-gray-200">
                        <span className="text-gray-500 uppercase tracking-wider text-[11px]">Tipe Permohonan:</span>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-xs ${requestData.request_type === 'create_new' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-400 bg-white'}`}>
                                {requestData.request_type === 'create_new' ? '✓' : ''}
                            </span>
                            <span className={requestData.request_type === 'create_new' ? 'font-bold text-indigo-700' : 'text-gray-700'}>Create New</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-xs ${requestData.request_type === 'extension' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-400 bg-white'}`}>
                                {requestData.request_type === 'extension' ? '✓' : ''}
                            </span>
                            <span className={requestData.request_type === 'extension' ? 'font-bold text-indigo-700' : 'text-gray-700'}>Extension (3 Bulan)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-xs ${requestData.request_type === 'replacement' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-400 bg-white'}`}>
                                {requestData.request_type === 'replacement' ? '✓' : ''}
                            </span>
                            <span className={requestData.request_type === 'replacement' ? 'font-bold text-indigo-700' : 'text-gray-700'}>Replacement</span>
                        </div>
                    </div>
                </div>

                {/* Section 1: Data Karyawan */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2.5">
                        I. Data Pemohon / Pemegang Kunci
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs px-2">
                        <div className="flex">
                            <span className="w-36 text-gray-500">Nama Lengkap:</span>
                            <span className="font-bold text-gray-900">{requestData.employee?.user?.name}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Departemen:</span>
                            <span className="font-semibold text-gray-900">{requestData.employee?.department?.name || 'Housekeeping'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">No. Induk Karyawan (NIK):</span>
                            <span className="font-mono font-medium text-gray-800">{requestData.employee?.employee_number}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Jabatan:</span>
                            <span className="font-medium text-gray-800">{requestData.employee?.position?.name || 'Room Attendant'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">No. Telepon / HP:</span>
                            <span className="text-gray-800">{requestData.employee?.phone_number || '-'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Atasan Langsung (SPV):</span>
                            <span className="text-gray-800">{requestData.employee?.supervisor?.user?.name || 'Lestari Putri'}</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Spesifikasi Kunci & Akses Area */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2.5">
                        II. Spesifikasi Master Key & Cakupan Otorisasi
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs px-2">
                        <div className="flex">
                            <span className="w-36 text-gray-500">Nomor / Kode Kunci:</span>
                            <span className="font-mono font-extrabold text-indigo-700">{requestData.key_number}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Tipe Kunci Master:</span>
                            <span className="font-bold text-gray-900">{requestData.key_type}</span>
                        </div>
                        <div className="col-span-2 flex">
                            <span className="w-36 text-gray-500 shrink-0">Cakupan Area Kamar:</span>
                            <span className="font-semibold text-gray-900">{requestData.room_range_access}</span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Remark & Alasan Permohonan */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2.5">
                        III. Remark / Alasan Pembuatan, Perpanjangan, atau Penggantian Kunci
                    </h3>
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs">
                        <p className="font-medium text-gray-800 leading-relaxed">
                            {requestData.remark || requestData.purpose || '-'}
                        </p>
                    </div>
                </div>

                {/* Section 4: Masa Berlaku (3 Bulan) */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2.5">
                        IV. Masa Berlaku & Periode Evaluasi (3 Bulan)
                    </h3>
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-center">
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase font-semibold">Tanggal Mulai Berlaku</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{formatDate(requestData.valid_from)}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase font-semibold">Tanggal Berakhir (Jatuh Tempo)</span>
                            <span className="font-bold text-indigo-700 text-sm mt-0.5 block">{formatDate(requestData.valid_until)}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase font-semibold">Siklus Evaluasi SOP</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                                {requestData.renewal_cycle_months} Bulan Sekali
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section 5: Log Pencatatan Sistem (Username & Waktu) */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2.5">
                        V. Rekam Jejak Sistem (Activity & Audit Log)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Log Permohonan (Requested):</span>
                            <div className="font-semibold text-gray-800 mt-0.5">
                                Username: <span className="text-indigo-600 font-mono">{requestData.requested_by_username || requestData.requested_by?.name || '-'}</span>
                            </div>
                            <div className="text-[11px] text-gray-600">
                                Waktu Request: {formatDateTime(requestData.requested_at || requestData.created_at)}
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Log Penyelesaian (Done):</span>
                            {requestData.status === 'Done' ? (
                                <>
                                    <div className="font-semibold text-gray-800 mt-0.5">
                                        Username PIC: <span className="text-emerald-700 font-mono">{requestData.done_by_username || requestData.done_by?.name || '-'}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-600">
                                        Waktu Selesai (Done): {formatDateTime(requestData.done_at)}
                                    </div>
                                    {requestData.done_notes && (
                                        <div className="text-[10px] text-gray-500 italic mt-0.5">
                                            Catatan: {requestData.done_notes}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-amber-700 font-medium italic mt-1">
                                    [Status: On Request — Menunggu proses verifikasi & serah terima]
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 6: Ketentuan & Kebijakan SOP Hotel */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2">
                        VI. Ketentuan Standar Operasional Prosedur (SOP) Keamanan
                    </h3>
                    <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-1 px-2 leading-relaxed">
                        <li>Kunci master adalah aset prioritas keamanan hotel Swiss-Belinn SKA Pekanbaru dan hanya digunakan saat jam kerja operasional aktif.</li>
                        <li>Dilarang keras memindahtangankan, meminjamkan, atau menduplikasi kunci master kepada pihak mana pun tanpa otorisasi tertulis.</li>
                        <li>Apabila terjadi kehilangan, kerusakan, atau malfungsi kunci, pemegang wajib melapor ke Supervisor HK dan Departemen Security dalam 1x24 jam.</li>
                        <li>Masa berlaku akses berlaku maksimal selama 3 (tiga) bulan. Pemegang kunci wajib mengajukan formulir perpanjangan (extension) sebelum tanggal jatuh tempo berakhir.</li>
                        <li>Pelanggaran terhadap SOP ini akan dikenakan sanksi disipliner sesuai peraturan ketenagakerjaan hotel.</li>
                    </ol>
                </div>

                {/* Section 7: Lembar Pengesahan (4 Kolom Tanda Tangan) */}
                <div className="border-t border-gray-300 pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 text-center mb-4">
                        VII. Lembar Pengesahan & Serah Terima Akses
                    </h3>
                    <div className="grid grid-cols-4 gap-3 text-center text-xs">
                        {/* 1. Pemohon */}
                        <div className="flex flex-col justify-between h-36 p-2 rounded-lg border border-gray-200">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Pemohon (Staf HK)</span>
                            <div className="my-auto">
                                {requestData.requester_signature ? (
                                    <div className="h-16 flex items-center justify-center p-1">
                                        <img
                                            src={requestData.requester_signature}
                                            alt="Tanda Tangan Pemohon"
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-[9px] text-gray-400 italic mb-1">[Tanda Tangan Fisik]</div>
                                )}
                            </div>
                            <div className="border-t border-gray-300 pt-1">
                                <p className="font-bold text-gray-900 leading-tight truncate">{requestData.employee?.user?.name}</p>
                                <span className="text-[10px] text-gray-500">{requestData.employee?.position?.name || 'Room Attendant'}</span>
                            </div>
                        </div>

                        {/* 2. Mengetahui (Supervisor HK) */}
                        <div className="flex flex-col justify-between h-36 p-2 rounded-lg border border-gray-200">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Mengetahui (SPV HK)</span>
                            <div className="my-auto">
                                <div className="text-[9px] text-gray-400 italic mb-1">[Tanda Tangan Fisik]</div>
                            </div>
                            <div className="border-t border-gray-300 pt-1">
                                <p className="font-bold text-gray-900 leading-tight truncate">
                                    {requestData.employee?.supervisor?.user?.name || 'Lestari Putri'}
                                </p>
                                <span className="text-[10px] text-gray-500">Housekeeping Supervisor</span>
                            </div>
                        </div>

                        {/* 3. Menyetujui (Executive Housekeeper) */}
                        <div className="flex flex-col justify-between h-36 p-2 rounded-lg border border-gray-200">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Menyetujui (HOD HK)</span>
                            <div className="my-auto">
                                {requestData.approver_signature ? (
                                    <div className="h-16 flex flex-col items-center justify-center p-1">
                                        <img
                                            src={requestData.approver_signature}
                                            alt="Tanda Tangan Approver"
                                            className="max-h-12 max-w-full object-contain"
                                        />
                                        <div className="text-[7.5px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded mt-0.5">
                                            E-Sign: {formatDate(requestData.done_at)}
                                        </div>
                                    </div>
                                ) : requestData.status === 'Done' ? (
                                    <div className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                                        STATUS: DONE
                                        <div className="text-[8px] font-mono text-gray-400">{formatDate(requestData.done_at)}</div>
                                    </div>
                                ) : (
                                    <div className="text-[9px] text-gray-400 italic mb-1">[Tanda Tangan Fisik]</div>
                                )}
                            </div>
                            <div className="border-t border-gray-300 pt-1">
                                <p className="font-bold text-gray-900 leading-tight truncate">
                                    {requestData.done_by_username || hodHK?.user?.name || 'Dewi Kartika'}
                                </p>
                                <span className="text-[10px] text-gray-500">Executive Housekeeper</span>
                            </div>
                        </div>

                        {/* 4. Security / Serah Terima */}
                        <div className="flex flex-col justify-between h-36 p-2 rounded-lg border border-gray-200">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Verifikasi Fisik (Security)</span>
                            <div className="my-auto">
                                <div className="text-[9px] text-gray-400 italic mb-1">[Paraf & Tanggal Terima]</div>
                            </div>
                            <div className="border-t border-gray-300 pt-1">
                                <p className="font-bold text-gray-900 leading-tight truncate">(...................................)</p>
                                <span className="text-[10px] text-gray-500">Duty Security / Loss Prev.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer notes */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 print:mt-6">
                    SIPU Management System • Swiss-Belinn SKA Pekanbaru • Dicetak otomatis pada {new Date().toLocaleString('id-ID')}
                </div>
            </div>
        </div>
    );
}
