import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import SignaturePad from '@/Components/SignaturePad';

interface Employee {
    id: number;
    employee_number: string;
    phone_number?: string;
    user: {
        id: number;
        name: string;
        email: string;
        profile_photo_url?: string;
    };
    department?: {
        id: number;
        name: string;
    };
    position?: {
        id: number;
        name: string;
    };
}

interface AuditLogItem {
    id: number;
    action: string;
    description: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

interface MasterKeyRequestItem {
    id: number;
    request_number: string;
    request_type: 'create_new' | 'extension' | 'replacement';
    request_type_label: string;
    employee_id: number;
    department_id: number;
    key_number: string;
    key_type: string;
    room_range_access: string;
    valid_from: string;
    valid_until: string;
    renewal_cycle_months: number;
    remark?: string;
    purpose?: string;
    status: 'On Request' | 'Done';
    requested_by_user_id?: number;
    requested_by_username?: string;
    requested_at?: string;
    done_by_user_id?: number;
    done_by_username?: string;
    done_at?: string;
    done_notes?: string;
    requester_signature?: string;
    approver_signature?: string;
    previous_request_id?: number;
    created_at: string;
    is_expired: boolean;
    is_expiring_soon: boolean;
    days_remaining: number;
    computed_status: string;
    employee?: Employee;
    requested_by?: {
        id: number;
        name: string;
    };
    done_by?: {
        id: number;
        name: string;
    };
    previous_request?: {
        id: number;
        request_number: string;
        key_number: string;
        valid_until: string;
    };
    audit_logs?: AuditLogItem[];
}

interface ExistingKeySummary {
    id: number;
    request_number: string;
    key_number: string;
    key_type: string;
    room_range_access: string;
    valid_until: string;
    employee_id: number;
    employee?: {
        user?: {
            name: string;
        };
    };
}

interface Props {
    requests: {
        data: MasterKeyRequestItem[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        tab: string;
        search: string;
        key_type: string;
        request_type: string;
    };
    stats: {
        total: number;
        on_request: number;
        done: number;
        expiring_soon: number;
        expired: number;
    };
    canApprove: boolean;
    canManageAll: boolean;
    currentEmployee?: Employee;
    currentUser: {
        id: number;
        name: string;
        email: string;
    };
    hkEmployees: Employee[];
    existingKeys: ExistingKeySummary[];
    defaultKeyTypes: string[];
    commonRoomRanges: string[];
}

export default function MasterKeyIndex({
    requests,
    filters,
    stats,
    canApprove,
    canManageAll,
    currentEmployee,
    currentUser,
    hkEmployees,
    existingKeys,
    defaultKeyTypes,
    commonRoomRanges,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedKeyType, setSelectedKeyType] = useState(filters.key_type || '');
    const [selectedReqType, setSelectedReqType] = useState(filters.request_type || '');

    // Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Selected item for action
    const [activeItem, setActiveItem] = useState<MasterKeyRequestItem | null>(null);

    // 1 Form Hook (A. create new, extension, replacement | B. remark | C. status on request)
    const {
        data: formData,
        setData: setFormData,
        post: postForm,
        processing: formProcessing,
        errors: formErrors,
        reset: resetForm,
    } = useForm({
        request_type: 'create_new' as 'create_new' | 'extension' | 'replacement',
        previous_request_id: '' as string | number,
        employee_id: canManageAll ? '' : (currentEmployee?.id ? String(currentEmployee.id) : ''),
        key_number: '',
        key_type: 'Floor Master Key',
        room_range_access: '',
        valid_from: new Date().toISOString().split('T')[0],
        renewal_cycle_months: 3,
        remark: '',
        purpose: '',
        requester_signature: '',
    });

    // Mark as Done Hook
    const {
        data: doneData,
        setData: setDoneData,
        patch: patchDone,
        processing: doneProcessing,
        reset: resetDone,
    } = useForm({
        status: 'Done' as 'Done' | 'On Request',
        done_notes: '',
        approver_signature: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('master-keys.index'),
            {
                ...filters,
                search,
                key_type: selectedKeyType,
                request_type: selectedReqType,
            },
            { preserveState: true }
        );
    };

    const handleTabChange = (tab: string) => {
        router.get(
            route('master-keys.index'),
            {
                ...filters,
                tab,
                search,
                key_type: selectedKeyType,
                request_type: selectedReqType,
            },
            { preserveState: true }
        );
    };

    const handleFilterReset = () => {
        setSearch('');
        setSelectedKeyType('');
        setSelectedReqType('');
        router.get(route('master-keys.index'));
    };

    // Open Form modal with specific request type & optional prefilled item
    const openFormModal = (
        type: 'create_new' | 'extension' | 'replacement' = 'create_new',
        targetItem?: MasterKeyRequestItem | ExistingKeySummary
    ) => {
        const todayStr = new Date().toISOString().split('T')[0];

        if (targetItem) {
            let defaultRemark = '';
            let validFromStr = todayStr;

            if (type === 'extension') {
                defaultRemark = `Perpanjangan berkala 3 bulan akses master key ${targetItem.key_number} (Ref: ${targetItem.request_number}).`;
                // If valid_until exists, use day after or today if expired
                if (targetItem.valid_until) {
                    const untilDate = new Date(targetItem.valid_until);
                    const now = new Date();
                    if (untilDate > now) {
                        const nextDay = new Date(untilDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        validFromStr = nextDay.toISOString().split('T')[0];
                    }
                }
            } else if (type === 'replacement') {
                defaultRemark = `Penggantian kunci master ${targetItem.key_number} karena (chip RFID tidak terbaca / fisik kunci rusak / hilang).`;
            }

            setFormData({
                request_type: type,
                previous_request_id: targetItem.id,
                employee_id: String(targetItem.employee_id),
                key_number: targetItem.key_number,
                key_type: targetItem.key_type || 'Floor Master Key',
                room_range_access: targetItem.room_range_access || '',
                valid_from: validFromStr,
                renewal_cycle_months: 3,
                remark: defaultRemark,
                purpose: defaultRemark,
                requester_signature: '',
            });
        } else {
            setFormData({
                request_type: type,
                previous_request_id: '',
                employee_id: canManageAll ? '' : (currentEmployee?.id ? String(currentEmployee.id) : ''),
                key_number: '',
                key_type: 'Floor Master Key',
                room_range_access: '',
                valid_from: todayStr,
                renewal_cycle_months: 3,
                remark: type === 'create_new'
                    ? 'Pembuatan akses master key baru untuk operasional housekeeping.'
                    : '',
                purpose: '',
                requester_signature: '',
            });
        }

        setIsFormModalOpen(true);
    };

    // When user toggles request_type inside the form modal
    const handleTypeChangeInForm = (newType: 'create_new' | 'extension' | 'replacement') => {
        setFormData(prev => {
            let suggestedRemark = prev.remark;
            if (newType === 'create_new') {
                suggestedRemark = 'Pembuatan akses master key baru untuk operasional housekeeping.';
            } else if (newType === 'extension') {
                suggestedRemark = prev.key_number
                    ? `Perpanjangan berkala 3 bulan akses master key ${prev.key_number}.`
                    : 'Perpanjangan berkala 3 bulan akses master key.';
            } else if (newType === 'replacement') {
                suggestedRemark = prev.key_number
                    ? `Penggantian kunci master ${prev.key_number} karena (chip RFID rusak / fisik patah / hilang).`
                    : 'Penggantian kunci master karena chip RFID rusak / fisik patah / hilang.';
            }

            return {
                ...prev,
                request_type: newType,
                remark: suggestedRemark,
            };
        });
    };

    // When selecting an existing key from dropdown inside Extension / Replacement mode
    const handleSelectExistingKey = (keyId: string) => {
        if (!keyId) {
            setFormData(prev => ({
                ...prev,
                previous_request_id: '',
            }));
            return;
        }

        const selected = existingKeys.find(k => String(k.id) === keyId);
        if (selected) {
            const isExt = formData.request_type === 'extension';
            setFormData(prev => ({
                ...prev,
                previous_request_id: selected.id,
                employee_id: String(selected.employee_id),
                key_number: selected.key_number,
                key_type: selected.key_type,
                room_range_access: selected.room_range_access,
                remark: isExt
                    ? `Perpanjangan berkala 3 bulan akses master key ${selected.key_number} (Ref: ${selected.request_number}).`
                    : `Penggantian kunci master ${selected.key_number} karena (chip rusak / fisik hilang / aus).`,
            }));
        }
    };

    // Submit 1 Unified Form
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postForm(route('master-keys.store'), {
            onSuccess: () => {
                setIsFormModalOpen(false);
                resetForm();
            },
        });
    };

    // Open Mark as Done Modal
    const openDoneModal = (item: MasterKeyRequestItem) => {
        setActiveItem(item);
        setDoneData({
            status: 'Done',
            done_notes: `Fisik master key ${item.key_number} telah diserahkan & akses diaktifkan.`,
            approver_signature: '',
        });
        setIsDoneModalOpen(true);
    };

    // Submit Mark as Done
    const handleDoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeItem) return;

