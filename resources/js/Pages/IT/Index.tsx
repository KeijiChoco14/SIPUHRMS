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

interface Asset {
    id: number;
    asset_code: string;
    name: string;
    category: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    specifications?: string;
    status: 'Available' | 'In Use' | 'Maintenance' | 'Disposed';
    assigned_to_employee_id?: number;
    assigned_employee?: {
        id: number;
        employee_number?: string;
        department?: { name: string };
        user?: { name: string; email: string };
    };
    location?: string;
    ip_address?: string;
    purchase_date?: string;
    warranty_expiry?: string;
    purchase_cost?: number;
    notes?: string;
}

interface TicketUpdate {
    id: number;
    user_id: number;
    user?: { name: string };
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
    asset?: { id: number; asset_code: string; name: string };
    location?: string;
    resolved_at?: string;
    resolution_notes?: string;
    created_at: string;
    updates?: TicketUpdate[];
}

interface PageProps {
    activeTab: 'overview' | 'assets' | 'tickets';
    isItManager: boolean;
    currentUser: {
        id: number;
        name: string;
        employee_id?: number;
        department: string;
    };
    assets: {
        data: Asset[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    tickets: {
        data: Ticket[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
    };
    assetStats: {
        total: number;
        in_use: number;
        available: number;
        maintenance: number;
        disposed: number;
    };
    ticketStats: {
        open: number;
        in_progress: number;
        resolved: number;
        closed: number;
        total: number;
    };
    itStaffUsers: { id: number; name: string; email: string }[];
    employees: { id: number; name: string; department: string; code?: string }[];
    assetsList: { id: number; asset_code: string; name: string; category: string; location?: string }[];
    filters: {
        tab: string;
        search?: string;
        status?: string;
        category?: string;
        ticket_search?: string;
        ticket_status?: string;
        ticket_priority?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ItIndex({
    activeTab = 'overview',
    isItManager,
    currentUser,
    assets,
    tickets,
    assetStats,
    ticketStats,
    itStaffUsers,
    employees,
    assetsList,
    filters,
    flash,
}: PageProps) {
    const [tab, setTab] = useState<'overview' | 'assets' | 'tickets'>(activeTab || 'overview');

    // Modals state
    const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
    const [isCreateAssetOpen, setIsCreateAssetOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
    const [quickStatusTicket, setQuickStatusTicket] = useState<Ticket | null>(null);

    // Filter states
    const [assetSearch, setAssetSearch] = useState(filters.search || '');
    const [assetCategory, setAssetCategory] = useState(filters.category || 'all');
    const [assetStatus, setAssetStatus] = useState(filters.status || 'all');

    const [ticketSearch, setTicketSearch] = useState(filters.ticket_search || '');
    const [ticketStatus, setTicketStatus] = useState(filters.ticket_status || 'all');
    const [ticketPriority, setTicketPriority] = useState(filters.ticket_priority || 'all');

    // Ticket Form
    const ticketForm = useForm({
        title: '',
        description: '',
        category: 'Hardware',
        priority: 'Medium',
        it_asset_id: '',
        location: '',
        reported_by_employee_id: '',
    });

    const submitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        ticketForm.post(route('it.tickets.store'), {
            onSuccess: () => {
                ticketForm.reset();
                setIsCreateTicketOpen(false);
            },
        });
    };

    // Asset Form
    const assetForm = useForm({
        asset_code: '',
        name: '',
        category: 'Desktop / PC',
        brand: '',
        model: '',
        serial_number: '',
        specifications: '',
        status: 'Available',
        assigned_to_employee_id: '',
        location: '',
        ip_address: '',
        purchase_date: '',
        warranty_expiry: '',
        purchase_cost: '',
        notes: '',
    });

    const openCreateAsset = () => {
        assetForm.reset();
        setEditingAsset(null);
        setIsCreateAssetOpen(true);
    };

    const openEditAsset = (asset: Asset) => {
        setEditingAsset(asset);
        assetForm.setData({
            asset_code: asset.asset_code,
            name: asset.name,
            category: asset.category,
            brand: asset.brand || '',
            model: asset.model || '',
            serial_number: asset.serial_number || '',
            specifications: asset.specifications || '',
            status: asset.status,
            assigned_to_employee_id: asset.assigned_to_employee_id ? String(asset.assigned_to_employee_id) : '',
            location: asset.location || '',
            ip_address: asset.ip_address || '',
            purchase_date: asset.purchase_date || '',
            warranty_expiry: asset.warranty_expiry || '',
            purchase_cost: asset.purchase_cost ? String(asset.purchase_cost) : '',
            notes: asset.notes || '',
        });
        setIsCreateAssetOpen(true);
    };

    const submitAsset = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAsset) {
            assetForm.put(route('it.assets.update', editingAsset.id), {
                onSuccess: () => {
                    setIsCreateAssetOpen(false);
                    setEditingAsset(null);
                },
            });
        } else {
            assetForm.post(route('it.assets.store'), {
                onSuccess: () => {
                    setIsCreateAssetOpen(false);
                    assetForm.reset();
                },
            });
        }
    };

    const confirmDeleteAsset = () => {
        if (!deletingAsset) return;
        router.delete(route('it.assets.destroy', deletingAsset.id), {
            onSuccess: () => setDeletingAsset(null),
        });
    };

    // Quick Status Update Form
    const statusForm = useForm({
        status: 'Open',
        assigned_to_user_id: '',
        resolution_notes: '',
        notes: '',
    });

    const openQuickStatus = (t: Ticket) => {
        setQuickStatusTicket(t);
        statusForm.setData({
            status: t.status,
            assigned_to_user_id: t.assigned_to_user_id ? String(t.assigned_to_user_id) : '',
            resolution_notes: t.resolution_notes || '',
            notes: '',
        });
    };

    const submitQuickStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickStatusTicket) return;
        statusForm.patch(route('it.tickets.status', quickStatusTicket.id), {
            onSuccess: () => {
                setQuickStatusTicket(null);
            },
        });
    };

    // Filter handling
    const applyAssetFilter = () => {
        router.get(
            route('it.index'),
            {
                tab: 'assets',
                search: assetSearch,
                category: assetCategory,
                status: assetStatus,
            },
            { preserveState: true }
        );
    };

    const applyTicketFilter = () => {
        router.get(
            route('it.index'),
            {
                tab: 'tickets',
                ticket_search: ticketSearch,
                ticket_status: ticketStatus,
                ticket_priority: ticketPriority,
            },
            { preserveState: true }
        );
    };

    // Badge styling helpers
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

    const getAssetStatusBadge = (status: string) => {
        switch (status) {
            case 'In Use':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Available':
                return 'bg-sky-100 text-sky-800 border-sky-200';
            case 'Maintenance':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Disposed':
                return 'bg-gray-100 text-gray-600 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-red-600/20">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                    Swiss-Belinn IT & Systems
                                </span>
                                {isItManager && (
                                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        IT Admin Access
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                {isItManager ? 'IT Operations & Helpdesk' : 'IT Helpdesk & Lapor Kendala'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Lapor Kendala IT Button - Available to everyone */}
                        <button
                            onClick={() => {
                                ticketForm.reset();
                                setIsCreateTicketOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-sm shadow-red-600/25 transition-all hover:scale-102 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Lapor Kendala IT</span>
                        </button>

                        {/* Tambah Asset - Only for IT Managers */}
                        {isItManager && (
                            <button
                                onClick={openCreateAsset}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 shadow-2xs transition-all hover:scale-102 cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Tambah Asset</span>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={isItManager ? "IT Operations & Helpdesk - Swiss-Belinn" : "IT Helpdesk - Swiss-Belinn"} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Notification Banner */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between shadow-2xs animate-fadeIn">
                        <div className="flex items-center gap-2">
                            <span>✅</span>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center justify-between shadow-2xs animate-fadeIn">
                        <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Tab Switcher / Non-IT Banner */}
                {!isItManager ? (
                    <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center text-lg shrink-0">
                                🎫
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                    Tiket Kendala IT Saya
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Daftar laporan permohonan bantuan teknis IT yang telah Anda ajukan
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
                                Total: {tickets.total} Tiket
                            </span>
                            {(ticketStats.open + ticketStats.in_progress) > 0 && (
                                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                                    {ticketStats.open + ticketStats.in_progress} Masih Diproses
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-2xs flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={() => {
                                setTab('overview');
                                router.get(route('it.index', { tab: 'overview' }), {}, { preserveState: true });
                            }}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                tab === 'overview'
                                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <span>📊</span>
                            <span>Overview & Stats</span>
                        </button>

                        <button
                            onClick={() => {
                                setTab('tickets');
                                router.get(route('it.index', { tab: 'tickets' }), {}, { preserveState: true });
                            }}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                                tab === 'tickets'
                                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <span>🎫</span>
                            <span>Helpdesk Tickets</span>
                            {(ticketStats.open + ticketStats.in_progress) > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    tab === 'tickets' ? 'bg-white text-red-800' : 'bg-amber-500 text-white'
                                }`}>
                                    {ticketStats.open + ticketStats.in_progress}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setTab('assets');
                                router.get(route('it.index', { tab: 'assets' }), {}, { preserveState: true });
                            }}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                tab === 'assets'
                                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <span>🖥️</span>
                            <span>Asset Inventory</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                tab === 'assets' ? 'bg-white text-red-800' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {assetStats.total}
                            </span>
                        </button>
                    </div>
                )}

                {/* TAB 1: OVERVIEW & STATS (IT Staff / Admin only) */}
                {tab === 'overview' && isItManager && (
                    <div className="space-y-6">
                        {/* High-level Metric Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Open Tickets */}
                            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                        Tiket Baru (Open)
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                                        ⏳
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                                        {ticketStats.open}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Menunggu respon dari teknisi IT
                                    </p>
                                </div>
                            </div>

                            {/* In Progress */}
                            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                        Sedang Ditangani
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
                                        ⚙️
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
                                        {ticketStats.in_progress}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Dalam tahap investigasi/perbaikan
                                    </p>
                                </div>
                            </div>

                            {/* Resolved & Closed */}
                            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                        Selesai Ditangani
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                                        ✅
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                                        {ticketStats.resolved + ticketStats.closed}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Tiket berhasil diselesaikan
                                    </p>
                                </div>
                            </div>

                            {/* Total Assets */}
                            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                                        Total Asset IT
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm">
                                        💻
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-red-700">
                                        {assetStats.total}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {assetStats.in_use} Aktif Digunakan • {assetStats.maintenance} Servis
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2-Column Split: Recent Active Tickets & Asset Status Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left: Recent Tickets (2 Cols) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                            Tiket Kendala IT Terbaru
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {isItManager ? 'Antrean kendala seluruh departemen hotel' : 'Tiket yang Anda laporkan'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setTab('tickets')}
                                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                                    >
                                        Lihat Semua ({ticketStats.total}) →
                                    </button>
                                </div>

                                <div className="mt-4 divide-y divide-gray-100">
                                    {tickets.data.slice(0, 5).map((t) => (
                                        <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-gray-50/50 rounded-xl px-2 transition-colors">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-sm shrink-0 mt-0.5">
                                                    {t.category === 'Hardware' ? '🖥️' : t.category === 'Network & Internet' ? '📶' : t.category === 'Printer & Scanner' ? '🖨️' : '⚙️'}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-mono font-bold text-red-700">
                                                            {t.ticket_number}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(t.status)}`}>
                                                            {t.status}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(t.priority)}`}>
                                                            {t.priority}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-gray-900 mt-1 truncate">
                                                        {t.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                        Pelapor: <strong className="text-gray-700">{t.reporter?.user?.name || (t.reporter ? `Emp #${t.reporter.employee_number}` : 'Staff')}</strong> ({t.reporter?.department?.name || t.location || 'Hotel'})
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 sm:self-center shrink-0">
                                                <Link
                                                    href={route('it.tickets.show', t.id)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                                >
                                                    Detail Tiket
                                                </Link>
                                                {isItManager && (
                                                    <button
                                                        onClick={() => openQuickStatus(t)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                        title="Update Status Cepat"
                                                    >
                                                        ⚡ Ubah
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {tickets.data.length === 0 && (
                                        <div className="py-10 text-center text-gray-400">
                                            <span className="text-3xl block mb-2">🎉</span>
                                            <p className="text-sm font-medium">Tidak ada kendala IT aktif.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Asset Health & Quick Stats (1 Col) */}
                            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 flex flex-col justify-between">
                                <div>
                                    <div className="pb-3 border-b border-gray-100">
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                            Status Aset IT Hotel
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Distribusi kondisi operasional perangkat
                                        </p>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <span className="font-semibold text-emerald-900">In Use (Sedang Digunakan)</span>
                                            </div>
                                            <span className="font-bold text-emerald-800">{assetStats.in_use} Unit</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                                <span className="font-semibold text-sky-900">Available (Siap Digunakan)</span>
                                            </div>
                                            <span className="font-bold text-sky-800">{assetStats.available} Unit</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                <span className="font-semibold text-amber-900">Maintenance / Perbaikan</span>
                                            </div>
                                            <span className="font-bold text-amber-800">{assetStats.maintenance} Unit</span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                <span className="font-semibold text-gray-700">Disposed (Afkir / Rusak)</span>
                                            </div>
                                            <span className="font-bold text-gray-700">{assetStats.disposed} Unit</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setTab('assets')}
                                        className="w-full py-2.5 rounded-xl text-xs font-bold text-center text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                    >
                                        Buka Data Inventaris Lengkap →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: HELPDESK TICKETS */}
                {tab === 'tickets' && (
                    <div className="space-y-4">
                        {/* Filter & Search Bar */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Cari no. tiket, judul kendala, atau lokasi..."
                                        value={ticketSearch}
                                        onChange={(e) => setTicketSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && applyTicketFilter()}
                                        className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <button
                                    onClick={applyTicketFilter}
                                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Cari
                                </button>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <select
                                    value={ticketStatus}
                                    onChange={(e) => {
                                        setTicketStatus(e.target.value);
                                        router.get(
                                            route('it.index'),
                                            {
                                                tab: 'tickets',
                                                ticket_search: ticketSearch,
                                                ticket_status: e.target.value,
                                                ticket_priority: ticketPriority,
                                            },
                                            { preserveState: true }
                                        );
                                    }}
                                    className="text-xs rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500 py-2"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="Open">Open (Baru)</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Pending Parts">Pending Parts</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>

                                <select
                                    value={ticketPriority}
                                    onChange={(e) => {
                                        setTicketPriority(e.target.value);
                                        router.get(
                                            route('it.index'),
                                            {
                                                tab: 'tickets',
                                                ticket_search: ticketSearch,
                                                ticket_status: ticketStatus,
                                                ticket_priority: e.target.value,
                                            },
                                            { preserveState: true }
                                        );
                                    }}
                                    className="text-xs rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500 py-2"
                                >
                                    <option value="all">Semua Prioritas</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Tickets Table / List */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm">
                                    <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">No. Tiket & Tanggal</th>
                                            <th className="py-3 px-4">Kendala / Masalah</th>
                                            <th className="py-3 px-4">Pelapor & Lokasi</th>
                                            <th className="py-3 px-4">Prioritas</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Teknisi IT</th>
                                            <th className="py-3 px-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-800">
                                        {tickets.data.map((t) => (
                                            <tr key={t.id} className="hover:bg-red-50/20 transition-colors">
                                                <td className="py-3.5 px-4 font-mono">
                                                    <span className="font-bold text-red-700 block">
                                                        {t.ticket_number}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {new Date(t.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                                                    <div className="font-semibold text-gray-900">
                                                        {t.title}
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                        {t.description}
                                                    </p>
                                                    {t.asset && (
                                                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 font-mono">
                                                            <span>💻</span>
                                                            <span>{t.asset.asset_code} - {t.asset.name}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-medium text-gray-900">
                                                        {t.reporter?.user?.name || (t.reporter ? `Emp #${t.reporter.employee_number}` : '-')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {t.reporter?.department?.name || '-'} • <span className="font-medium text-gray-700">{t.location || 'Area Hotel'}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPriorityBadge(t.priority)}`}>
                                                        {t.priority}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(t.status)}`}>
                                                        {t.status}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {t.assigned_user ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center text-[10px] font-bold">
                                                                {t.assigned_user.name.charAt(0)}
                                                            </div>
                                                            <span className="text-xs font-semibold text-gray-800">
                                                                {t.assigned_user.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">
                                                            Belum ditugaskan
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <Link
                                                            href={route('it.tickets.show', t.id)}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                                        >
                                                            Buka Tiket
                                                        </Link>
                                                        {isItManager && (
                                                            <button
                                                                onClick={() => openQuickStatus(t)}
                                                                className="px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                                title="Ubah Status"
                                                            >
                                                                ⚡
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {tickets.data.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-gray-400">
                                                    <span className="text-3xl block mb-2">🔍</span>
                                                    <p className="text-sm font-medium">Tidak ada tiket kendala yang sesuai dengan filter.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {tickets.last_page > 1 && (
                                <div className="p-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Menampilkan halaman {tickets.current_page} dari {tickets.last_page}</span>
                                    <div className="flex items-center gap-1">
                                        {tickets.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                                    link.active
                                                        ? 'bg-red-600 text-white border-red-600'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: ASSET INVENTORY (IT Staff / Admin only) */}
                {tab === 'assets' && isItManager && (
                    <div className="space-y-4">
                        {/* Filter Bar */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Cari kode aset, nama perangkat, brand, nomor seri, atau lokasi..."
                                        value={assetSearch}
                                        onChange={(e) => setAssetSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && applyAssetFilter()}
                                        className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500"
                                    />
                                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <button
                                    onClick={applyAssetFilter}
                                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Cari
                                </button>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <select
                                    value={assetCategory}
                                    onChange={(e) => {
                                        setAssetCategory(e.target.value);
                                        router.get(
                                            route('it.index'),
                                            {
                                                tab: 'assets',
                                                search: assetSearch,
                                                category: e.target.value,
                                                status: assetStatus,
                                            },
                                            { preserveState: true }
                                        );
                                    }}
                                    className="text-xs rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500 py-2"
                                >
                                    <option value="all">Semua Kategori</option>
                                    <option value="Desktop / PC">Desktop / PC</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Printer / Scanner">Printer / Scanner</option>
                                    <option value="Network">Network (Switch/AP)</option>
                                    <option value="CCTV / Security">CCTV / Security</option>
                                    <option value="POS Terminal">POS Terminal</option>
                                    <option value="Server">Server</option>
                                    <option value="Other">Lainnya</option>
                                </select>

                                <select
                                    value={assetStatus}
                                    onChange={(e) => {
                                        setAssetStatus(e.target.value);
                                        router.get(
                                            route('it.index'),
                                            {
                                                tab: 'assets',
                                                search: assetSearch,
                                                category: assetCategory,
                                                status: e.target.value,
                                            },
                                            { preserveState: true }
                                        );
                                    }}
                                    className="text-xs rounded-xl border-gray-200 focus:border-red-500 focus:ring-red-500 py-2"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="In Use">In Use (Aktif)</option>
                                    <option value="Available">Available (Tersedia)</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Disposed">Disposed (Afkir)</option>
                                </select>
                            </div>
                        </div>

                        {/* Assets Table */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs sm:text-sm">
                                    <thead className="bg-gray-50/80 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4">Kode Aset</th>
                                            <th className="py-3 px-4">Nama Perangkat & Spesifikasi</th>
                                            <th className="py-3 px-4">Kategori & Brand</th>
                                            <th className="py-3 px-4">Lokasi & IP Address</th>
                                            <th className="py-3 px-4">Pengguna (Employee)</th>
                                            <th className="py-3 px-4">Status</th>
                                            {isItManager && <th className="py-3 px-4 text-right">Aksi</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-800">
                                        {assets.data.map((a) => (
                                            <tr key={a.id} className="hover:bg-red-50/20 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-red-700">
                                                    {a.asset_code}
                                                    {a.serial_number && (
                                                        <span className="block text-[10px] text-gray-400 font-normal">
                                                            SN: {a.serial_number}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                                                    <div className="font-semibold text-gray-900">
                                                        {a.name}
                                                    </div>
                                                    {a.specifications && (
                                                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                                            {a.specifications}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className="font-medium text-gray-800 block">
                                                        {a.category}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {a.brand || '-'} {a.model ? `(${a.model})` : ''}
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-medium text-gray-900">
                                                        {a.location || '-'}
                                                    </div>
                                                    {a.ip_address ? (
                                                        <span className="text-xs font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                                                            {a.ip_address}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {a.assigned_employee ? (
                                                        <div>
                                                            <div className="font-semibold text-gray-900">
                                                                {a.assigned_employee.user?.name || (a.assigned_employee.employee_number ? `Emp #${a.assigned_employee.employee_number}` : 'Staff')}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {a.assigned_employee.department?.name || '-'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">
                                                            Peralatan Umum / Pool
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getAssetStatusBadge(a.status)}`}>
                                                        {a.status}
                                                    </span>
                                                </td>

                                                {isItManager && (
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="inline-flex items-center gap-1">
                                                            <button
                                                                onClick={() => openEditAsset(a)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingAsset(a)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}

                                        {assets.data.length === 0 && (
                                            <tr>
                                                <td colSpan={isItManager ? 7 : 6} className="py-12 text-center text-gray-400">
                                                    <span className="text-3xl block mb-2">🔍</span>
                                                    <p className="text-sm font-medium">Tidak ada aset IT yang cocok dengan pencarian.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {assets.last_page > 1 && (
                                <div className="p-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span>Menampilkan halaman {assets.current_page} dari {assets.last_page}</span>
                                    <div className="flex items-center gap-1">
                                        {assets.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                                    link.active
                                                        ? 'bg-red-600 text-white border-red-600'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL 1: LAPOR KENDALA IT (CREATE TICKET) */}
            <Modal show={isCreateTicketOpen} onClose={() => setIsCreateTicketOpen(false)} maxWidth="2xl">
                <form onSubmit={submitTicket} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg border border-red-200 shrink-0">
                                🛠️
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                                    IT Helpdesk Request
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    Formulir Lapor Kendala IT
                                </h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateTicketOpen(false)}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm">
                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="ticket_title" value="Judul Kendala / Ringkasan Masalah *" />
                            <TextInput
                                id="ticket_title"
                                type="text"
                                className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                placeholder="Contoh: Printer Kasir Resto Paper Jam / WiFi Siak Tidak Bisa Connect"
                                value={ticketForm.data.title}
                                onChange={(e) => ticketForm.setData('title', e.target.value)}
                                required
                            />
                            <InputError message={ticketForm.errors.title} className="mt-1" />
                        </div>

                        {/* Category & Priority */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="ticket_category" value="Kategori Masalah *" />
                                <select
                                    id="ticket_category"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                    value={ticketForm.data.category}
                                    onChange={(e) => ticketForm.setData('category', e.target.value)}
                                    required
                                >
                                    <option value="Hardware">Hardware (Komputer, Monitor, Mouse)</option>
                                    <option value="Network & Internet">Network & WiFi Internet</option>
                                    <option value="Printer & Scanner">Printer & Scanner</option>
                                    <option value="Software & OS">Software & Sistem Hotel (PMS/POS)</option>
                                    <option value="Email & Account">Email & Akun Karyawan</option>
                                    <option value="CCTV / Telepon">CCTV / PABX Telepon</option>
                                    <option value="Other">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="ticket_priority" value="Tingkat Urgensi *" />
                                <select
                                    id="ticket_priority"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                    value={ticketForm.data.priority}
                                    onChange={(e) => ticketForm.setData('priority', e.target.value as any)}
                                    required
                                >
                                    <option value="Low">Low - Tidak mengganggu operasional segera</option>
                                    <option value="Medium">Medium - Kendala normal, butuh penanganan</option>
                                    <option value="High">High - Mengganggu operasional departemen</option>
                                    <option value="Urgent">Urgent - Darurat! Berhenti operasional / melayani tamu</option>
                                </select>
                            </div>
                        </div>

                        {/* Location & Related Asset */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="ticket_location" value="Lokasi Kendala (Ruangan / Outlet)" />
                                <TextInput
                                    id="ticket_location"
                                    type="text"
                                    className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="Contoh: Front Desk 1, Restoran Swiss-Cafe, Meeting Siak Lt 2"
                                    value={ticketForm.data.location}
                                    onChange={(e) => ticketForm.setData('location', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="ticket_asset" value="Perangkat Terkait (Opsional)" />
                                <select
                                    id="ticket_asset"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                    value={ticketForm.data.it_asset_id}
                                    onChange={(e) => ticketForm.setData('it_asset_id', e.target.value)}
                                >
                                    <option value="">-- Pilih Perangkat Jika Ada --</option>
                                    {assetsList.map((ast) => (
                                        <option key={ast.id} value={ast.id}>
                                            {ast.asset_code} - {ast.name} ({ast.location || ast.category})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* If IT Manager: choose reporter */}
                        {isItManager && (
                            <div>
                                <InputLabel htmlFor="ticket_reporter" value="Pelapor Kendala (Karyawan)" />
                                <select
                                    id="ticket_reporter"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                    value={ticketForm.data.reported_by_employee_id}
                                    onChange={(e) => ticketForm.setData('reported_by_employee_id', e.target.value)}
                                >
                                    <option value="">-- Diri Sendiri ({currentUser.name}) --</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="ticket_desc" value="Deskripsi Lengkap Kendala *" />
                            <textarea
                                id="ticket_desc"
                                rows={4}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                placeholder="Jelaskan secara detail apa yang terjadi, pesan error yang muncul, atau tindakan yang sudah dicoba..."
                                value={ticketForm.data.description}
                                onChange={(e) => ticketForm.setData('description', e.target.value)}
                                required
                            />
                            <InputError message={ticketForm.errors.description} className="mt-1" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                        <SecondaryButton type="button" onClick={() => setIsCreateTicketOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={ticketForm.processing} className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-sm shadow-red-600/25">
                            {ticketForm.processing ? 'Mengirim...' : 'Kirim Laporan IT'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL 2: CREATE / EDIT ASSET (IT MANAGERS) */}
            <Modal show={isCreateAssetOpen} onClose={() => setIsCreateAssetOpen(false)} maxWidth="2xl">
                <form onSubmit={submitAsset} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg border border-red-200 shrink-0">
                                💻
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                                    IT Asset Inventory
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    {editingAsset ? 'Edit Data Asset IT' : 'Tambah Perangkat IT Baru'}
                                </h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateAssetOpen(false)}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm max-h-[70vh] overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="asset_code" value="Kode Asset IT *" />
                                <TextInput
                                    id="asset_code"
                                    type="text"
                                    className="mt-1 block w-full font-mono text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="Contoh: IT-PC-FO-01, IT-NET-AP-02"
                                    value={assetForm.data.asset_code}
                                    onChange={(e) => assetForm.setData('asset_code', e.target.value)}
                                    required
                                />
                                <InputError message={assetForm.errors.asset_code} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="asset_name" value="Nama Perangkat *" />
                                <TextInput
                                    id="asset_name"
                                    type="text"
                                    className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="Contoh: PC All-in-One HP ProOne 440 G9"
                                    value={assetForm.data.name}
                                    onChange={(e) => assetForm.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={assetForm.errors.name} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <InputLabel htmlFor="asset_category" value="Kategori Perangkat *" />
                                <select
                                    id="asset_category"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                    value={assetForm.data.category}
                                    onChange={(e) => assetForm.setData('category', e.target.value)}
                                    required
                                >
                                    <option value="Desktop / PC">Desktop / PC</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Printer / Scanner">Printer / Scanner</option>
                                    <option value="Network">Network (Switch/AP/Router)</option>
                                    <option value="CCTV / Security">CCTV / Security</option>
                                    <option value="POS Terminal">POS Terminal</option>
                                    <option value="Server">Server</option>
                                    <option value="Other">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="asset_brand" value="Brand / Merk" />
                                <TextInput
                                    id="asset_brand"
                                    type="text"
                                    className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="HP, Lenovo, Cisco, Ubiquiti, Epson"
                                    value={assetForm.data.brand}
                                    onChange={(e) => assetForm.setData('brand', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="asset_model" value="Model / Tipe" />
                                <TextInput
                                    id="asset_model"
                                    type="text"
                                    className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="ThinkPad E14, TM-T82X"
                                    value={assetForm.data.model}
                                    onChange={(e) => assetForm.setData('model', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <InputLabel htmlFor="asset_sn" value="Nomor Seri (Serial Number)" />
                                <TextInput
                                    id="asset_sn"
                                    type="text"
                                    className="mt-1 block w-full font-mono text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="S/N: PF-39XKL2"
                                    value={assetForm.data.serial_number}
                                    onChange={(e) => assetForm.setData('serial_number', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="asset_status" value="Status Kondisi *" />
                                <select
                                    id="asset_status"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                    value={assetForm.data.status}
                                    onChange={(e) => assetForm.setData('status', e.target.value)}
                                    required
                                >
                                    <option value="Available">Available (Tersedia / Standby)</option>
                                    <option value="In Use">In Use (Sedang Digunakan)</option>
                                    <option value="Maintenance">Maintenance (Dalam Perbaikan)</option>
                                    <option value="Disposed">Disposed (Afkir / Dihapus)</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel htmlFor="asset_ip" value="IP Address" />
                                <TextInput
                                    id="asset_ip"
                                    type="text"
                                    className="mt-1 block w-full font-mono text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="192.168.10.25"
                                    value={assetForm.data.ip_address}
                                    onChange={(e) => assetForm.setData('ip_address', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="asset_location" value="Lokasi Penempatan" />
                                <TextInput
                                    id="asset_location"
                                    type="text"
                                    className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="Front Office, Server Room Lt 2, Ballroom"
                                    value={assetForm.data.location}
                                    onChange={(e) => assetForm.setData('location', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="asset_employee" value="Karyawan Pengguna (Assigned)" />
                                <select
                                    id="asset_employee"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                    value={assetForm.data.assigned_to_employee_id}
                                    onChange={(e) => assetForm.setData('assigned_to_employee_id', e.target.value)}
                                >
                                    <option value="">-- Tanpa Karyawan Tertentu (Perangkat Bersama) --</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Specs */}
                        <div>
                            <InputLabel htmlFor="asset_specs" value="Spesifikasi Teknis (CPU, RAM, Storage, OS, dll)" />
                            <textarea
                                id="asset_specs"
                                rows={2}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                placeholder="Contoh: Intel Core i5-12500, 16GB RAM, 512GB NVMe, Win 11 Pro"
                                value={assetForm.data.specifications}
                                onChange={(e) => assetForm.setData('specifications', e.target.value)}
                            />
                        </div>

                        {/* Dates & Cost */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <InputLabel htmlFor="purchase_date" value="Tanggal Pembelian" />
                                <TextInput
                                    id="purchase_date"
                                    type="date"
                                    className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    value={assetForm.data.purchase_date}
                                    onChange={(e) => assetForm.setData('purchase_date', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="warranty_expiry" value="Garansi Berakhir" />
                                <TextInput
                                    id="warranty_expiry"
                                    type="date"
                                    className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    value={assetForm.data.warranty_expiry}
                                    onChange={(e) => assetForm.setData('warranty_expiry', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="purchase_cost" value="Harga Pembelian (IDR)" />
                                <TextInput
                                    id="purchase_cost"
                                    type="number"
                                    className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                    placeholder="Rp"
                                    value={assetForm.data.purchase_cost}
                                    onChange={(e) => assetForm.setData('purchase_cost', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel htmlFor="asset_notes" value="Catatan Tambahan" />
                            <textarea
                                id="asset_notes"
                                rows={2}
                                className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                placeholder="Catatan lisensi, kontak vendor servis, atau riwayat kerusakan..."
                                value={assetForm.data.notes}
                                onChange={(e) => assetForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                        <SecondaryButton type="button" onClick={() => setIsCreateAssetOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={assetForm.processing} className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-sm shadow-red-600/25">
                            {assetForm.processing ? 'Menyimpan...' : (editingAsset ? 'Simpan Perubahan' : 'Tambahkan Aset')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL 3: DELETE CONFIRMATION ASSET */}
            <Modal show={!!deletingAsset} onClose={() => setDeletingAsset(null)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">
                        Hapus Asset IT?
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus perangkat <strong className="text-gray-800">{deletingAsset?.asset_code} ({deletingAsset?.name})</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton onClick={() => setDeletingAsset(null)}>
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={confirmDeleteAsset}>
                            Ya, Hapus Asset
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* MODAL 4: QUICK STATUS UPDATE (IT MANAGERS) */}
            <Modal show={!!quickStatusTicket} onClose={() => setQuickStatusTicket(null)} maxWidth="lg">
                <form onSubmit={submitQuickStatus} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg border border-red-200 shrink-0">
                                ⚡
                            </div>
                            <div>
                                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                                    {quickStatusTicket?.ticket_number}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                    Update Cepat Status Tiket IT
                                </h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setQuickStatusTicket(null)}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm">
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                            <div className="font-semibold text-gray-900">
                                {quickStatusTicket?.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Pelapor: {quickStatusTicket?.reporter?.user?.name || (quickStatusTicket?.reporter ? `Emp #${quickStatusTicket.reporter.employee_number}` : '-')} ({quickStatusTicket?.location || '-'})
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="quick_status" value="Ubah Status *" />
                            <select
                                id="quick_status"
                                className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                value={statusForm.data.status}
                                onChange={(e) => statusForm.setData('status', e.target.value)}
                                required
                            >
                                <option value="Open">Open (Baru)</option>
                                <option value="In Progress">In Progress (Sedang Dikerjakan)</option>
                                <option value="Pending Parts">Pending Parts (Menunggu Spare Part/Vendor)</option>
                                <option value="Resolved">Resolved (Masalah Terselesaikan)</option>
                                <option value="Closed">Closed (Selesai & Ditutup)</option>
                            </select>
                        </div>

                        {isItManager && (
                            <div>
                                <InputLabel htmlFor="quick_assigned" value="Tugaskan Teknisi IT" />
                                <select
                                    id="quick_assigned"
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
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
                                <InputLabel htmlFor="resolution_notes" value="Catatan Solusi / Penyelesaian" />
                                <textarea
                                    id="resolution_notes"
                                    rows={2}
                                    className="mt-1 block w-full rounded-xl border-gray-300 text-xs sm:text-sm focus:border-red-500 focus:ring-red-500"
                                    placeholder="Jelaskan tindakan perbaikan yang telah dilakukan..."
                                    value={statusForm.data.resolution_notes}
                                    onChange={(e) => statusForm.setData('resolution_notes', e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="update_msg" value="Pesan Perkembangan (Tercatat di Timeline)" />
                            <TextInput
                                id="update_msg"
                                type="text"
                                className="mt-1 block w-full text-xs sm:text-sm rounded-xl border-gray-300 focus:border-red-500 focus:ring-red-500"
                                placeholder="Contoh: Teknisi sedang memeriksa kabel LAN di lokasi..."
                                value={statusForm.data.notes}
                                onChange={(e) => statusForm.setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                        <SecondaryButton type="button" onClick={() => setQuickStatusTicket(null)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={statusForm.processing} className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-sm shadow-red-600/25">
                            {statusForm.processing ? 'Menyimpan...' : 'Perbarui Status'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
