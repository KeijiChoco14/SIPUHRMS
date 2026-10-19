import React, { useState, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import SignaturePad from '@/Components/SignaturePad';

interface EmployeeItem {
    id: number;
    employee_number: string;
    department_id: number;
    user?: {
        id: number;
        name: string;
        email: string;
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

interface DepartmentItem {
    id: number;
    name: string;
}

interface PowerProRequestItem {
    id: number;
    request_number: string;
    request_type: 'create_new' | 'modify_access' | 'reset_password' | 'deactivate';
    request_type_label: string;
    employee_id: number;
    department_id: number;
    employment_status?: string;
    system_type: string;
    power_pro_modules: string[];
    access_level: string;
    special_privileges?: string[];
    proposed_username?: string;
    reason?: string;
    status: 'On Request' | 'Approved' | 'Done' | 'Rejected';
    status_color: string;
    requested_by_user_id?: number;
    requested_by_username?: string;
    requested_at?: string;
    requester_signature?: string;
    approved_by_user_id?: number;
    approved_by_username?: string;
    approved_at?: string;
    approver_signature?: string;
    approval_notes?: string;
    processed_by_user_id?: number;
    processed_by_username?: string;
    processed_at?: string;
    it_signature?: string;
    created_user_id?: string;
    it_notes?: string;
    rejection_reason?: string;
    created_at: string;
    employee?: {
        id: number;
        employee_number: string;
        user?: {
            name: string;
            email: string;
        };
        position?: {
            name: string;
        };
    };
    department?: {
        id: number;
        name: string;
    };
    requested_by?: {
        name: string;
    };
    approved_by?: {
        name: string;
    };
    processed_by?: {
        name: string;
    };
}

interface Props {
    requests: {
        data: PowerProRequestItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    stats: {
        total: number;
        on_request: number;
        approved: number;
        done: number;
        rejected: number;
    };
    departments: DepartmentItem[];
    employees: EmployeeItem[];
    filters: {
        search: string;
        status: string;
        request_type: string;
        department_id: string;
    };
    permissions: {
        isAdmin: boolean;
        isItStaff: boolean;
        isHod: boolean;
        isSupervisor: boolean;
        departmentId?: number;
        departmentName?: string;
    };
    currentUser: {
        id: number;
        name: string;
        employee_id?: number;
        department_id?: number;
        department_name?: string;
        position_name?: string;
    };
}

const AVAILABLE_MODULES = [
    { id: 'Front Office', label: 'Front Office (FO)', desc: 'Check-in, Check-out, Reservation, Room Folio & Billing' },
    { id: 'Point of Sales (POS)', label: 'Point of Sales (POS)', desc: 'Restoran, Bar, Room Service, Banquet Kasir' },
    { id: 'Housekeeping', label: 'Housekeeping (HK)', desc: 'Room Status (Clean/Dirty/OOO), Linen, Mini Bar' },
    { id: 'Accounting / Back Office', label: 'Accounting / Finance', desc: 'Accounts Receivable (AR), AP, GL, Night Audit' },
    { id: 'Purchasing & Receiving', label: 'Purchasing & Store', desc: 'Material Requisition, Receiving, Stock Opname' },
    { id: 'Sales & Marketing', label: 'Sales & Catering', desc: 'Company Profile, Contract Rates, Banquet Event' },
];

const AVAILABLE_PRIVILEGES = [
    { id: 'Void / Cancel Transaction', label: 'Void / Pembatalan Tagihan' },
    { id: 'Discount Override', label: 'Diskon Manual / Override' },
    { id: 'Rate Change Override', label: 'Perubahan Harga Kamar' },
    { id: 'Reprint Receipt / Folio', label: 'Cetak Ulang Bill / Struk' },
    { id: 'Open Cash Drawer', label: 'Buka Laci Kasir (No Sale)' },
    { id: 'Night Audit Posting', label: 'Posting Night Audit' },
];

export default function PowerProIndex({
    requests,
    stats,
    departments,
    employees,
    filters,
    permissions,
    currentUser,
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.request_type || 'all');
    const [deptFilter, setDeptFilter] = useState(filters.department_id || 'all');

    // Modals state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<PowerProRequestItem | null>(null);

    // Create Form
    const createForm = useForm({
        employee_id: currentUser.employee_id ? String(currentUser.employee_id) : '',
        request_type: 'create_new',
        employment_status: 'Permanent',
        power_pro_modules: ['Front Office'],
        access_level: 'Operator / Front Desk Agent',
        special_privileges: [] as string[],
        proposed_username: '',
        reason: '',
        requester_signature: '',
    });

    // Approve Form (HOD)
    const approveForm = useForm({
        approval_notes: '',
        approver_signature: '',
    });

    // Process Form (IT)
    const processForm = useForm({
        created_user_id: '',
        it_notes: '',
        it_signature: '',
    });

    // Reject Form
    const rejectForm = useForm({
        rejection_reason: '',
    });

    // Handle filter submit
    const applyFilters = (newFilters: Partial<typeof filters>) => {
        router.get(
            route('power-pro.index'),
            {
                search: newFilters.search ?? searchTerm,
                status: newFilters.status ?? statusFilter,
                request_type: newFilters.request_type ?? typeFilter,
                department_id: newFilters.department_id ?? deptFilter,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    // Toggle modules
    const handleModuleToggle = (modId: string) => {
        const current = createForm.data.power_pro_modules;
        if (current.includes(modId)) {
            if (current.length > 1) {
                createForm.setData('power_pro_modules', current.filter((m) => m !== modId));
            }
        } else {
            createForm.setData('power_pro_modules', [...current, modId]);
        }
    };

    // Toggle privileges
    const handlePrivilegeToggle = (privId: string) => {
        const current = createForm.data.special_privileges;
        if (current.includes(privId)) {
            createForm.setData('special_privileges', current.filter((p) => p !== privId));
        } else {
            createForm.setData('special_privileges', [...current, privId]);
        }
    };

    // Auto update selected employee department & position
    const selectedEmployee = useMemo(() => {
        return employees.find((e) => String(e.id) === String(createForm.data.employee_id));
    }, [createForm.data.employee_id, employees]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('power-pro.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleApproveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeItem) return;
        approveForm.patch(route('power-pro.approve', activeItem.id), {
            onSuccess: () => {
                setIsApproveOpen(false);
                approveForm.reset();
                setActiveItem(null);
            },
        });
    };

    const handleProcessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeItem) return;
        processForm.patch(route('power-pro.process', activeItem.id), {
            onSuccess: () => {
                setIsProcessOpen(false);
                processForm.reset();
                setActiveItem(null);
            },
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeItem) return;
        rejectForm.patch(route('power-pro.reject', activeItem.id), {
            onSuccess: () => {
                setIsRejectOpen(false);
                rejectForm.reset();
                setActiveItem(null);
            },
        });
    };

    const handleDelete = (item: PowerProRequestItem) => {
        if (confirm(`Apakah Anda yakin ingin menghapus permohonan ${item.request_number}?`)) {
            router.delete(route('power-pro.destroy', item.id));
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

    return (
        <AuthenticatedLayout>
            <Head title="Permohonan User ID Power Pro - IT Operations" />

            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 via-rose-700 to-red-800 p-6 sm:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
                                    SOP-IT-ACC-004
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-100">
                                    Hotel System Access
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                Permohonan User ID Power Pro
                            </h1>
                            <p className="mt-1 text-sm sm:text-base text-red-100 max-w-2xl">
                                Formulir resmi otorisasi pembuatan, perubahan hak akses, dan penonaktifan akun Property Management System (PMS) & POS Hotel Swiss-Belinn SKA.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            {permissions.isItStaff && (
                                <a
                                    href={route('power-pro.export')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export CSV
                                </a>
                            )}
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 transition-all cursor-pointer hover:scale-105 active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Ajukan ID Power Pro
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div
                        onClick={() => { setStatusFilter('all'); applyFilters({ status: 'all' }); }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            statusFilter === 'all'
                                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                        }`}
                    >
                        <span className="text-xs font-semibold text-gray-500 block">Total Permohonan</span>
                        <span className="text-2xl font-black text-gray-900 mt-1 block">{stats.total}</span>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Semua riwayat pengajuan</span>
                    </div>

                    <div
                        onClick={() => { setStatusFilter('On Request'); applyFilters({ status: 'On Request' }); }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            statusFilter === 'On Request'
                                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-700">On Request</span>
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        </div>
                        <span className="text-2xl font-black text-amber-900 mt-1 block">{stats.on_request}</span>
                        <span className="text-[11px] text-amber-600 mt-0.5 block">Menunggu review HOD</span>
                    </div>

                    <div
                        onClick={() => { setStatusFilter('Approved'); applyFilters({ status: 'Approved' }); }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            statusFilter === 'Approved'
                                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-blue-700">Approved</span>
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        </div>
                        <span className="text-2xl font-black text-blue-900 mt-1 block">{stats.approved}</span>
                        <span className="text-[11px] text-blue-600 mt-0.5 block">Siap dieksekusi IT</span>
                    </div>

                    <div
                        onClick={() => { setStatusFilter('Done'); applyFilters({ status: 'Done' }); }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            statusFilter === 'Done'
                                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-700">Selesai (Done)</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-2xl font-black text-emerald-900 mt-1 block">{stats.done}</span>
                        <span className="text-[11px] text-emerald-600 mt-0.5 block">User ID telah terbit</span>
                    </div>

                    <div
                        onClick={() => { setStatusFilter('Rejected'); applyFilters({ status: 'Rejected' }); }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            statusFilter === 'Rejected'
                                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                        }`}
                    >
                        <span className="text-xs font-semibold text-rose-700 block">Ditolak</span>
                        <span className="text-2xl font-black text-rose-900 mt-1 block">{stats.rejected}</span>
                        <span className="text-[11px] text-rose-600 mt-0.5 block">Perlu revisi / dibatalkan</span>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari no. permohonan, nama karyawan, NIK, atau User ID..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-xs sm:text-sm text-gray-800 transition-all"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                            <select
                                value={deptFilter}
                                onChange={(e) => {
                                    setDeptFilter(e.target.value);
                                    applyFilters({ department_id: e.target.value });
                                }}
                                className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            >
                                <option value="all">Semua Departemen</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    applyFilters({ request_type: e.target.value });
                                }}
                                className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            >
                                <option value="all">Semua Tipe Request</option>
                                <option value="create_new">Pembuatan Baru</option>
                                <option value="modify_access">Perubahan Akses</option>
                                <option value="reset_password">Reset Password</option>
                                <option value="deactivate">Penonaktifan Akun</option>
                            </select>

                            <button
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                                Cari
                            </button>
                        </div>
                    </form>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                                    <th className="py-3.5 px-4">No. Permohonan</th>
                                    <th className="py-3.5 px-4">Karyawan & Dept</th>
                                    <th className="py-3.5 px-4">Tipe & Modul Diminta</th>
                                    <th className="py-3.5 px-4">Role & Hak Khusus</th>
                                    <th className="py-3.5 px-4">User ID Terbit</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-400">
                                            <div className="max-w-xs mx-auto space-y-2">
                                                <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="font-semibold text-gray-600">Belum ada permohonan User ID Power Pro</p>
                                                <p className="text-[11px] text-gray-400">
                                                    Klik tombol &quot;Ajukan ID Power Pro&quot; di atas untuk mengajukan akses sistem hotel.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map((item) => {
                                        const isMyDept = permissions.departmentId === item.department_id;
                                        const canApprove = (permissions.isAdmin || (permissions.isHod && isMyDept)) && item.status === 'On Request';
                                        const canProcess = (permissions.isAdmin || permissions.isItStaff) && (item.status === 'Approved' || item.status === 'On Request');
                                        const canReject = (permissions.isAdmin || permissions.isItStaff || (permissions.isHod && isMyDept)) && item.status !== 'Done' && item.status !== 'Rejected';
                                        const canDelete = item.status === 'On Request' && (permissions.isAdmin || item.requested_by_user_id === currentUser.id);

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-semibold text-gray-900 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-red-700 font-bold">{item.request_number}</span>
                                                        <span className="text-[10px] text-gray-400 font-normal">
                                                            {formatDate(item.requested_at || item.created_at)}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-gray-900">
                                                        {item.employee?.user?.name || 'Unknown Employee'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                                                        <span className="font-mono">{item.employee?.employee_number}</span>
                                                        <span>•</span>
                                                        <span className="inline-block px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 text-[10px] font-medium">
                                                            {item.department?.name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className="inline-block text-[11px] font-semibold text-gray-800">
                                                        {item.request_type_label}
                                                    </span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {Array.isArray(item.power_pro_modules) && item.power_pro_modules.map((mod, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100"
                                                            >
                                                                {mod}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-medium text-gray-800">{item.access_level}</div>
                                                    {Array.isArray(item.special_privileges) && item.special_privileges.length > 0 && (
                                                        <div className="text-[10px] text-amber-700 font-medium mt-0.5 truncate max-w-xs">
                                                            Hak: {item.special_privileges.join(', ')}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    {item.created_user_id ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-xs">
                                                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            {item.created_user_id}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 font-mono text-[11px]">
                                                            {item.proposed_username ? `(Usul: ${item.proposed_username})` : 'Belum Terbit'}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${item.status_color}`}>
                                                        {item.status}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Detail View */}
                                                        <button
                                                            onClick={() => {
                                                                setActiveItem(item);
                                                                setIsDetailOpen(true);
                                                            }}
                                                            title="Lihat Detail & Riwayat"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>

                                                        {/* Print SOP */}
                                                        <a
                                                            href={route('power-pro.print', item.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Cetak Formulir SOP Resmi"
                                                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                            </svg>
                                                        </a>

                                                        {/* HOD Approve */}
                                                        {canApprove && (
                                                            <button
                                                                onClick={() => {
                                                                    setActiveItem(item);
                                                                    setIsApproveOpen(true);
                                                                }}
                                                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors"
                                                            >
                                                                Setujui HOD
                                                            </button>
                                                        )}

                                                        {/* IT Process */}
                                                        {canProcess && (
                                                            <button
                                                                onClick={() => {
                                                                    setActiveItem(item);
                                                                    processForm.setData({
                                                                        created_user_id: item.proposed_username || '',
                                                                        it_notes: '',
                                                                        it_signature: '',
                                                                    });
                                                                    setIsProcessOpen(true);
                                                                }}
                                                                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] transition-colors"
                                                            >
                                                                Proses IT
                                                            </button>
                                                        )}

                                                        {/* Reject */}
                                                        {canReject && (
                                                            <button
                                                                onClick={() => {
                                                                    setActiveItem(item);
                                                                    setIsRejectOpen(true);
                                                                }}
                                                                title="Tolak Permohonan"
                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {/* Delete */}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                title="Hapus Pengajuan"
                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {requests.last_page > 1 && (
                        <div className="py-3 px-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <div>
                                Menampilkan halaman <span className="font-semibold text-gray-800">{requests.current_page}</span> dari <span className="font-semibold text-gray-800">{requests.last_page}</span> ({requests.total} data)
                            </div>
                            <div className="flex gap-1">
                                {requests.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-red-600 text-white font-bold'
                                                : link.url
                                                ? 'hover:bg-gray-100 text-gray-700'
                                                : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* =================== MODAL 1: AJUKAN USER ID POWER PRO =================== */}
            <Modal show={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="2xl">
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Formulir IT Hotel</span>
                            <h2 className="text-lg font-bold text-gray-900">Pengajuan User ID Sistem Power Pro</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Karyawan Yang Diajukan */}
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="employee_id" value="Karyawan yang Memerlukan Akun *" />
                            <select
                                id="employee_id"
                                value={createForm.data.employee_id}
                                onChange={(e) => createForm.setData('employee_id', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                required
                            >
                                <option value="">-- Pilih Karyawan --</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.user?.name} ({emp.employee_number}) - {emp.department?.name} ({emp.position?.name || 'Staff'})
                                    </option>
                                ))}
                            </select>
                            {selectedEmployee && (
                                <p className="mt-1 text-[11px] text-gray-500">
                                    Departemen: <strong className="text-gray-700">{selectedEmployee.department?.name}</strong> • Posisi: <strong className="text-gray-700">{selectedEmployee.position?.name || '-'}</strong>
                                </p>
                            )}
                            <InputError message={createForm.errors.employee_id} className="mt-1" />
                        </div>

                        {/* Jenis Permohonan */}
                        <div>
                            <InputLabel htmlFor="request_type" value="Jenis Permohonan *" />
                            <select
                                id="request_type"
                                value={createForm.data.request_type}
                                onChange={(e) => createForm.setData('request_type', e.target.value as any)}
                                className="mt-1 w-full rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                required
                            >
                                <option value="create_new">Pembuatan User ID Baru</option>
                                <option value="modify_access">Perubahan Hak Akses / Jabatan</option>
                                <option value="reset_password">Reset Password Akun</option>
                                <option value="deactivate">Penonaktifan Akun (Resign / Selesai Kontrak)</option>
                            </select>
                        </div>

                        {/* Status Kepegawaian */}
                        <div>
                            <InputLabel htmlFor="employment_status" value="Status Kepegawaian" />
                            <select
                                id="employment_status"
                                value={createForm.data.employment_status}
                                onChange={(e) => createForm.setData('employment_status', e.target.value)}
                                className="mt-1 w-full rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            >
                                <option value="Permanent">Permanent (Karyawan Tetap)</option>
                                <option value="Contract">Contract (PKWT)</option>
                                <option value="Daily Worker">Daily Worker (DW)</option>
                                <option value="Trainee / OJT">Trainee / OJT (Magang)</option>
                            </select>
                        </div>

                        {/* Role / Level Akses */}
                        <div>
                            <InputLabel htmlFor="access_level" value="Level Akses / Jabatan di Sistem *" />
                            <TextInput
                                id="access_level"
                                value={createForm.data.access_level}
                                onChange={(e) => createForm.setData('access_level', e.target.value)}
                                placeholder="Contoh: Receptionist, Cashier, Supervisor, Night Audit"
                                className="mt-1 w-full text-xs sm:text-sm"
                                required
                            />
                            <InputError message={createForm.errors.access_level} className="mt-1" />
                        </div>

                        {/* Usulan Username */}
                        <div>
                            <InputLabel htmlFor="proposed_username" value="Usulan User ID (Opsional)" />
                            <TextInput
                                id="proposed_username"
                                value={createForm.data.proposed_username}
                                onChange={(e) => createForm.setData('proposed_username', e.target.value.toUpperCase())}
                                placeholder="Contoh: FO_RUDI, POS_SINTA"
                                className="mt-1 w-full text-xs sm:text-sm uppercase font-mono"
                            />
                        </div>

                        {/* Modul Power Pro Yang Diminta */}
                        <div className="sm:col-span-2">
                            <InputLabel value="Modul Power Pro yang Dibutuhkan *" />
                            <p className="text-[11px] text-gray-500 mb-2">Pilih modul sistem yang akan digunakan oleh karyawan bersangkutan.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {AVAILABLE_MODULES.map((mod) => {
                                    const checked = createForm.data.power_pro_modules.includes(mod.id);
                                    return (
                                        <div
                                            key={mod.id}
                                            onClick={() => handleModuleToggle(mod.id)}
                                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                                                checked
                                                    ? 'bg-red-50/70 border-red-300 ring-1 ring-red-400'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {}}
                                                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                                            />
                                            <div className="flex-1">
                                                <span className="font-semibold text-xs text-gray-900 block">{mod.label}</span>
                                                <span className="text-[10px] text-gray-500 leading-tight block">{mod.desc}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <InputError message={createForm.errors.power_pro_modules} className="mt-1" />
                        </div>

                        {/* Hak Istimewa Khusus (Privileges) */}
                        <div className="sm:col-span-2">
                            <InputLabel value="Hak Akses Khusus / Privileges (Opsional)" />
                            <p className="text-[11px] text-gray-500 mb-2">Centang jika karyawan memerlukan otorisasi transaksi sensitif.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {AVAILABLE_PRIVILEGES.map((priv) => {
                                    const checked = createForm.data.special_privileges.includes(priv.id);
                                    return (
                                        <div
                                            key={priv.id}
                                            onClick={() => handlePrivilegeToggle(priv.id)}
                                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                                                checked
                                                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                                                    : 'bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {}}
                                                className="rounded text-amber-600 focus:ring-amber-500"
                                            />
                                            <span className="text-[11px] font-medium leading-tight">{priv.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Alasan / Keperluan */}
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="reason" value="Keperluan / Alasan Pengajuan" />
                            <textarea
                                id="reason"
                                rows={2}
                                value={createForm.data.reason}
                                onChange={(e) => createForm.setData('reason', e.target.value)}
                                placeholder="Contoh: Karyawan baru posisi Receptionist Shift Pagi/Sore, memerlukan akses check-in dan kasir front office."
                                className="mt-1 w-full rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            />
                        </div>

                        {/* Tanda Tangan Digital Pemohon */}
                        <div className="sm:col-span-2">
                            <InputLabel value="Tanda Tangan Pemohon *" />
                            <p className="text-[11px] text-gray-500 mb-1">Bubuhkan tanda tangan digital Anda di bawah ini sebagai konfirmasi pengajuan.</p>
                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white p-2">
                                <SignaturePad
                                    value={createForm.data.requester_signature}
                                    onChange={(val) => createForm.setData('requester_signature', val || '')}
                                    title="Tanda Tangan Pemohon"
                                    height={120}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                        <SecondaryButton onClick={() => setIsCreateOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={createForm.processing} className="bg-red-600 hover:bg-red-700">
                            {createForm.processing ? 'Mengirimkan...' : 'Kirim Pengajuan ke HOD & IT'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* =================== MODAL 2: PERSETUJUAN HOD =================== */}
            <Modal show={isApproveOpen} onClose={() => setIsApproveOpen(false)} maxWidth="md">
                <form onSubmit={handleApproveSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Otorisasi HOD</span>
                            <h2 className="text-base font-bold text-gray-900">Persetujuan Head of Department</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsApproveOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {activeItem && (
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs space-y-1">
                            <p><span className="text-gray-500">No. Permohonan:</span> <strong className="text-blue-900">{activeItem.request_number}</strong></p>
                            <p><span className="text-gray-500">Karyawan:</span> <strong className="text-gray-800">{activeItem.employee?.user?.name}</strong> ({activeItem.department?.name})</p>
                            <p><span className="text-gray-500">Tipe:</span> <span className="font-semibold text-gray-700">{activeItem.request_type_label}</span></p>
                            <p><span className="text-gray-500">Modul:</span> <span className="font-medium text-gray-700">{activeItem.power_pro_modules?.join(', ')}</span></p>
                        </div>
                    )}

                    <div>
                        <InputLabel htmlFor="approval_notes" value="Catatan Persetujuan (Opsional)" />
                        <textarea
                            id="approval_notes"
                            rows={2}
                            value={approveForm.data.approval_notes}
                            onChange={(e) => approveForm.setData('approval_notes', e.target.value)}
                            placeholder="Contoh: Disetujui, harap diterbitkan User ID untuk shift awal minggu ini."
                            className="mt-1 w-full rounded-xl border border-gray-200 text-xs text-gray-800"
                        />
                    </div>

                    <div>
                        <InputLabel value="Tanda Tangan Digital HOD *" />
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white p-2 mt-1">
                            <SignaturePad
                                value={approveForm.data.approver_signature}
                                onChange={(val) => approveForm.setData('approver_signature', val || '')}
                                title="Tanda Tangan HOD"
                                height={110}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <SecondaryButton onClick={() => setIsApproveOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={approveForm.processing} className="bg-blue-600 hover:bg-blue-700">
                            {approveForm.processing ? 'Memproses...' : 'Setujui & Teruskan ke IT'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* =================== MODAL 3: PENYELESAIAN IT (GENERATE USER ID) =================== */}
            <Modal show={isProcessOpen} onClose={() => setIsProcessOpen(false)} maxWidth="md">
                <form onSubmit={handleProcessSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">IT Execution</span>
                            <h2 className="text-base font-bold text-gray-900">Penerbitan User ID Power Pro</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsProcessOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {activeItem && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                            <p><span className="text-gray-500">Pemohon:</span> <strong>{activeItem.employee?.user?.name}</strong> ({activeItem.department?.name})</p>
                            <p><span className="text-gray-500">Modul Dibutuhkan:</span> <strong className="text-red-700">{activeItem.power_pro_modules?.join(', ')}</strong></p>
                            <p><span className="text-gray-500">Level Akses:</span> {activeItem.access_level}</p>
                            {activeItem.proposed_username && (
                                <p><span className="text-gray-500">Usulan Username:</span> <code className="font-bold text-indigo-700">{activeItem.proposed_username}</code></p>
                            )}
                        </div>
                    )}

                    <div>
                        <InputLabel htmlFor="created_user_id" value="User ID Power Pro Resmi yang Dibuat *" />
                        <TextInput
                            id="created_user_id"
                            value={processForm.data.created_user_id}
                            onChange={(e) => processForm.setData('created_user_id', e.target.value.toUpperCase())}
                            placeholder="Contoh: FO_RUDI_01"
                            className="mt-1 w-full text-sm font-mono font-bold uppercase tracking-wider text-red-800"
                            required
                        />
                        <InputError message={processForm.errors.created_user_id} className="mt-1" />
                        <p className="text-[11px] text-gray-500 mt-1">
                            Masukkan ID login yang telah Anda buatkan di server database Power Pro.
                        </p>
                    </div>

                    <div>
                        <InputLabel htmlFor="it_notes" value="Catatan / Keterangan IT (Opsional)" />
                        <textarea
                            id="it_notes"
                            rows={2}
                            value={processForm.data.it_notes}
                            onChange={(e) => processForm.setData('it_notes', e.target.value)}
                            placeholder="Contoh: Akun sudah aktif di Workstation Terminal FO 1 & 2. Password default telah diserahkan langsung."
                            className="mt-1 w-full rounded-xl border border-gray-200 text-xs text-gray-800"
                        />
                    </div>

                    <div>
                        <InputLabel value="Tanda Tangan Petugas IT *" />
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white p-2 mt-1">
                            <SignaturePad
                                value={processForm.data.it_signature}
                                onChange={(val) => processForm.setData('it_signature', val || '')}
                                title="Tanda Tangan IT Officer"
                                height={110}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <SecondaryButton onClick={() => setIsProcessOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processForm.processing} className="bg-red-600 hover:bg-red-700">
                            {processForm.processing ? 'Menyimpan...' : 'Selesaikan & Terbitkan ID'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* =================== MODAL 4: DETAIL LENGKAP & RIWAYAT =================== */}
            <Modal show={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="2xl">
                {activeItem && (
                    <div className="p-6 space-y-5">
                        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold text-red-700">{activeItem.request_number}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${activeItem.status_color}`}>
                                        {activeItem.status}
                                    </span>
                                </div>
                                <h2 className="text-base font-bold text-gray-900 mt-1">
                                    {activeItem.request_type_label}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={route('power-pro.print', activeItem.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                                >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Cetak SOP
                                </a>
                                <button
                                    onClick={() => setIsDetailOpen(false)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Detail Info Grid */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                                <span className="text-gray-400 block font-medium">Karyawan</span>
                                <p className="font-bold text-gray-900 text-sm">{activeItem.employee?.user?.name}</p>
                                <p className="text-gray-500">NIK: {activeItem.employee?.employee_number}</p>
                                <p className="text-gray-500">Departemen: {activeItem.department?.name}</p>
                                <p className="text-gray-500">Status: {activeItem.employment_status || 'Permanent'}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-gray-400 block font-medium">Akses Sistem</span>
                                <p className="font-semibold text-gray-800">Level: {activeItem.access_level}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {activeItem.power_pro_modules?.map((m, i) => (
                                        <span key={i} className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-medium border border-red-100">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                                {activeItem.created_user_id && (
                                    <p className="mt-2 text-emerald-800 font-mono font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                                        ID Terbit: {activeItem.created_user_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        {activeItem.reason && (
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                                <span className="font-semibold text-gray-700 block mb-0.5">Keperluan / Justifikasi:</span>
                                <p className="text-gray-600">{activeItem.reason}</p>
                            </div>
                        )}

                        {activeItem.it_notes && (
                            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs">
                                <span className="font-semibold text-emerald-800 block mb-0.5">Catatan IT Department:</span>
                                <p className="text-emerald-700">{activeItem.it_notes}</p>
                            </div>
                        )}

                        {activeItem.rejection_reason && (
                            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-xs">
                                <span className="font-semibold text-rose-800 block mb-0.5">Alasan Penolakan:</span>
                                <p className="text-rose-700">{activeItem.rejection_reason}</p>
                            </div>
                        )}

                        {/* Timeline & Tanda Tangan */}
                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Lembar Otorisasi & Tanda Tangan
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {/* Pemohon */}
                                <div className="border border-gray-200 rounded-xl p-3 text-center bg-gray-50/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">1. Pemohon</span>
                                    <div className="h-16 my-1 flex items-center justify-center">
                                        {activeItem.requester_signature ? (
                                            <img src={activeItem.requester_signature} alt="Sign" className="max-h-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-gray-300 italic">Belum TTD</span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-gray-800 text-[11px] truncate">{activeItem.requested_by_username || activeItem.employee?.user?.name}</p>
                                    <p className="text-[9px] text-gray-400">{formatDate(activeItem.requested_at)}</p>
                                </div>

                                {/* HOD */}
                                <div className="border border-gray-200 rounded-xl p-3 text-center bg-gray-50/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">2. HOD Terkait</span>
                                    <div className="h-16 my-1 flex items-center justify-center">
                                        {activeItem.approver_signature ? (
                                            <img src={activeItem.approver_signature} alt="Sign" className="max-h-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-gray-300 italic">Belum Disetujui</span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-gray-800 text-[11px] truncate">{activeItem.approved_by_username || '-'}</p>
                                    <p className="text-[9px] text-gray-400">{formatDate(activeItem.approved_at)}</p>
                                </div>

                                {/* IT */}
                                <div className="border border-gray-200 rounded-xl p-3 text-center bg-gray-50/50">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">3. IT Department</span>
                                    <div className="h-16 my-1 flex items-center justify-center">
                                        {activeItem.it_signature ? (
                                            <img src={activeItem.it_signature} alt="Sign" className="max-h-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-gray-300 italic">Belum Diproses</span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-gray-800 text-[11px] truncate">{activeItem.processed_by_username || '-'}</p>
                                    <p className="text-[9px] text-gray-400">{formatDate(activeItem.processed_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <SecondaryButton onClick={() => setIsDetailOpen(false)}>
                                Tutup
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            {/* =================== MODAL 5: REJECT =================== */}
            <Modal show={isRejectOpen} onClose={() => setIsRejectOpen(false)} maxWidth="sm">
                <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-rose-700">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-base font-bold text-gray-900">Tolak Permohonan</h2>
                    </div>

                    <p className="text-xs text-gray-600">
                        Apakah Anda yakin ingin menolak permohonan <strong className="text-gray-800">{activeItem?.request_number}</strong>? Berikan alasan penolakan untuk pemohon.
                    </p>

                    <div>
                        <InputLabel htmlFor="rejection_reason" value="Alasan Penolakan *" />
                        <textarea
                            id="rejection_reason"
                            rows={3}
                            value={rejectForm.data.rejection_reason}
                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                            placeholder="Sebutkan alasan penolakan..."
                            className="mt-1 w-full rounded-xl border border-gray-200 text-xs text-gray-800"
                            required
                        />
                        <InputError message={rejectForm.errors.rejection_reason} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <SecondaryButton onClick={() => setIsRejectOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton disabled={rejectForm.processing}>
                            {rejectForm.processing ? 'Menolak...' : 'Konfirmasi Tolak'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