        patchDone(route('master-keys.status', activeItem.id), {
            onSuccess: () => {
                setIsDoneModalOpen(false);
                setActiveItem(null);
                resetDone();
            },
        });
    };

    // Open Detail & Log Modal
    const openDetailModal = (item: MasterKeyRequestItem) => {
        setActiveItem(item);
        setIsDetailModalOpen(true);
    };

    // Delete confirmation
    const handleDelete = (item: MasterKeyRequestItem) => {
        if (confirm(`Yakin ingin menghapus permohonan master key ${item.key_number} (${item.request_number})?`)) {
            router.delete(route('master-keys.destroy', item.id));
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
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

    // Compute expected valid_until for preview in create form (valid_from + 3 months)
    const computeValidUntilPreview = (validFromStr: string, months = 3) => {
        if (!validFromStr) return '-';
        const d = new Date(validFromStr);
        d.setMonth(d.getMonth() + Number(months));
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Helper badge for request_type
    const renderTypeBadge = (type: string) => {
        switch (type) {
            case 'create_new':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        Create New
                    </span>
                );
            case 'extension':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <svg className="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Extension (3 Bulan)
                    </span>
                );
            case 'replacement':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        <svg className="w-3 h-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Replacement
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        {type}
                    </span>
                );
        }
    };

