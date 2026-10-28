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
        status: 'On Request' | 'Approved' | 'Created' | 'Updated' | 'Done' | 'Rejected';
        request_by?: string;
        requested_by_username?: string;
        requested_at?: string;
        approved_by_user_id?: number;
        approved_by_username?: string;
        approved_at?: string;
        approval_notes?: string;
        hod_signature?: string;
        done_by_user_id?: number;
        done_by_username?: string;
        done_at?: string;
        done_notes?: string;
        it_signature?: string;
        requester_signature?: string;
        approver_signature?: string;
        created_at: string;
        employee?: {
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
        approved_by?: {
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
        department?: {
            name: string;
        };
    } | null;
    itStaff?: {
        user?: {
            name: string;
        };
        position?: {
            name: string;
        };
        department?: {
            name: string;
        };
    } | null;
}

export default function MasterKeyPrint({ requestData, hodHK, itStaff }: Props) {
    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 print:p-0 print:bg-white text-gray-900 font-sans">
            <Head title={`Master Key Form - ${requestData.request_number}`} />

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
                        Back to List
                    </Link>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                        Housekeeping SOP Print Format Swiss-Belinn SKA Pekanbaru
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
                        Print Form
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
                                        Telp: +6276161888 • Email: pekanbaru-sbi@swiss-belhotel.com • www.swiss-belhotel.com
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
                            Master Key Access Application & Handover Form
                        </h2>
                        <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold tracking-wider">
                            Housekeeping Department • Evaluation Cycle: Every 3 Months
                        </p>
                    </div>

                    {/* Tipe Permohonan Checklist Box */}
                    <div className="mt-4 flex items-center justify-center gap-6 text-xs font-semibold bg-gray-50 py-2 px-4 rounded-xl border border-gray-200">
                        <span className="text-gray-500 uppercase tracking-wider text-[11px]">Request Type:</span>
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
                            <span className={requestData.request_type === 'extension' ? 'font-bold text-indigo-700' : 'text-gray-700'}>Extension (3 Months)</span>
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
                        I. Requester / Requested by Information
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs px-2">
                        <div className="flex">
                            <span className="w-36 text-gray-500">Requested by:</span>
                            <span className="font-bold text-gray-900">{requestData.request_by || requestData.employee?.user?.name || '-'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Department:</span>
                            <span className="font-semibold text-gray-900">{requestData.employee?.department?.name || 'Housekeeping'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Employee ID (NIK):</span>
                            <span className="font-mono font-medium text-gray-800">{requestData.employee?.employee_number}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Position:</span>
                            <span className="font-medium text-gray-800">{requestData.employee?.position?.name || 'Room Attendant'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Phone / Mobile No.:</span>
                            <span className="text-gray-800">{requestData.employee?.phone_number || '-'}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Direct Supervisor (SPV):</span>
                            <span className="text-gray-800">{requestData.employee?.supervisor?.user?.name || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Spesifikasi Kunci & Akses Area */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2.5">
                        II. Master Key Specifications & Authorized Coverage
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs px-2">
                        <div className="flex">
                            <span className="w-36 text-gray-500">Key Number / Code:</span>
                            <span className="font-mono font-extrabold text-indigo-700">{requestData.key_number}</span>
                        </div>
                        <div className="flex">
                            <span className="w-36 text-gray-500">Master Key Type:</span>
                            <span className="font-bold text-gray-900">{requestData.key_type}</span>
                        </div>
                        <div className="col-span-2 flex">
                            <span className="w-36 text-gray-500 shrink-0">Room Area Coverage:</span>
                            <span className="font-semibold text-gray-900">{requestData.room_range_access}</span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Remark & Alasan Permohonan */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2.5">
                        III. Remark / Reason for Key Creation, Renewal, or Replacement
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
                        IV. Validity Period & Evaluation Cycle (3 Months)
                    </h3>
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-center">
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase font-semibold">Effective Start Date</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{formatDate(requestData.valid_from)}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase font-semibold">Expiration Date (Due Date)</span>
                            <span className="font-bold text-indigo-700 text-sm mt-0.5 block">{formatDate(requestData.valid_until)}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase font-semibold">SOP Evaluation Cycle</span>
                            <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                                Every {requestData.renewal_cycle_months} Months
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section 5: Log Pencatatan Sistem (Username & Waktu) */}
                <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2.5">
                        V. System Activity & Audit Trail
                    </h3>
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                        {/* 1. Request Stage */}
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">1. Request Log:</span>
                            <div className="font-semibold text-gray-800 mt-0.5">
                                Account: <span className="text-indigo-600 font-mono">{requestData.requested_by_username || requestData.requested_by?.name || '-'}</span>
                            </div>
                            <div className="text-[11px] text-gray-600">
                                Date: {formatDateTime(requestData.requested_at || requestData.created_at)}
                            </div>
                            <div className="text-[10px] text-gray-500 italic mt-0.5">
                                Requester: {requestData.request_by || '-'}
                            </div>
                        </div>

                        {/* 2. HOD HK Approval Stage */}
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">2. HOD HK Approval:</span>
                            {requestData.approved_at || requestData.approved_by_username || ['Approved', 'Created', 'Updated', 'Done'].includes(requestData.status) ? (
                                <>
                                    <div className="font-semibold text-gray-800 mt-0.5">
                                        HOD: <span className="text-emerald-700 font-mono">{requestData.approved_by_username || hodHK?.user?.name || '-'}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-600">
                                        Approved: {formatDateTime(requestData.approved_at || requestData.done_at)}
                                    </div>
                                    {requestData.approval_notes && (
                                        <div className="text-[10px] text-gray-500 italic mt-0.5">
                                            Notes: {requestData.approval_notes}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-amber-700 font-medium italic mt-1 text-[11px]">
                                    [Pending HOD HK Approval]
                                </div>
                            )}
                        </div>

                        {/* 3. IT Department Issuance Stage */}
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-semibold block">3. IT Issuance Log:</span>
                            {['Created', 'Updated', 'Done'].includes(requestData.status) ? (
                                <>
                                    <div className="font-semibold text-gray-800 mt-0.5">
                                        IT PIC: <span className="text-blue-700 font-mono">{itStaff?.user?.name || requestData.done_by_username || '-'}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-600">
                                        Issued: {formatDateTime(requestData.done_at)}
                                    </div>
                                    {requestData.done_notes && (
                                        <div className="text-[10px] text-gray-500 italic mt-0.5">
                                            Notes: {requestData.done_notes}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-gray-500 font-medium italic mt-1 text-[11px]">
                                    [Pending IT Card Creation]
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 6: Ketentuan & Kebijakan SOP Hotel */}
                <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-3 py-1 rounded mb-2">
                        VI. Standard Operating Procedure (SOP) Security Policy
                    </h3>
                    <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-1 px-2 leading-relaxed">
                        <li>Master keys are high-priority security assets of Swiss-Belinn SKA Pekanbaru and may only be used during active operational duty.</li>
                        <li>Transferring, lending, or duplicating master keys to any unauthorized party without written approval is strictly prohibited.</li>
                        <li>In the event of key loss, damage, or malfunction, the key holder must notify the HOD Housekeeping and IT Department within 24 hours.</li>
                        <li>Key authorization is valid for a maximum of 3 (three) months. The holder is required to submit a renewal request before the expiration date.</li>
                        <li>Violations of this SOP will be subject to disciplinary action according to hotel labor policies.</li>
                    </ol>
                </div>

                {/* Section 7: Lembar Pengesahan (3 Kolom Tanda Tangan: Request by, Approve by, Create by) */}
                <div className="border-t border-gray-300 pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 text-center mb-4">
                        VII. Authorization & Handover Sign-off
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                        {/* 1. Diajukan oleh (Request by) */}
                        <div className="flex flex-col justify-between h-40 p-3 rounded-lg border border-gray-200 bg-white">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">1. Request by</span>
                            <div className="my-auto">
                                {requestData.requester_signature ? (
                                    <div className="h-16 flex items-center justify-center p-1">
                                        <img
                                            src={requestData.requester_signature}
                                            alt="Requester Signature"
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-[9px] text-gray-400 italic mb-1">[Physical Signature]</div>
                                )}
                            </div>
                            <div className="border-t border-gray-300 pt-1.5">
                                <p className="font-bold text-gray-900 leading-tight truncate">{requestData.request_by || requestData.employee?.user?.name || 'Requester'}</p>
                                <span className="text-[10px] text-gray-500">{requestData.employee?.position?.name || 'Staff Housekeeping'}</span>
                            </div>
                        </div>

                        {/* 2. Menyetujui (Approve by: HOD Housekeeping) */}
                        <div className="flex flex-col justify-between h-40 p-3 rounded-lg border border-gray-200 bg-white">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">2. Approve by (HOD Housekeeping)</span>
                            <div className="my-auto">
                                {requestData.hod_signature || requestData.approver_signature ? (
                                    <div className="h-16 flex flex-col items-center justify-center p-1">
                                        <img
                                            src={requestData.hod_signature || requestData.approver_signature}
                                            alt="HOD HK Signature"
                                            className="max-h-12 max-w-full object-contain"
                                        />
                                        <div className="text-[7.5px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded mt-0.5">
                                            E-Sign: {formatDate(requestData.approved_at || requestData.done_at)}
                                        </div>
                                    </div>
                                ) : ['Approved', 'Created', 'Updated', 'Done'].includes(requestData.status) ? (
                                    <div className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200">
                                        APPROVED (HOD HK)
                                        <div className="text-[8px] font-mono text-gray-400">{formatDate(requestData.approved_at || requestData.done_at)}</div>
                                    </div>
                                ) : (
                                    <div className="text-[9px] text-amber-600 font-medium italic mb-1">[Pending HOD HK Approval]</div>
                                )}
                            </div>
                            <div className="border-t border-gray-300 pt-1.5">
                                <p className="font-bold text-gray-900 leading-tight truncate">
                                    {requestData.approved_by_username || hodHK?.user?.name || 'Executive Housekeeper'}
                                </p>
                                <span className="text-[10px] text-gray-500">
                                    {hodHK?.position?.name || 'Executive Housekeeper'}
                                </span>
                            </div>
                        </div>

                        {/* 3. Dibuat oleh (Create by: Department IT) */}
                        <div className="flex flex-col justify-between h-40 p-3 rounded-lg border border-gray-200 bg-white">
                            <span className="text-[10px] text-gray-500 uppercase font-semibold">3. Create by (Department IT)</span>
                            <div className="my-auto">
                                {requestData.it_signature ? (
                                    <div className="h-16 flex flex-col items-center justify-center p-1">
                                        <img
                                            src={requestData.it_signature}
                                            alt="IT Signature"
                                            className="max-h-12 max-w-full object-contain"
                                        />
                                        <div className="text-[7.5px] font-mono text-blue-700 bg-blue-50 px-1 rounded mt-0.5">
                                            E-Sign IT: {formatDate(requestData.done_at)}
                                        </div>
                                    </div>
                                ) : ['Created', 'Updated', 'Done'].includes(requestData.status) ? (
                                    <div className="flex flex-col items-center justify-center p-1">
                                        <div className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200">
                                            {requestData.status === 'Created' ? 'KEY CREATED' : 'KEY UPDATED'}
                                            <div className="text-[8px] font-mono text-gray-500">{formatDate(requestData.done_at)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[9px] text-gray-400 italic mb-1">[Pending IT Card Creation]</div>
                                )}
                            </div>
                            <div className="border-t border-gray-300 pt-1.5">
                                <p className="font-bold text-gray-900 leading-tight truncate">
                                    {itStaff?.user?.name || (['Created', 'Updated', 'Done'].includes(requestData.status) && itStaff ? itStaff.user?.name : null) || '(Pending IT Officer)'}
                                </p>
                                <span className="text-[10px] text-gray-500">
                                    {itStaff?.position?.name || 'IT Support Staff / Department IT'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer notes */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 print:mt-6">
                    SIPU Management System • Swiss-Belinn SKA Pekanbaru • Automatically printed on {new Date().toLocaleString('en-US')}
                </div>
            </div>
        </div>
    );
}
