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

interface MasterKeyRequestItem {
    id: number;
    request_number: string;
    employee_id: number;
    department_id: number;
    key_number: string;
    key_type: string;
    room_range_access: string;
    valid_from: string;
    valid_until: string;
    renewal_cycle_months: number;
    purpose: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Revoked';
    approved_by?: number;
    approved_at?: string;
    approval_notes?: string;
    rejection_reason?: string;
    requester_signature?: string;
    approver_signature?: string;
    previous_request_id?: number;
    created_at: string;
    is_expired: boolean;
    is_expiring_soon: boolean;
    days_remaining: number;
    computed_status: string;
    employee?: Employee;
    approver?: {
        id: number;
        name: string;
    };
    previous_request?: {
        id: number;
        request_number: string;
        valid_until: string;
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
    };
    stats: {
        total: number;
        pending: number;
        active: number;
        expiring_soon: number;
        expired: number;
    };
    canApprove: boolean;
    canManageAll: boolean;
    currentEmployee?: Employee;
    hkEmployees: Employee[];
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
    hkEmployees,
    defaultKeyTypes,
    commonRoomRanges,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedKeyType, setSelectedKeyType] = useState(filters.key_type || '');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Selected item for action
    const [activeItem, setActiveItem] = useState<MasterKeyRequestItem | null>(null);
    const [approvalAction, setApprovalAction] = useState<'Approved' | 'Rejected' | 'Revoked'>('Approved');

    // Create Form
    const todayStr = new Date().toISOString().split('T')[0];
    const initialValidUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const {
        data: createData,
        setData: setCreateData,
        post: submitCreate,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({
        employee_id: currentEmployee?.id || (hkEmployees[0]?.id ?? ''),
        key_number: '',
        key_type: defaultKeyTypes[0] || 'Floor Master Key',
        room_range_access: commonRoomRanges[0] || '',
        valid_from: todayStr,
        renewal_cycle_months: 3,
        purpose: '',
        requester_signature: '',
    });

    // Calculate preview for end date (+3 months)
    const computeEndDate = (startDateStr: string, months = 3) => {
        if (!startDateStr) return '';
        const d = new Date(startDateStr);
        d.setMonth(d.getMonth() + Number(months));
        return d.toISOString().split('T')[0];
    };

    const calculatedValidUntil = computeEndDate(createData.valid_from, createData.renewal_cycle_months);

    // Quick Renew Form
    const {
        data: renewData,
        setData: setRenewData,
        post: submitRenew,
        processing: renewProcessing,
        reset: resetRenew,
    } = useForm({
        purpose: '',
    });

    // Approval / Rejection Form
    const {
        data: approvalData,
        setData: setApprovalData,
        patch: submitApproval,
        processing: approvalProcessing,
        reset: resetApproval,
    } = useForm({
        status: 'Approved' as 'Approved' | 'Rejected' | 'Revoked',
        notes: '',
        approver_signature: '',
    });

    // Filters navigation
    const applyFilter = (key: string, value: string) => {
        router.get(
            route('master-keys.index'),
            {
                ...filters,
                [key]: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search);
    };

    // Open Quick Renew Modal
    const handleOpenRenew = (item: MasterKeyRequestItem) => {
        setActiveItem(item);
        setRenewData({
            purpose: `Perpanjangan berkala 3 bulan akses master key ${item.key_number} (Ref: ${item.request_number}).`,
        });
        setIsRenewModalOpen(true);
    };

    // Open Approval Modal
    const handleOpenApproval = (item: MasterKeyRequestItem, action: 'Approved' | 'Rejected' | 'Revoked') => {
        setActiveItem(item);
        setApprovalAction(action);
        setApprovalData({
            status: action,
            notes: action === 'Approved' ? 'Disetujui untuk operasional 3 bulan ke depan.' : '',
        });
        setIsApprovalModalOpen(true);
    };

    // Open Detail Modal
    const handleOpenDetail = (item: MasterKeyRequestItem) => {
        setActiveItem(item);
        setIsDetailModalOpen(true);
    };

    // Submit Create
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitCreate(route('master-keys.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetCreate();
            },
        });
    };

    // Submit Renew
    const handleRenewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeItem) return;
        submitRenew(route('master-keys.renew', activeItem.id), {
            onSuccess: () => {
                setIsRenewModalOpen(false);
                resetRenew();
            },
        });
    };

    // Submit Approval
    const handleApprovalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeItem) return;
        submitApproval(route('master-keys.status', activeItem.id), {
            onSuccess: () => {
                setIsApprovalModalOpen(false);
                resetApproval();
            },
        });
    };

    // Status pill style helper
    const getStatusBadge = (item: MasterKeyRequestItem) => {
        if (item.status === 'Pending') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Menunggu Persetujuan
                </span>
            );
        }
        if (item.status === 'Rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Ditolak
                </span>
            );
        }
        if (item.status === 'Revoked') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    Dicabut / Dikembalikan
                </span>
            );
        }
        // Approved
        if (item.is_expired) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    Kedaluwarsa
                </span>
            );
        }
        if (item.is_expiring_soon) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    Habis dlm {item.days_remaining} hari
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Aktif Berlaku
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md uppercase">
                                Housekeeping Dept
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 font-medium">SOP Akses Hotel</span>
                        </div>
                        <h2 className="font-extrabold text-2xl text-gray-900 tracking-tight mt-0.5">
                            Form Perpanjangan Akses Master Key
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={route('master-keys.export', filters)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-xs border border-gray-300 transition-all hover:border-gray-400 cursor-pointer"
                            title="Download Rekapitulasi Data Master Key (Excel / CSV)"
                        >
                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Excel / CSV
                        </a>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            + Ajukan Perpanjangan Kunci
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Akses Master Key Housekeeping - Swiss-Belinn SKA" />

            <div className="space-y-6">
                {/* SOP Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-400/20">
                                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Kebijakan Keamanan Kunci Hotel (SOP Housekeeping)
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-tight">
                                Digitalisasi Form Akses Master Key Berkala 3 Bulan
                            </h3>
                            <p className="text-xs text-indigo-200/80 leading-relaxed">
                                Seluruh staf Housekeeping (Room Attendant / Supervisor) wajib memperbarui otorisasi akses master key setiap 3 bulan sekali. Modul ini menggantikan pengisian formulir manual untuk memastikan kepatuhan audit keamanan, transparansi serah terima, dan kontrol akses kamar tamu.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                            <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-center">
                                <span className="block text-[11px] text-indigo-200">Siklus Evaluasi</span>
                                <span className="text-base font-extrabold text-white">3 Bulan Sekali</span>
                            </div>
                            <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-center">
                                <span className="block text-[11px] text-indigo-200">Approval Otoritas</span>
                                <span className="text-base font-extrabold text-white">HOD HK / HRD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    <button
                        onClick={() => applyFilter('tab', 'all')}
                        className={`text-left p-4 rounded-xl border transition-all ${
                            filters.tab === 'all'
                                ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
                                : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between text-gray-500 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">Total Kunci</span>
                            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-gray-900 tracking-tight">{stats.total}</div>
                        <span className="text-[11px] text-gray-400 mt-1 block">Semua rekaman</span>
                    </button>

                    <button
                        onClick={() => applyFilter('tab', 'active')}
                        className={`text-left p-4 rounded-xl border transition-all ${
                            filters.tab === 'active'
                                ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                                : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between text-emerald-600 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">Aktif Berlaku</span>
                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-700 tracking-tight">{stats.active}</div>
                        <span className="text-[11px] text-emerald-600/80 mt-1 block">Otorisasi valid</span>
                    </button>

                    <button
                        onClick={() => applyFilter('tab', 'expiring')}
                        className={`text-left p-4 rounded-xl border transition-all ${
                            filters.tab === 'expiring'
                                ? 'bg-white border-orange-500 shadow-md ring-2 ring-orange-500/10'
                                : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between text-orange-600 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">Segera Habis</span>
                            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-orange-600 tracking-tight flex items-center gap-2">
                            {stats.expiring_soon}
                            {stats.expiring_soon > 0 && (
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping" />
                            )}
                        </div>
                        <span className="text-[11px] text-orange-600/80 mt-1 block">&lt; 14 hari tersisa</span>
                    </button>

                    <button
                        onClick={() => applyFilter('tab', 'expired')}
                        className={`text-left p-4 rounded-xl border transition-all ${
                            filters.tab === 'expired'
                                ? 'bg-white border-red-500 shadow-md ring-2 ring-red-500/10'
                                : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between text-red-600 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">Kedaluwarsa</span>
                            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-red-600 tracking-tight">{stats.expired}</div>
                        <span className="text-[11px] text-red-600/80 mt-1 block">Wajib perpanjang</span>
                    </button>

                    <button
                        onClick={() => applyFilter('tab', 'pending')}
                        className={`text-left p-4 rounded-xl border col-span-2 sm:col-span-1 transition-all ${
                            filters.tab === 'pending'
                                ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/10'
                                : 'bg-white border-gray-200/80 hover:border-gray-300 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between text-amber-600 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider">Persetujuan</span>
                            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-amber-600 tracking-tight">{stats.pending}</div>
                        <span className="text-[11px] text-amber-600/80 mt-1 block">Menunggu HOD/HRD</span>
                    </button>
                </div>

                {/* Filter and Tab Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                            {[
                                { key: 'all', label: 'Semua Permohonan', count: stats.total },
                                { key: 'pending', label: 'Menunggu Approval', count: stats.pending },
                                { key: 'active', label: 'Aktif', count: stats.active },
                                { key: 'expiring', label: 'Segera Habis (<14 Hari)', count: stats.expiring_soon },
                                { key: 'expired', label: 'Kedaluwarsa', count: stats.expired },
                                { key: 'history', label: 'Riwayat / Ditolak' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => applyFilter('tab', tab.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                        filters.tab === tab.key
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span
                                            className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                                                filters.tab === tab.key
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-200/80 text-gray-700'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search and Key Type Dropdown */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <select
                                value={selectedKeyType}
                                onChange={(e) => {
                                    setSelectedKeyType(e.target.value);
                                    applyFilter('key_type', e.target.value);
                                }}
                                className="text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50 py-2 pl-3 pr-8"
                            >
                                <option value="">Semua Tipe Kunci</option>
                                {defaultKeyTypes.map((kt) => (
                                    <option key={kt} value={kt}>
                                        {kt}
                                    </option>
                                ))}
                            </select>

                            <form onSubmit={handleSearchSubmit} className="relative min-w-[220px]">
                                <input
                                    type="text"
                                    placeholder="Cari no. permohonan, kunci, staf..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50/50 pl-8 pr-3 py-2"
                                />
                                <svg
                                    className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </form>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50/75 text-gray-500 font-semibold border-b border-gray-200 uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-5 py-3.5">No. Permohonan</th>
                                    <th className="px-5 py-3.5">Pemegang Kunci (Staf HK)</th>
                                    <th className="px-5 py-3.5">Kunci & Area Akses</th>
                                    <th className="px-5 py-3.5">Masa Berlaku (3 Bulan)</th>
                                    <th className="px-5 py-3.5">Status Akses</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                                            <div className="max-w-xs mx-auto space-y-2">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </div>
                                                <p className="font-semibold text-gray-800">Tidak ada permohonan master key</p>
                                                <p className="text-gray-400 text-[11px]">
                                                    Tidak ditemukan rekaman master key untuk filter yang dipilih.
                                                </p>
                                                <button
                                                    onClick={() => setIsCreateModalOpen(true)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 mt-2"
                                                >
                                                    + Ajukan Sekarang
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50/80 transition-colors group">
                                            {/* Request Number & Date */}
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-gray-900 font-mono tracking-tight flex items-center gap-1.5">
                                                    {req.request_number}
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-0.5">
                                                    Diajukan: {new Date(req.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                                {req.previous_request && (
                                                    <span className="inline-flex items-center gap-1 text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1">
                                                        Perpanjangan dari {req.previous_request.request_number}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Employee */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                                                        <img
                                                            src={req.employee?.user?.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.employee?.user?.name || 'HK')}&color=4338CA&background=EEF2FF`}
                                                            alt={req.employee?.user?.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 leading-tight">
                                                            {req.employee?.user?.name || 'Karyawan'}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">
                                                            {req.employee?.employee_number} • {req.employee?.position?.name || 'Room Attendant'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Key & Room Range */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
                                                        {req.key_number}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                                        {req.key_type}
                                                    </span>
                                                </div>
                                                <div className="text-gray-600 mt-1 max-w-xs truncate" title={req.room_range_access}>
                                                    {req.room_range_access}
                                                </div>
                                            </td>

                                            {/* Validity Period (3 Months) */}
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {new Date(req.valid_from).toLocaleDateString('id-ID')} s/d {new Date(req.valid_until).toLocaleDateString('id-ID')}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-semibold text-gray-500">
                                                        Periode: {req.renewal_cycle_months} Bulan
                                                    </span>
                                                    {req.status === 'Approved' && (
                                                        <span
                                                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                                                req.is_expired
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : req.is_expiring_soon
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-emerald-100 text-emerald-700'
                                                            }`}
                                                        >
                                                            {req.is_expired
                                                                ? `Lewat ${Math.abs(req.days_remaining)} Hari`
                                                                : `Sisa ${req.days_remaining} Hari`}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                {getStatusBadge(req)}
                                                {req.approver && (
                                                    <div className="text-[9px] text-gray-400 mt-1">
                                                        Oleh: {req.approver.name}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Quick Renew Button (Perpanjang 3 Bulan) */}
                                                    {(req.status === 'Approved' || req.is_expired || req.is_expiring_soon) && (
                                                        <button
                                                            onClick={() => handleOpenRenew(req)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer border border-indigo-200"
                                                            title="Perpanjang akses 3 bulan ke depan"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            Perpanjang
                                                        </button>
                                                    )}

                                                    {/* Print SOP Form */}
                                                    <a
                                                        href={route('master-keys.print', req.id)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                                                        title="Cetak Formulir Resmi SOP Hotel"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                        </svg>
                                                        Cetak
                                                    </a>

                                                    {/* Detail Button */}
                                                    <button
                                                        onClick={() => handleOpenDetail(req)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                        title="Lihat Detail Lengkap"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>

                                                    {/* Approval / Reject Buttons (if pending and canApprove) */}
                                                    {canApprove && req.status === 'Pending' && (
                                                        <div className="flex items-center gap-1 border-l border-gray-200 pl-1.5 ml-1">
                                                            <button
                                                                onClick={() => handleOpenApproval(req, 'Approved')}
                                                                className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold transition-colors cursor-pointer"
                                                            >
                                                                Setujui
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenApproval(req, 'Rejected')}
                                                                className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold transition-colors cursor-pointer border border-rose-200"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
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
                    {requests.last_page > 1 && (
                        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <div>
                                Menampilkan {requests.data.length} dari {requests.total} data
                            </div>
                            <div className="flex gap-1">
                                {requests.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                            link.active
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : link.url
                                                ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                                : 'border-transparent text-gray-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL 1: Create Master Key Request */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="xl">
                <form onSubmit={handleCreateSubmit} className="p-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Form Pengajuan Akses Master Key</h3>
                                <p className="text-xs text-gray-500">Departemen Housekeeping • Swiss-Belinn SKA</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4 text-xs">
                        {/* Employee Select (For Managers/Supervisors) */}
                        {canManageAll ? (
                            <div>
                                <InputLabel htmlFor="employee_id" value="Pilih Staf Housekeeping *" />
                                <select
                                    id="employee_id"
                                    value={createData.employee_id}
                                    onChange={(e) => setCreateData('employee_id', Number(e.target.value))}
                                    className="mt-1 w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {hkEmployees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.user.name} ({emp.employee_number}) - {emp.position?.name || 'Room Attendant'}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={createErrors.employee_id} className="mt-1" />
                            </div>
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Pemohon (Diri Sendiri)</span>
                                    <span className="font-semibold text-gray-900">{currentEmployee?.user.name}</span>
                                    <span className="text-gray-500 text-[11px] block">{currentEmployee?.position?.name} • NIK: {currentEmployee?.employee_number}</span>
                                </div>
                                <span className="px-2 py-1 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700">
                                    Housekeeping
                                </span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Key Number */}
                            <div>
                                <InputLabel htmlFor="key_number" value="Nomor / Kode Master Key *" />
                                <TextInput
                                    id="key_number"
                                    value={createData.key_number}
                                    onChange={(e) => setCreateData('key_number', e.target.value)}
                                    placeholder="Contoh: MK-HK-201, RFID-FL2"
                                    className="mt-1 w-full text-xs"
                                    required
                                />
                                <InputError message={createErrors.key_number} className="mt-1" />
                            </div>

                            {/* Key Type */}
                            <div>
                                <InputLabel htmlFor="key_type" value="Tipe Kunci *" />
                                <select
                                    id="key_type"
                                    value={createData.key_type}
                                    onChange={(e) => setCreateData('key_type', e.target.value)}
                                    className="mt-1 w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {defaultKeyTypes.map((kt) => (
                                        <option key={kt} value={kt}>
                                            {kt}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={createErrors.key_type} className="mt-1" />
                            </div>
                        </div>

                        {/* Room Range Access */}
                        <div>
                            <InputLabel htmlFor="room_range_access" value="Cakupan Area / Nomor Kamar yang Diakses *" />
                            <TextInput
                                id="room_range_access"
                                value={createData.room_range_access}
                                onChange={(e) => setCreateData('room_range_access', e.target.value)}
                                placeholder="Contoh: Lantai 2 (Kamar 201 - 240)"
                                className="mt-1 w-full text-xs"
                                required
                            />
                            {/* Preset Buttons */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                <span className="text-[10px] text-gray-400 self-center">Pilihan cepat:</span>
                                {commonRoomRanges.slice(0, 4).map((range) => (
                                    <button
                                        key={range}
                                        type="button"
                                        onClick={() => setCreateData('room_range_access', range)}
                                        className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-gray-600"
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <InputError message={createErrors.room_range_access} className="mt-1" />
                        </div>

                        {/* Validity Dates (3 Months Rule) */}
                        <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Jangka Waktu Akses: 3 Bulan (Sesuai Ketentuan Mentor & SOP)
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                                    90 Hari
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="valid_from" value="Tanggal Mulai Berlaku *" />
                                    <TextInput
                                        id="valid_from"
                                        type="date"
                                        value={createData.valid_from}
                                        onChange={(e) => setCreateData('valid_from', e.target.value)}
                                        className="mt-1 w-full text-xs"
                                        required
                                    />
                                    <InputError message={createErrors.valid_from} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="valid_until_preview" value="Tanggal Berakhir (Otomatis +3 Bulan)" />
                                    <div className="mt-1 px-3 py-2 bg-white rounded-xl border border-indigo-200 font-bold text-indigo-700 text-xs">
                                        {calculatedValidUntil
                                            ? new Date(calculatedValidUntil).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric',
                                              })
                                            : '-'}
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 block">
                                        Evaluasi perpanjangan berikutnya pada tanggal ini.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Purpose */}
                        <div>
                            <InputLabel htmlFor="purpose" value="Keperluan / Alasan Pengajuan *" />
                            <textarea
                                id="purpose"
                                rows={2}
                                value={createData.purpose}
                                onChange={(e) => setCreateData('purpose', e.target.value)}
                                placeholder="Contoh: Operasional rutin pembersihan kamar tamu check-out dan turn-down service shift pagi/siang."
                                className="mt-1 w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                            <InputError message={createErrors.purpose} className="mt-1" />
                        </div>

                        {/* Digital Signature */}
                        <div className="pt-2 border-t border-gray-100">
                            <SignaturePad
                                value={createData.requester_signature}
                                onChange={(sig) => setCreateData('requester_signature', sig || '')}
                                title="Tanda Tangan Pemohon / Staf HK (E-Sign Opsional)"
                                height={110}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={createProcessing} className="bg-indigo-600 hover:bg-indigo-700">
                            {createProcessing ? 'Menyimpan...' : 'Ajukan Permohonan (3 Bulan)'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL 2: Quick Renew (Perpanjang 3 Bulan) */}
            <Modal show={isRenewModalOpen} onClose={() => setIsRenewModalOpen(false)} maxWidth="md">
                {activeItem && (
                    <form onSubmit={handleRenewSubmit} className="p-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Perpanjang Akses Master Key (3 Bulan)</h3>
                                <p className="text-xs text-gray-500">Kunci: {activeItem.key_number} • {activeItem.key_type}</p>
                            </div>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1.5">
                                <div className="flex justify-between text-gray-600">
                                    <span>Pemegang Kunci:</span>
                                    <span className="font-bold text-gray-900">{activeItem.employee?.user?.name}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Cakupan Akses:</span>
                                    <span className="font-medium text-gray-800">{activeItem.room_range_access}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Masa Berlaku Saat Ini:</span>
                                    <span className="font-mono text-gray-700">{activeItem.valid_until}</span>
                                </div>
                                <div className="pt-2 border-t border-indigo-200/60 flex justify-between items-center">
                                    <span className="font-bold text-indigo-900">Periode Perpanjangan Baru:</span>
                                    <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded shadow-sm">
                                        +3 Bulan (Otomatis)
                                    </span>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="renew_purpose" value="Catatan / Keperluan Perpanjangan" />
                                <textarea
                                    id="renew_purpose"
                                    rows={2}
                                    value={renewData.purpose}
                                    onChange={(e) => setRenewData('purpose', e.target.value)}
                                    className="mt-1 w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <SecondaryButton onClick={() => setIsRenewModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            <PrimaryButton disabled={renewProcessing} className="bg-indigo-600 hover:bg-indigo-700">
                                {renewProcessing ? 'Memproses...' : 'Konfirmasi Perpanjang 3 Bulan'}
                            </PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL 3: Approval / Rejection */}
            <Modal show={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} maxWidth="md">
                {activeItem && (
                    <form onSubmit={handleApprovalSubmit} className="p-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
                            <div
                                className={`p-2.5 rounded-xl ${
                                    approvalAction === 'Approved'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'bg-rose-50 text-rose-600'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {approvalAction === 'Approved' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    )}
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {approvalAction === 'Approved'
                                        ? 'Setujui Permohonan Master Key'
                                        : approvalAction === 'Rejected'
                                        ? 'Tolak Permohonan Master Key'
                                        : 'Cabut / Tandai Dikembalikan'}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono">{activeItem.request_number}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <p className="text-gray-600">
                                Anda akan memproses permohonan akses kunci <strong>{activeItem.key_number}</strong> ({activeItem.key_type}) untuk staf <strong>{activeItem.employee?.user?.name}</strong>.
                            </p>

                            <div>
                                <InputLabel
                                    htmlFor="approval_notes"
                                    value={approvalAction === 'Approved' ? 'Catatan Persetujuan (Opsional)' : 'Alasan Penolakan / Pencabutan *'}
                                />
                                <textarea
                                    id="approval_notes"
                                    rows={2}
                                    value={approvalData.notes}
                                    onChange={(e) => setApprovalData('notes', e.target.value)}
                                    placeholder={
                                        approvalAction === 'Approved'
                                            ? 'Catatan operasional...'
                                            : 'Sebutkan alasan penolakan...'
                                    }
                                    className="mt-1 w-full text-xs rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    required={approvalAction !== 'Approved'}
                                />
                            </div>

                            {approvalAction === 'Approved' && (
                                <div className="pt-2 border-t border-gray-100">
                                    <SignaturePad
                                        value={approvalData.approver_signature}
                                        onChange={(sig) => setApprovalData('approver_signature', sig || '')}
                                        title="Paraf / Tanda Tangan Pejabat Penyetuju (E-Sign)"
                                        height={110}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <SecondaryButton onClick={() => setIsApprovalModalOpen(false)}>
                                Batal
                            </SecondaryButton>
                            {approvalAction === 'Approved' ? (
                                <PrimaryButton disabled={approvalProcessing} className="bg-emerald-600 hover:bg-emerald-700">
                                    {approvalProcessing ? 'Memproses...' : 'Setujui Akses (3 Bulan)'}
                                </PrimaryButton>
                            ) : (
                                <DangerButton disabled={approvalProcessing}>
                                    {approvalProcessing ? 'Memproses...' : 'Konfirmasi Tolak'}
                                </DangerButton>
                            )}
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL 4: Detail Modal */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="lg">
                {activeItem && (
                    <div className="p-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                            <div className="flex items-center gap-2.5">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                    {activeItem.request_number}
                                </span>
                                <h3 className="text-base font-bold text-gray-900">Detail Permohonan Master Key</h3>
                            </div>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Pemegang Kunci</span>
                                    <span className="font-bold text-gray-900 text-sm">{activeItem.employee?.user?.name}</span>
                                    <span className="text-gray-500 block">{activeItem.employee?.position?.name} • NIK {activeItem.employee?.employee_number}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Departemen</span>
                                    <span className="font-bold text-gray-900">Housekeeping</span>
                                    <span className="text-gray-500 block">Swiss-Belinn SKA Pekanbaru</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white rounded-xl border border-gray-200">
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Nomor & Tipe Kunci</span>
                                    <span className="font-mono font-bold text-indigo-700 text-sm block mt-0.5">{activeItem.key_number}</span>
                                    <span className="text-gray-600">{activeItem.key_type}</span>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-gray-200">
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Masa Berlaku (3 Bulan)</span>
                                    <span className="font-bold text-gray-900 block mt-0.5">{activeItem.valid_from} s/d {activeItem.valid_until}</span>
                                    <span className="text-gray-500">Siklus: 3 Bulan Sekali</span>
                                </div>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-gray-200">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Cakupan Area / Nomor Kamar</span>
                                <p className="font-medium text-gray-800 mt-1">{activeItem.room_range_access}</p>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-gray-200">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Keperluan / Alasan Pengajuan</span>
                                <p className="text-gray-700 mt-1">{activeItem.purpose}</p>
                            </div>

                            {activeItem.approval_notes && (
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Catatan Persetujuan</span>
                                    <p className="text-emerald-900 mt-0.5">{activeItem.approval_notes}</p>
                                    {activeItem.approver && (
                                        <span className="text-[10px] text-emerald-600 mt-1 block">
                                            Disetujui oleh: {activeItem.approver.name} pada {activeItem.approved_at}
                                        </span>
                                    )}
                                </div>
                            )}

                            {activeItem.rejection_reason && (
                                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                                    <span className="text-[10px] text-rose-700 uppercase font-semibold block">Alasan Penolakan</span>
                                    <p className="text-rose-900 mt-0.5">{activeItem.rejection_reason}</p>
                                </div>
                            )}

                            {/* Digital Signatures Showcase */}
                            {(activeItem.requester_signature || activeItem.approver_signature) && (
                                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-gray-200">
                                    <div>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                                            E-Sign Pemohon
                                        </span>
                                        {activeItem.requester_signature ? (
                                            <div className="h-14 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1">
                                                <img
                                                    src={activeItem.requester_signature}
                                                    alt="Tanda Tangan Pemohon"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">Belum ditandatangani</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">
                                            E-Sign Penyetuju (HOD/HRD)
                                        </span>
                                        {activeItem.approver_signature ? (
                                            <div className="h-14 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1">
                                                <img
                                                    src={activeItem.approver_signature}
                                                    alt="Tanda Tangan Penyetuju"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">Belum ditandatangani</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                            <a
                                href={route('master-keys.print', activeItem.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Cetak Format Resmi Hotel
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