    // Helper badge for status: On Request vs Done
    const renderStatusBadge = (status: string, item: MasterKeyRequestItem) => {
        if (status === 'Done') {
            if (item.is_expired) {
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            Done (Kadaluarsa)
                        </span>
                        <span className="text-[10px] text-red-500 font-medium">Lewat {Math.abs(item.days_remaining)} hari</span>
                    </div>
                );
            }
            if (item.is_expiring_soon) {
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Done (Segera Jatuh Tempo)
                        </span>
                        <span className="text-[10px] text-amber-700 font-semibold">Sisa {item.days_remaining} hari</span>
                    </div>
                );
            }
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Done (Aktif)
                    </span>
                    <span className="text-[10px] text-gray-500">Sisa {item.days_remaining} hari</span>
                </div>
            );
        }

        // On Request status
        return (
            <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    On Request
                </span>
                <span className="text-[10px] text-gray-500 italic">Menunggu proses</span>
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Modul Akses Master Key Housekeeping - Swiss-Belinn" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Housekeeping Security SOP • Siklus Evaluasi 3 Bulan
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Permohonan & Perpanjangan Master Key
                            </h1>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Formulir terpadu untuk <strong>Create New</strong>, <strong>Extension (3 Bulan)</strong>, dan <strong>Replacement</strong>. Dilengkapi kolom remark alasan, status <em>On Request / Done</em>, serta pencatatan otomatis username pemohon & waktu penyelesaian di log.
                            </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => openFormModal('create_new')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Buka Form Permohonan
                            </button>

                            <a
                                href={route('master-keys.export', { ...filters })}
                                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/10 backdrop-blur-xs transition-colors"
                            >
                                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export Log (Excel)
                            </a>
                        </div>
                    </div>
                </div>

                {/* KPI Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Permohonan</span>
                            <div className="text-2xl font-black text-gray-900 mt-0.5">{stats.total}</div>
                            <span className="text-[11px] text-gray-400">Semua riwayat registrasi</span>
                        </div>
                    </div>

                    {/* On Request */}
                    <div
                        onClick={() => handleTabChange('on_request')}
                        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-amber-200/80 hover:border-amber-400 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md"
                    >
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">On Request</span>
                            <div className="text-2xl font-black text-amber-800 mt-0.5">{stats.on_request}</div>
                            <span className="text-[11px] text-amber-600 font-medium">Menunggu penyelesaian</span>
                        </div>
                    </div>

                    {/* Done */}
                    <div
                        onClick={() => handleTabChange('done')}
                        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-emerald-200/80 hover:border-emerald-400 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md"
                    >
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Done (Selesai)</span>
                            <div className="text-2xl font-black text-emerald-800 mt-0.5">{stats.done}</div>
                            <span className="text-[11px] text-emerald-600 font-medium">Akses aktif operasional</span>
                        </div>
                    </div>

                    {/* Expiring Soon (3 Bulan) */}
                    <div
                        onClick={() => handleTabChange('expiring')}
                        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-rose-200/80 hover:border-rose-400 flex items-center gap-4 cursor-pointer transition-all hover:shadow-md"
                    >
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Perlu Extension</span>
                            <div className="text-2xl font-black text-rose-700 mt-0.5">{stats.expiring_soon + stats.expired}</div>
                            <span className="text-[11px] text-rose-600 font-medium">Siklus 3 bulan jatuh tempo</span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Tab Buttons */}
                        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full md:w-auto overflow-x-auto text-xs font-semibold">
                            {[
                                { key: 'all', label: 'Semua' },
                                { key: 'on_request', label: 'On Request', count: stats.on_request },
                                { key: 'done', label: 'Done', count: stats.done },
                                { key: 'expiring', label: 'Jatuh Tempo (≤14 Hari)', count: stats.expiring_soon },
                                { key: 'expired', label: 'Kadaluarsa', count: stats.expired },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                                        filters.tab === tab.key
                                            ? 'bg-white text-indigo-900 shadow-xs font-bold'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                                            filters.tab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search and Filters */}
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
                            {/* Request Type Filter */}
                            <select
                                value={selectedReqType}
                                onChange={(e) => setSelectedReqType(e.target.value)}
                                className="text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2"
                            >
                                <option value="">Semua Tipe Form</option>
                                <option value="create_new">Create New</option>
                                <option value="extension">Extension</option>
                                <option value="replacement">Replacement</option>
                            </select>

                            {/* Key Type Filter */}
                            <select
                                value={selectedKeyType}
                                onChange={(e) => setSelectedKeyType(e.target.value)}
                                className="text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-2"
                            >
                                <option value="">Semua Tipe Kunci</option>
                                {defaultKeyTypes.map(kt => (
                                    <option key={kt} value={kt}>{kt}</option>
                                ))}
                            </select>

                            {/* Search input */}
                            <div className="relative flex-1 sm:w-60">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari kunci, remark, username..."
                                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <button
                                type="submit"
                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Filter
                            </button>

                            {(search || selectedKeyType || selectedReqType) && (
                                <button
                                    type="button"
                                    onClick={handleFilterReset}
                                    className="px-2.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                                    title="Reset filter"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Table of Master Key Requests */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
                                    <th className="py-3 px-4">No. Registrasi & Tipe</th>
                                    <th className="py-3 px-4">Pemegang Kunci</th>
                                    <th className="py-3 px-4">Detail Master Key</th>
                                    <th className="py-3 px-4">Remark / Alasan</th>
                                    <th className="py-3 px-4">Log Pengajuan (Requested)</th>
                                    <th className="py-3 px-4">Status & Sisa Waktu</th>
                                    <th className="py-3 px-4">Log Selesai (Done)</th>
                                    <th className="py-3 px-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-normal">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-gray-400">
                                            <div className="max-w-xs mx-auto space-y-2">
                                                <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                </svg>
                                                <p className="font-semibold text-gray-600">Tidak ada data permohonan master key</p>
                                                <p className="text-[11px]">Silakan klik tombol "Buka Form Permohonan" untuk membuat pengajuan baru.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map(item => (
                                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                                            {/* No. Registrasi & Tipe Form */}
                                            <td className="py-3.5 px-4 align-top">
                                                <div className="font-mono font-bold text-gray-900">{item.request_number}</div>
                                                <div className="mt-1">
                                                    {renderTypeBadge(item.request_type)}
                                                </div>
                                            </td>

                                            {/* Pemegang Kunci */}
                                            <td className="py-3.5 px-4 align-top">
                                                <div className="font-semibold text-gray-900">
                                                    {item.employee?.user?.name || '-'}
                                                </div>
                                                <div className="text-[11px] text-gray-500 font-mono">
                                                    NIK: {item.employee?.employee_number || '-'}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    {item.employee?.position?.name || 'Room Attendant'}
                                                </div>
                                            </td>

                                            {/* Detail Master Key */}
                                            <td className="py-3.5 px-4 align-top">
                                                <div className="font-mono font-bold text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded inline-block">
                                                    {item.key_number}
                                                </div>
                                                <div className="text-[11px] text-gray-700 font-medium mt-0.5">
                                                    {item.key_type}
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5 max-w-[200px] truncate" title={item.room_range_access}>
                                                    {item.room_range_access}
                                                </div>
                                            </td>

                                            {/* Remark / Alasan */}
                                            <td className="py-3.5 px-4 align-top max-w-[220px]">
                                                <div className="text-gray-800 line-clamp-2 text-[11px] leading-relaxed bg-amber-50/40 p-1.5 rounded border border-amber-100" title={item.remark}>
                                                    {item.remark || '-'}
                                                </div>
                                            </td>

                                            {/* Log Pengajuan (Username & Waktu) */}
                                            <td className="py-3.5 px-4 align-top">
                                                <div className="flex items-center gap-1 font-semibold text-gray-800">
                                                    <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="font-mono">{item.requested_by_username || item.requested_by?.name || '-'}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                    {formatDateTime(item.requested_at || item.created_at)}
                                                </div>
                                            </td>

                                            {/* Status & Sisa Waktu */}
                                            <td className="py-3.5 px-4 align-top">
                                                {renderStatusBadge(item.status, item)}
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    Masa: {formatDate(item.valid_from)} s/d {formatDate(item.valid_until)}
                                                </div>
                                            </td>

                                            {/* Log Selesai (Done) */}
                                            <td className="py-3.5 px-4 align-top">
                                                {item.status === 'Done' ? (
                                                    <div>
                                                        <div className="flex items-center gap-1 font-semibold text-emerald-800">
                                                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="font-mono text-[11px]">{item.done_by_username || item.done_by?.name || '-'}</span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                                            {formatDateTime(item.done_at)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic">-</span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 align-top text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Mark as Done button (for approvers / supervisor if On Request) */}
                                                    {item.status === 'On Request' && canApprove && (
                                                        <button
                                                            onClick={() => openDoneModal(item)}
                                                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                                                            title="Tandai Selesai (Mark as Done)"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Quick Perpanjang (Extension) button if Done */}
                                                    {item.status === 'Done' && (
                                                        <button
                                                            onClick={() => openFormModal('extension', item)}
                                                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                                                            title="Perpanjang 3 Bulan (Extension)"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Quick Replacement button if Done */}
                                                    {item.status === 'Done' && (
                                                        <button
                                                            onClick={() => openFormModal('replacement', item)}
                                                            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors cursor-pointer"
                                                            title="Ganti Kunci (Replacement)"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Detail & Log View */}
                                                    <button
                                                        onClick={() => openDetailModal(item)}
                                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                                                        title="Detail & Log Aktivitas"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>

                                                    {/* Print SOP Form */}
                                                    <a
                                                        href={route('master-keys.print', item.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                                                        title="Cetak Formulir SOP Resmi"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                    </a>

                                                    {/* Delete (Admin only or Owner if On Request) */}
                                                    {(canApprove || item.status === 'On Request') && (
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                                            title="Hapus Permohonan"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {requests.links && requests.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <div>
                                Menampilkan {requests.data.length} dari total {requests.total} data
                            </div>
                            <div className="flex items-center gap-1">
                                {requests.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                                            link.active
                                                ? 'bg-indigo-600 text-white font-bold'
                                                : link.url
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'text-gray-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 1 FORM UNIFIED MODAL: Create New | Extension | Replacement (Point A & B)   */}
            {/* ========================================================================= */}
            <Modal show={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleFormSubmit} className="p-6">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Form Permohonan Akses Master Key
                            </h2>
                            <p className="text-xs text-gray-500">
                                Housekeeping • Siklus evaluasi 3 bulan berkala • Swiss-Belinn SKA
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsFormModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-5">
                        {/* Point A: 1 form dengan pilihan Create New, Extension, Replacement */}
                        <div>
                            <InputLabel value="Pilih Tipe Permohonan Master Key *" />
                            <div className="grid grid-cols-3 gap-2 mt-1.5">
                                {[
                                    {
                                        type: 'create_new' as const,
                                        label: 'Create New',
                                        desc: 'Kunci baru',
                                        icon: '✨',
                                    },
                                    {
                                        type: 'extension' as const,
                                        label: 'Extension',
                                        desc: 'Perpanjang 3 Bulan',
                                        icon: '🔄',
                                    },
                                    {
                                        type: 'replacement' as const,
                                        label: 'Replacement',
                                        desc: 'Ganti rusak / hilang',
                                        icon: '🛠️',
                                    },
                                ].map(t => (
                                    <button
                                        key={t.type}
                                        type="button"
                                        onClick={() => handleTypeChangeInForm(t.type)}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                            formData.request_type === t.type
                                                ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-base">{t.icon}</span>
                                            {formData.request_type === t.type && (
                                                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                                            )}
                                        </div>
                                        <div className="mt-1.5">
                                            <div className="text-xs font-bold text-gray-900">{t.label}</div>
                                            <div className="text-[10px] text-gray-500 leading-tight">{t.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <InputError message={formErrors.request_type} className="mt-1" />
                        </div>

                        {/* Optional Reference Dropdown for Extension or Replacement */}
                        {(formData.request_type === 'extension' || formData.request_type === 'replacement') && existingKeys.length > 0 && (
                            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <InputLabel
                                    htmlFor="select_existing_key"
                                    value={`Pilih Kunci yang Hendak di-${formData.request_type === 'extension' ? 'Perpanjang' : 'Ganti'} (Opsional):`}
                                    className="text-indigo-900"
                                />
                                <select
                                    id="select_existing_key"
                                    value={formData.previous_request_id || ''}
                                    onChange={(e) => handleSelectExistingKey(e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">-- Pilih dari daftar kunci sebelumnya --</option>
                                    {existingKeys.map(k => (
                                        <option key={k.id} value={k.id}>
                                            {k.key_number} ({k.key_type}) - {k.employee?.user?.name || 'Staff'} (Berakhir: {formatDate(k.valid_until)})
                                        </option>
                                    ))}
                                </select>
                                <span className="text-[10px] text-indigo-700/80 mt-1 block">
                                    Memilih kunci di atas akan otomatis mengisi nomor kunci, cakupan kamar, dan karyawan pemegang.
                                </span>
                            </div>
                        )}

                        {/* Karyawan Pemegang Kunci */}
                        {canManageAll ? (
                            <div>
                                <InputLabel htmlFor="form_employee" value="Karyawan Pemegang Kunci (Housekeeping) *" />
                                <select
                                    id="form_employee"
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData('employee_id', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">-- Pilih Staf Housekeeping --</option>
                                    {hkEmployees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.employee_number} - {emp.user.name} ({emp.position?.name || 'Staff HK'})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={formErrors.employee_id} className="mt-1" />
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <span className="text-[11px] text-gray-500">Pemohon (Karyawan):</span>
                                <div className="font-bold text-gray-900 text-xs">
                                    {currentEmployee?.employee_number} - {currentEmployee?.user?.name}
                                </div>
                                <span className="text-[10px] text-gray-500">
                                    {currentEmployee?.department?.name} • {currentEmployee?.position?.name}
                                </span>
                            </div>
                        )}

                        {/* Nomor Kunci & Tipe Kunci */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="form_key_number" value="Nomor / Kode Kunci Master *" />
                                <TextInput
                                    id="form_key_number"
                                    type="text"
                                    value={formData.key_number}
                                    onChange={(e) => setFormData('key_number', e.target.value)}
                                    placeholder="Contoh: MK-HK-201 atau RFID-FL3"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    required
                                />
                                <InputError message={formErrors.key_number} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="form_key_type" value="Tipe Master Key *" />
                                <select
                                    id="form_key_type"
                                    value={formData.key_type}
                                    onChange={(e) => setFormData('key_type', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    {defaultKeyTypes.map(kt => (
                                        <option key={kt} value={kt}>{kt}</option>
                                    ))}
                                </select>
                                <InputError message={formErrors.key_type} className="mt-1" />
                            </div>
                        </div>

                        {/* Cakupan Area Kamar */}
                        <div>
                            <InputLabel htmlFor="form_room_range" value="Cakupan Area & Nomor Kamar *" />
                            <TextInput
                                id="form_room_range"
                                type="text"
                                value={formData.room_range_access}
                                onChange={(e) => setFormData('room_range_access', e.target.value)}
                                placeholder="Contoh: Lantai 2 (Kamar 201 - 240)"
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            {/* Quick options */}
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {commonRoomRanges.slice(0, 4).map(cr => (
                                    <button
                                        type="button"
                                        key={cr}
                                        onClick={() => setFormData('room_range_access', cr)}
                                        className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                                    >
                                        + {cr}
                                    </button>
                                ))}
                            </div>
                            <InputError message={formErrors.room_range_access} className="mt-1" />
                        </div>

                        {/* Point B: Kolom remark untuk menjelaskan kenapa key nya dibuat atau diperbarui atau diganti */}
                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel
                                    htmlFor="form_remark"
                                    value="Remark / Alasan Permohonan *"
                                    className="font-bold text-gray-900"
                                />
                                <span className="text-[10px] text-indigo-600 font-semibold">
                                    {formData.request_type === 'create_new' && 'Alasan pembuatan kunci baru'}
                                    {formData.request_type === 'extension' && 'Alasan perpanjangan 3 bulan'}
                                    {formData.request_type === 'replacement' && 'Alasan penggantian kunci'}
                                </span>
                            </div>
                            <textarea
                                id="form_remark"
                                rows={3}
                                value={formData.remark}
                                onChange={(e) => setFormData('remark', e.target.value)}
                                placeholder={
                                    formData.request_type === 'create_new'
                                        ? 'Jelaskan alasan kenapa kunci baru ini dibuat (contoh: Penambahan staf room attendant baru shift pagi lantai 2).'
                                        : formData.request_type === 'extension'
                                        ? 'Jelaskan alasan perpanjangan berkala (contoh: Perpanjangan berkala 3 bulan siklus evaluasi operasional HK Q4).'
                                        : 'Jelaskan alasan penggantian kunci (contoh: Kartu RFID lama retak / sensor tidak merespon di kamar 312).'
                                }
                                className="mt-1 block w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 leading-relaxed"
                                required
                            />
                            <p className="text-[10px] text-gray-500 mt-1">
                                Kolom ini tercatat dalam sistem audit log hotel dan tercetak pada formulir serah terima SOP.
                            </p>
                            <InputError message={formErrors.remark} className="mt-1" />
                        </div>

                        {/* Masa Berlaku (3 Bulan) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <div>
                                <InputLabel htmlFor="form_valid_from" value="Tanggal Mulai Berlaku *" />
                                <TextInput
                                    id="form_valid_from"
                                    type="date"
                                    value={formData.valid_from}
                                    onChange={(e) => setFormData('valid_from', e.target.value)}
                                    className="mt-1 block w-full text-xs"
                                    required
                                />
                            </div>

                            <div>
                                <span className="block text-xs font-medium text-gray-700">Jatuh Tempo (3 Bulan):</span>
                                <div className="mt-1.5 p-2 bg-white rounded-lg border border-indigo-200 flex items-center justify-between text-xs">
                                    <span className="font-bold text-indigo-700">
                                        {computeValidUntilPreview(formData.valid_from, 3)}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded">
                                        Siklus 3 Bulan
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Digital Signature Pemohon */}
                        <div>
                            <InputLabel value="Tanda Tangan Digital Pemohon (E-Sign) *" />
                            <div className="mt-1">
                                <SignaturePad
                                    title="Tanda Tangan Pemohon"
                                    value={formData.requester_signature}
                                    onChange={(sig) => setFormData('requester_signature', sig || '')}
                                />
                            </div>
                        </div>

                        {/* Point D: Info rekam username & tanggal request otomatis */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">👤</span>
                                <div>
                                    <span className="text-gray-500 text-[10px] uppercase font-bold block">Log Username Pemohon:</span>
                                    <span className="font-mono font-bold text-gray-900">{currentUser.name}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500 text-[10px] uppercase font-bold block">Tanggal Request:</span>
                                <span className="font-semibold text-gray-800">{formatDate(new Date().toISOString())} (Hari Ini)</span>
                            </div>
                            <div>
                                <span className="text-gray-500 text-[10px] uppercase font-bold block">Status Awal:</span>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                                    On Request
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton type="button" onClick={() => setIsFormModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={formProcessing} className="bg-indigo-600 hover:bg-indigo-700">
                            {formProcessing ? 'Memproses...' : 'Kirim Permohonan (On Request)'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* ========================================================================= */}
            {/* MARK AS DONE MODAL (Point C & D: Selesaikan & Catat Username / Waktu Done) */}
            {/* ========================================================================= */}
            <Modal show={isDoneModalOpen} onClose={() => setIsDoneModalOpen(false)} maxWidth="lg">
                {activeItem && (
                    <form onSubmit={handleDoneSubmit} className="p-6">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Tandai Permohonan Selesai (Done)
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Verifikasi penyerahan & aktivasi akses master key housekeeping
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDoneModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Request Summary */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">No. Registrasi:</span>
                                <span className="font-mono font-bold text-gray-900">{activeItem.request_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tipe Permohonan:</span>
                                <span className="font-bold text-indigo-700">{activeItem.request_type_label}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Kunci Master:</span>
                                <span className="font-mono font-bold text-indigo-700">{activeItem.key_number} ({activeItem.key_type})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Pemegang:</span>
                                <span className="font-semibold text-gray-900">{activeItem.employee?.user?.name}</span>
                            </div>
                            <div className="pt-1 border-t border-gray-200">
                                <span className="text-gray-500 block text-[10px]">Remark Pemohon:</span>
                                <p className="text-gray-800 italic mt-0.5 font-medium">{activeItem.remark || '-'}</p>
                            </div>
                        </div>

                        {/* Catatan Selesai */}
                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="done_notes" value="Catatan Penyerahan / Selesai (Done Notes)" />
                                <textarea
                                    id="done_notes"
                                    rows={3}
                                    value={doneData.done_notes}
                                    onChange={(e) => setDoneData('done_notes', e.target.value)}
                                    placeholder="Contoh: Kunci master telah diserahkan dalam kondisi baik dan RFID terverifikasi aktif."
                                    className="mt-1 block w-full text-xs rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Digital Signature Approver / Petugas Done */}
                            <div>
                                <InputLabel value="Tanda Tangan Petugas / Approver (E-Sign)" />
                                <div className="mt-1">
                                    <SignaturePad
                                        title="Tanda Tangan Petugas / EHK"
                                        value={doneData.approver_signature}
                                        onChange={(sig) => setDoneData('approver_signature', sig || '')}
                                    />
                                </div>
                            </div>

                            {/* Info Logging Point D */}
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                                <div className="flex justify-between items-center text-emerald-900">
                                    <span className="font-semibold">Petugas Penyelesai (Done By):</span>
                                    <span className="font-mono font-bold">{currentUser.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-800 text-[11px]">
                                    <span>Waktu Selesai (Done At):</span>
                                    <span>{new Date().toLocaleString('id-ID')} (Otomatis tercatat di log)</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                            <SecondaryButton type="button" onClick={() => setIsDoneModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton
                                type="submit"
                                disabled={doneProcessing}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {doneProcessing ? 'Menyimpan...' : 'Konfirmasi & Selesaikan (Done)'}
                            </PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>

            {/* ========================================================================= */}
            {/* DETAIL & AUDIT ACTIVITY LOG MODAL (Point D)                                */}
            {/* ========================================================================= */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="2xl">
                {activeItem && (
                    <div className="p-6 space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-gray-900 font-mono">
                                            {activeItem.request_number}
                                        </h2>
                                        {renderTypeBadge(activeItem.request_type)}
                                        {renderStatusBadge(activeItem.status, activeItem)}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Detail lengkap permohonan master key dan log riwayat audit
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Section 1: Data Kunci & Pemegang */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Pemegang Kunci</span>
                                <div className="font-bold text-gray-900 text-sm">{activeItem.employee?.user?.name}</div>
                                <div>NIK: <span className="font-mono font-medium">{activeItem.employee?.employee_number}</span></div>
                                <div>Jabatan: {activeItem.employee?.position?.name || 'Room Attendant'}</div>
                                <div>Departemen: {activeItem.employee?.department?.name || 'Housekeeping'}</div>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Spesifikasi Kunci</span>
                                <div className="font-mono font-extrabold text-indigo-700 text-sm">{activeItem.key_number}</div>
                                <div>Tipe: <span className="font-semibold text-gray-800">{activeItem.key_type}</span></div>
                                <div>Cakupan: {activeItem.room_range_access}</div>
                                <div>Masa Berlaku: {formatDate(activeItem.valid_from)} s/d {formatDate(activeItem.valid_until)} (3 Bulan)</div>
                            </div>
                        </div>

                        {/* Section 2: Remark / Alasan Permohonan */}
                        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
                            <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block mb-1">
                                Remark / Alasan Permohonan ({activeItem.request_type_label}):
                            </span>
                            <p className="text-gray-900 font-medium leading-relaxed">
                                {activeItem.remark || '-'}
                            </p>
                        </div>

                        {/* Section 3: Visual Timeline (Point D: Username, Tanggal Request, Kapan Done) */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-white">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-3">
                                Log Aktivitas & Jejak Sistem
                            </span>

                            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                {/* Step 1: Requested */}
                                <div className="relative">
                                    <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                                        1
                                    </div>
                                    <div className="text-xs font-bold text-gray-900">
                                        Permohonan Diajukan ({activeItem.request_type_label})
                                    </div>
                                    <div className="text-[11px] text-gray-600 mt-0.5">
                                        Username Pemohon: <span className="font-mono font-bold text-indigo-700">{activeItem.requested_by_username || activeItem.requested_by?.name || '-'}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        Waktu: {formatDateTime(activeItem.requested_at || activeItem.created_at)}
                                    </div>
                                </div>

                                {/* Step 2: Done */}
                                <div className="relative">
                                    <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        activeItem.status === 'Done' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'
                                    }`}>
                                        2
                                    </div>
                                    <div className="text-xs font-bold text-gray-900">
                                        {activeItem.status === 'Done' ? 'Permohonan Selesai (Done)' : 'Menunggu Penyelesaian (On Request)'}
                                    </div>
                                    {activeItem.status === 'Done' ? (
                                        <>
                                            <div className="text-[11px] text-gray-600 mt-0.5">
                                                Username Petugas: <span className="font-mono font-bold text-emerald-700">{activeItem.done_by_username || activeItem.done_by?.name || '-'}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                Waktu Selesai (Done At): {formatDateTime(activeItem.done_at)}
                                            </div>
                                            {activeItem.done_notes && (
                                                <div className="text-[11px] text-gray-700 mt-1 p-2 bg-emerald-50 rounded border border-emerald-200">
                                                    Catatan: {activeItem.done_notes}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-[11px] text-amber-700 italic mt-0.5">
                                            Status saat ini masih On Request. Menunggu verifikasi fisik & serah terima kunci.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Audit Logs History Table (if available) */}
                        {activeItem.audit_logs && activeItem.audit_logs.length > 0 && (
                            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                                    Riwayat Log Audit Database ({activeItem.audit_logs.length} Log)
                                </span>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px]">
                                    {activeItem.audit_logs.map(log => (
                                        <div key={log.id} className="p-2 bg-white rounded-lg border border-gray-200 flex items-start justify-between gap-3">
                                            <div>
                                                <span className="font-semibold text-gray-800">{log.description}</span>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    User: {log.user?.name || 'Sistem'}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-mono shrink-0">
                                                {formatDateTime(log.created_at)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Signatures Preview */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 border border-gray-200 rounded-xl text-center">
                                <span className="text-[10px] text-gray-500 uppercase font-semibold block mb-1">
                                    Tanda Tangan Pemohon
                                </span>
                                {activeItem.requester_signature ? (
                                    <div className="h-16 flex items-center justify-center p-1 bg-gray-50 rounded">
                                        <img
                                            src={activeItem.requester_signature}
                                            alt="E-Sign Pemohon"
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic text-[11px] block py-4">[Belum Ada E-Sign]</span>
                                )}
                            </div>

                            <div className="p-3 border border-gray-200 rounded-xl text-center">
                                <span className="text-[10px] text-gray-500 uppercase font-semibold block mb-1">
                                    Tanda Tangan Penanggung Jawab
                                </span>
                                {activeItem.approver_signature ? (
                                    <div className="h-16 flex items-center justify-center p-1 bg-gray-50 rounded">
                                        <img
                                            src={activeItem.approver_signature}
                                            alt="E-Sign Approver"
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                ) : activeItem.status === 'Done' ? (
                                    <div className="py-4 text-emerald-700 font-bold text-[11px]">
                                        [Disetujui Sistem: Done]
                                    </div>
                                ) : (
                                    <span className="text-gray-400 italic text-[11px] block py-4">[Menunggu Selesai]</span>
                                )}
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                            <a
                                href={route('master-keys.print', activeItem.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak SOP Resmi (Print)
                            </a>

                            <SecondaryButton onClick={() => setIsDetailModalOpen(false)}>
                                Tutup
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
