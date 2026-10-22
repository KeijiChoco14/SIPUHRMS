import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';
import Badge from '@/Components/Badge';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import BorrowRoomModal from './Partials/BorrowRoomModal';
import ReturnRequestModal from './Partials/ReturnRequestModal';
import SecurityConfirmReturnModal from './Partials/SecurityConfirmReturnModal';
import RoomModal from './Partials/RoomModal';
import QrCodeModal from './Partials/QrCodeModal';

interface Room {
    id: number;
    room_number: string;
    name: string;
    location?: string;
    capacity?: number;
    description?: string;
    key_code?: string;
    status: 'AVAILABLE' | 'BORROWED' | 'PENDING_RETURN';
    is_active: boolean;
    transactions_count?: number;
    active_transaction?: {
        id: number;
        transaction_number: string;
        borrowed_at: string;
        expected_duration_hours?: number;
        expected_return_at?: string;
        purpose?: string;
        borrower?: {
            id: number;
            employee_number: string;
            user?: {
                id: number;
                name: string;
                email: string;
            };
            department?: {
                id: number;
                name: string;
            };
        };
    };
}

interface Transaction {
    id: number;
    transaction_number: string;
    room_id: number;
    borrower_employee_id: number;
    borrowed_at: string;
    expected_duration_hours?: number;
    expected_return_at?: string;
    purpose?: string;
    status: 'BORROWED' | 'PENDING_RETURN' | 'RETURNED' | 'CANCELLED';
    return_requested_at?: string;
    return_notes?: string;
    returned_at?: string;
    security_user_id?: number;
    security_notes?: string;
    room: {
        id: number;
        room_number: string;
        name: string;
        location?: string;
        key_code?: string;
    };
    borrower?: {
        id: number;
        employee_number: string;
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
    };
    security_user?: {
        id: number;
        name: string;
    };
}

interface RoomBorrowingProps {
    rooms: Room[];
    stats: {
        total: number;
        available: number;
        borrowed: number;
        pending_return: number;
    };
    myActiveBorrowings: Transaction[];
    myHistory: Transaction[];
    pendingReturns: Transaction[];
    recentAuditTransactions: Transaction[];
    allRoomsForAdmin: Room[];
    filters: {
        search: string;
        status: string;
        tab: string;
    };
    permissions: {
        can_borrow: boolean;
        can_approve_return: boolean;
        can_manage_rooms: boolean;
        is_security: boolean;
    };
    qrUrl: string;
}

export default function Index({
    rooms = [],
    stats = { total: 0, available: 0, borrowed: 0, pending_return: 0 },
    myActiveBorrowings = [],
    myHistory = [],
    pendingReturns = [],
    recentAuditTransactions = [],
    allRoomsForAdmin = [],
    filters = { search: '', status: 'ALL', tab: 'catalog' },
    permissions,
    qrUrl,
}: RoomBorrowingProps) {
    const { flash } = usePage().props as any;

    const [activeTab, setActiveTab] = useState<'catalog' | 'my-borrowings' | 'pending-returns' | 'manage-rooms'>(
        (filters.tab as any) || 'catalog'
    );

    useEffect(() => {
        if (filters.tab) {
            setActiveTab(filters.tab as any);
        }
    }, [filters.tab]);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'ALL');

    // Modals state
    const [borrowModalOpen, setBorrowModalOpen] = useState(false);
    const [selectedRoomToBorrow, setSelectedRoomToBorrow] = useState<Room | null>(null);

    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedTxToReturn, setSelectedTxToReturn] = useState<Transaction | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedTxToConfirm, setSelectedTxToConfirm] = useState<Transaction | null>(null);

    const [roomModalOpen, setRoomModalOpen] = useState(false);
    const [selectedRoomToEdit, setSelectedRoomToEdit] = useState<Room | null>(null);

    const [qrModalOpen, setQrModalOpen] = useState(false);

    // Filtered rooms for catalog
    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            const matchesSearch =
                !searchQuery ||
                room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (room.location && room.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (room.key_code && room.key_code.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'ALL' || room.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [rooms, searchQuery, statusFilter]);

    const handleOpenBorrow = (room: Room) => {
        setSelectedRoomToBorrow(room);
        setBorrowModalOpen(true);
    };

    const handleOpenReturn = (tx: Transaction) => {
        setSelectedTxToReturn(tx);
        setReturnModalOpen(true);
    };

    const handleOpenConfirm = (tx: Transaction) => {
        setSelectedTxToConfirm(tx);
        setConfirmModalOpen(true);
    };

    const handleOpenCreateRoom = () => {
        setSelectedRoomToEdit(null);
        setRoomModalOpen(true);
    };

    const handleOpenEditRoom = (room: Room) => {
        setSelectedRoomToEdit(room);
        setRoomModalOpen(true);
    };

    const handleToggleRoom = (room: Room) => {
        if (confirm(`Are you sure you want to ${room.is_active ? 'deactivate' : 'activate'} room "${room.name}"?`)) {
            router.patch(route('room-borrowing.rooms.toggle', room.id));
        }
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateElapsedTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const diffMs = new Date().getTime() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Room & Key Borrowing - SIPU Swiss-Belinn SKA" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-xs flex items-center justify-between text-emerald-800 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-xs flex items-center justify-between text-rose-800 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">{flash.error}</span>
                        </div>
                    </div>
                )}

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Room Borrowing & Key Management
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Hotel room availability catalog, key loan logs, and physical return verification at Security post.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        {/* QR Code Stand Button */}
                        <button
                            type="button"
                            onClick={() => setQrModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
                            title="Display & Print Shared QR Code for Security Post"
                        >
                            <svg className="w-4 h-4 text-[#E31B23]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            <span>Security Post QR Code</span>
                        </button>

                        {/* Admin Add Room Button */}
                        {permissions.can_manage_rooms && (
                            <PrimaryButton
                                type="button"
                                onClick={handleOpenCreateRoom}
                                className="bg-[#E31B23] hover:bg-[#C4141B]"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Room</span>
                            </PrimaryButton>
                        )}
                    </div>
                </div>

                {/* Metrics Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Rooms */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rooms</span>
                            <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{stats.total}</div>
                            <span className="text-[11px] text-slate-400">Registered in hotel</span>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>

                    {/* Available Keys */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available</span>
                            <div className="mt-1 text-2xl font-bold text-emerald-600 tabular-nums">{stats.available}</div>
                            <span className="text-[11px] text-emerald-600 font-medium">Keys ready to loan</span>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Borrowed Keys */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Borrowed</span>
                            <div className="mt-1 text-2xl font-bold text-rose-600 tabular-nums">{stats.borrowed}</div>
                            <span className="text-[11px] text-rose-600 font-medium">Keys with staff</span>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                    </div>

                    {/* Pending Return Keys */}
                    <div className={`bg-white rounded-2xl border p-4 shadow-xs flex items-center justify-between transition-colors ${
                        stats.pending_return > 0 ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
                    }`}>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Return</span>
                                {stats.pending_return > 0 && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                )}
                            </div>
                            <div className="mt-1 text-2xl font-bold text-amber-600 tabular-nums">{stats.pending_return}</div>
                            <span className="text-[11px] text-amber-700 font-medium">Physical check at post</span>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>



                {/* ═══════════════════════════════════════════════════════════════════════════
                    TAB 1: ROOM CATALOG
                ═══════════════════════════════════════════════════════════════════════════ */}
                {activeTab === 'catalog' && (
                    <div className="space-y-4">
                        {/* Search & Status Filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                            <div className="relative flex-1 max-w-md">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search room name, number, location, key code..."
                                    className="block w-full pl-9 pr-8 py-2 rounded-xl border-slate-200 text-sm focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] placeholder:text-slate-400"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Status Filter Buttons */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('ALL')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                                        statusFilter === 'ALL'
                                            ? 'bg-slate-900 text-white shadow-2xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    All ({rooms.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('AVAILABLE')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                                        statusFilter === 'AVAILABLE'
                                            ? 'bg-emerald-600 text-white shadow-2xs'
                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                >
                                    Available ({stats.available})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('BORROWED')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                                        statusFilter === 'BORROWED'
                                            ? 'bg-rose-600 text-white shadow-2xs'
                                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                >
                                    Borrowed ({stats.borrowed})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('PENDING_RETURN')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                                        statusFilter === 'PENDING_RETURN'
                                            ? 'bg-amber-600 text-white shadow-2xs'
                                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    }`}
                                >
                                    Pending Return ({stats.pending_return})
                                </button>
                            </div>
                        </div>

                        {/* Room Catalog Grid */}
                        {filteredRooms.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-800">No rooms found</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                    {searchQuery
                                        ? `No rooms matched the search keyword "${searchQuery}". Try another keyword.`
                                        : 'No rooms found under this status filter.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredRooms.map((room) => {
                                    const isAvailable = room.status === 'AVAILABLE';
                                    const isBorrowed = room.status === 'BORROWED';
                                    const isPendingReturn = room.status === 'PENDING_RETURN';
                                    const activeTx = room.active_transaction;

                                    return (
                                        <div
                                            key={room.id}
                                            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                                        >
                                            {/* Room Card Header */}
                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-3 mb-2.5">
                                                    <div>
                                                        <span className="font-mono text-xs font-bold text-[#E31B23] tracking-wide block">
                                                            {room.room_number}
                                                        </span>
                                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#E31B23] transition-colors leading-snug">
                                                            {room.name}
                                                        </h3>
                                                    </div>

                                                    <div>
                                                        {isAvailable && (
                                                            <Badge variant="success" dot size="sm">
                                                                Available
                                                            </Badge>
                                                        )}
                                                        {isBorrowed && (
                                                            <Badge variant="danger" dot size="sm">
                                                                Borrowed
                                                            </Badge>
                                                        )}
                                                        {isPendingReturn && (
                                                            <Badge variant="warning" dot size="sm">
                                                                Pending Return
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                                                    {room.description || 'Standard operational room facilities at Swiss-Belinn SKA.'}
                                                </p>

                                                {/* Meta Info */}
                                                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-400">Location:</span>
                                                        <span className="font-semibold text-slate-800">{room.location || 'Hotel Area'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-400">Capacity:</span>
                                                        <span className="font-semibold text-slate-800 tabular-nums">
                                                            {room.capacity ? `${room.capacity} Pax` : 'Flexible'}
                                                        </span>
                                                    </div>
                                                    {room.key_code && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-400">Key Tag:</span>
                                                            <span className="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                                                                {room.key_code}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Borrower context when not available */}
                                                {(isBorrowed || isPendingReturn) && activeTx && (
                                                    <div className={`mt-3.5 p-3 rounded-xl border text-xs leading-tight ${
                                                        isPendingReturn
                                                            ? 'bg-amber-50/70 border-amber-200/70 text-amber-900'
                                                            : 'bg-rose-50/60 border-rose-200/60 text-rose-900'
                                                    }`}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-semibold text-[11px] uppercase tracking-wider opacity-75">
                                                                {isPendingReturn ? 'Return in Progress' : 'Current Borrower'}
                                                            </span>
                                                            <span className="font-semibold tabular-nums text-[10px]">
                                                                {calculateElapsedTime(activeTx.borrowed_at)}
                                                            </span>
                                                        </div>
                                                        <div className="font-bold text-slate-900 truncate">
                                                            {activeTx.borrower?.user?.name || 'Hotel Employee'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                            {activeTx.borrower?.department?.name || 'Department'} • {activeTx.borrower?.employee_number}
                                                        </div>
                                                        {activeTx.purpose && (
                                                            <div className="mt-1 text-[11px] italic truncate text-slate-600">
                                                                "{activeTx.purpose}"
                                                            </div>
                                                        )}
                                                        {activeTx.expected_duration_hours && (
                                                            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                                                                <span className="font-medium text-slate-600">
                                                                    Duration: {activeTx.expected_duration_hours}h
                                                                </span>
                                                                {activeTx.expected_return_at && (
                                                                    <span className="font-semibold text-slate-800 tabular-nums">
                                                                        Due: {formatDateTime(activeTx.expected_return_at)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Room Card Footer / Action */}
                                            <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                                                <div className="text-[11px] text-slate-400 font-mono">
                                                    #{room.room_number}
                                                </div>

                                                {isAvailable ? (
                                                    <PrimaryButton
                                                        type="button"
                                                        onClick={() => handleOpenBorrow(room)}
                                                        disabled={!permissions.can_borrow}
                                                        className="bg-[#E31B23] hover:bg-[#C4141B] px-3.5 py-1.5 text-xs shadow-xs"
                                                    >
                                                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                        </svg>
                                                        Borrow Key
                                                    </PrimaryButton>
                                                ) : isBorrowed ? (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                                                        Key Borrowed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                                                        Awaiting Security
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════════════
                    TAB 2: MY BORROWINGS
                ═══════════════════════════════════════════════════════════════════════════ */}
                {activeTab === 'my-borrowings' && (
                    <div className="space-y-6">
                        {/* Active Borrowing Section */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Keys Currently in Your Possession</h2>
                                    <p className="text-xs text-slate-500">
                                        Your active key loan transactions. Please request return promptly after your schedule concludes.
                                    </p>
                                </div>
                                <span className="bg-red-50 text-[#E31B23] px-2.5 py-1 rounded-full text-xs font-bold border border-red-100 tabular-nums">
                                    {myActiveBorrowings.length} Active
                                </span>
                            </div>

                            {myActiveBorrowings.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">No active borrowings</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        You do not currently have any borrowed room keys.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {myActiveBorrowings.map((tx) => {
                                        const isBorrowed = tx.status === 'BORROWED';
                                        const isPending = tx.status === 'PENDING_RETURN';

                                        return (
                                            <div key={tx.id} className="p-5 sm:flex sm:items-center sm:justify-between gap-4">
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="font-mono text-xs font-bold text-[#E31B23]">
                                                            {tx.room.room_number}
                                                        </span>
                                                        <h3 className="text-base font-bold text-slate-900">{tx.room.name}</h3>
                                                        {isBorrowed ? (
                                                            <Badge variant="danger" dot size="sm">Borrowed</Badge>
                                                        ) : (
                                                            <Badge variant="warning" dot size="sm">Awaiting Security Confirmation</Badge>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pt-1">
                                                        <div>
                                                            <span className="text-slate-400 block">Borrowed At:</span>
                                                            <span className="font-semibold text-slate-800 tabular-nums">
                                                                {formatDateTime(tx.borrowed_at)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Duration / Due:</span>
                                                            <span className="font-semibold text-slate-800 tabular-nums">
                                                                {tx.expected_duration_hours ? `${tx.expected_duration_hours} Hour(s)` : '-'}
                                                                {tx.expected_return_at && (
                                                                    <span className="block text-[11px] text-slate-500 font-normal">
                                                                        Due: {formatDateTime(tx.expected_return_at)}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block">Transaction No:</span>
                                                            <span className="font-mono text-slate-700">{tx.transaction_number}</span>
                                                        </div>
                                                        {tx.room.key_code && (
                                                            <div>
                                                                <span className="text-slate-400 block">Key Tag:</span>
                                                                <span className="font-mono font-bold text-slate-800">{tx.room.key_code}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {tx.purpose && (
                                                        <div className="text-xs text-slate-600 pt-1">
                                                            <span className="text-slate-400">Purpose: </span>
                                                            <span className="italic">"{tx.purpose}"</span>
                                                        </div>
                                                    )}

                                                    {isPending && (
                                                        <div className="mt-2 text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200/70 flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>
                                                                Return request submitted at{' '}
                                                                <strong className="tabular-nums">{formatDateTime(tx.return_requested_at)}</strong>. Please hand over the physical key to the officer at the Security post.
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-4 sm:mt-0 shrink-0">
                                                    {isBorrowed ? (
                                                        <PrimaryButton
                                                            type="button"
                                                            onClick={() => handleOpenReturn(tx)}
                                                            className="bg-[#E31B23] hover:bg-[#C4141B]"
                                                        >
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                            </svg>
                                                            Request Key Return
                                                        </PrimaryButton>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                            Awaiting Security Post
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Return History Section */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-base font-bold text-slate-900">Completed Return History</h2>
                                <p className="text-xs text-slate-500">
                                    Record of room keys whose physical return has been verified by Security officers.
                                </p>
                            </div>

                            {myHistory.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    No completed return history recorded yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3">Transaction No</th>
                                                <th className="px-6 py-3">Room</th>
                                                <th className="px-6 py-3">Borrowed At</th>
                                                <th className="px-6 py-3">Returned At</th>
                                                <th className="px-6 py-3">Security Officer</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {myHistory.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-3.5 font-mono text-slate-600">{tx.transaction_number}</td>
                                                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                                                        {tx.room.room_number} - {tx.room.name}
                                                    </td>
                                                    <td className="px-6 py-3.5 tabular-nums text-slate-600">{formatDateTime(tx.borrowed_at)}</td>
                                                    <td className="px-6 py-3.5 tabular-nums text-slate-600">{formatDateTime(tx.returned_at)}</td>
                                                    <td className="px-6 py-3.5 font-medium text-slate-800">
                                                        {tx.security_user?.name || 'Security Officer'}
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <Badge variant="success" size="sm">Completed</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════════════
                    TAB 3: SECURITY RETURN QUEUE
                ═══════════════════════════════════════════════════════════════════════════ */}
                {activeTab === 'pending-returns' && permissions.can_approve_return && (
                    <div className="space-y-6">
                        {/* Pending Verification Queue */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                        !
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Physical Key Return Confirmation Queue
                                        </h2>
                                        <p className="text-xs text-slate-500">
                                            Physically verify that the hotel room key has been handed over at the Security post before completing the transaction.
                                        </p>
                                    </div>
                                </div>
                                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold tabular-nums">
                                    {pendingReturns.length} Pending Verification
                                </span>
                            </div>

                            {pendingReturns.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">Queue is Clear</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        All key returns have been verified. There are no pending return requests at this time.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {pendingReturns.map((tx) => (
                                        <div key={tx.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-[#E31B23]">
                                                        {tx.room.room_number}
                                                    </span>
                                                    <h3 className="text-base font-bold text-slate-900">
                                                        {tx.room.name}
                                                    </h3>
                                                    {tx.room.key_code && (
                                                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                            {tx.room.key_code}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                                        Requested {calculateElapsedTime(tx.return_requested_at)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-slate-600">
                                                    <div>
                                                        <span className="text-slate-400 block">Borrower:</span>
                                                        <span className="font-semibold text-slate-800">{tx.borrower?.user?.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Department:</span>
                                                        <span className="text-slate-700">{tx.borrower?.department?.name}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Borrowed At:</span>
                                                        <span className="font-semibold text-slate-700 tabular-nums">{formatDateTime(tx.borrowed_at)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Duration / Due:</span>
                                                        <span className="font-semibold text-slate-700 tabular-nums">
                                                            {tx.expected_duration_hours ? `${tx.expected_duration_hours}h` : '-'}
                                                            {tx.expected_return_at && (
                                                                <span className="block text-[11px] text-slate-500 font-normal">
                                                                    {formatDateTime(tx.expected_return_at)}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">Requested At:</span>
                                                        <span className="font-semibold text-slate-700 tabular-nums">{formatDateTime(tx.return_requested_at)}</span>
                                                    </div>
                                                </div>

                                                {tx.purpose && (
                                                    <div className="text-xs text-slate-600">
                                                        <span className="text-slate-400">Purpose: </span>
                                                        <span className="italic">"{tx.purpose}"</span>
                                                    </div>
                                                )}

                                                {tx.return_notes && (
                                                    <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                                                        <span className="font-medium text-slate-500">Borrower Notes: </span>
                                                        "{tx.return_notes}"
                                                    </div>
                                                )}
                                            </div>

                                            <div className="shrink-0 flex items-center gap-2">
                                                <PrimaryButton
                                                    type="button"
                                                    onClick={() => handleOpenConfirm(tx)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm"
                                                >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Confirm Key Receipt
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Completed Confirmations Audit Log */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-base font-bold text-slate-900">Security Verified Return Audit Log</h2>
                                <p className="text-xs text-slate-500">
                                    Audit trail of physical room key handovers completed by Security personnel.
                                </p>
                            </div>

                            {recentAuditTransactions.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    No completed return transactions logged yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3">Transaction No</th>
                                                <th className="px-6 py-3">Room</th>
                                                <th className="px-6 py-3">Borrower</th>
                                                <th className="px-6 py-3">Borrowed At</th>
                                                <th className="px-6 py-3">Received At</th>
                                                <th className="px-6 py-3">Security Officer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {recentAuditTransactions.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="px-6 py-3.5 font-mono text-slate-600">{tx.transaction_number}</td>
                                                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                                                        {tx.room.room_number} - {tx.room.name}
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <div className="font-semibold text-slate-800">{tx.borrower?.user?.name}</div>
                                                        <div className="text-[11px] text-slate-400">{tx.borrower?.department?.name}</div>
                                                    </td>
                                                    <td className="px-6 py-3.5 tabular-nums text-slate-600">{formatDateTime(tx.borrowed_at)}</td>
                                                    <td className="px-6 py-3.5 tabular-nums text-slate-600">{formatDateTime(tx.returned_at)}</td>
                                                    <td className="px-6 py-3.5 font-medium text-emerald-800">
                                                        {tx.security_user?.name || 'Security Officer'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════════════════
                    TAB 4: MANAGE ROOMS (ADMIN)
                ═══════════════════════════════════════════════════════════════════════════ */}
                {activeTab === 'manage-rooms' && permissions.can_manage_rooms && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Hotel Room Inventory</h2>
                                <p className="text-xs text-slate-500">
                                    Master list of hotel rooms, locations, capacities, and physical key codes.
                                </p>
                            </div>
                            <PrimaryButton
                                type="button"
                                onClick={handleOpenCreateRoom}
                                className="bg-[#E31B23] hover:bg-[#C4141B]"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Room
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Code</th>
                                        <th className="px-6 py-3">Room Name</th>
                                        <th className="px-6 py-3">Location</th>
                                        <th className="px-6 py-3">Capacity</th>
                                        <th className="px-6 py-3">Key Tag</th>
                                        <th className="px-6 py-3">Current Status</th>
                                        <th className="px-6 py-3">Active</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {allRoomsForAdmin.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-3.5 font-mono font-bold text-[#E31B23]">{r.room_number}</td>
                                            <td className="px-6 py-3.5 font-semibold text-slate-900">{r.name}</td>
                                            <td className="px-6 py-3.5 text-slate-600">{r.location || '-'}</td>
                                            <td className="px-6 py-3.5 tabular-nums text-slate-600">{r.capacity ? `${r.capacity} Pax` : '-'}</td>
                                            <td className="px-6 py-3.5 font-mono text-slate-700">{r.key_code || '-'}</td>
                                            <td className="px-6 py-3.5">
                                                {r.status === 'AVAILABLE' && <Badge variant="success" size="sm">Available</Badge>}
                                                {r.status === 'BORROWED' && <Badge variant="danger" size="sm">Borrowed</Badge>}
                                                {r.status === 'PENDING_RETURN' && <Badge variant="warning" size="sm">Pending Return</Badge>}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleRoom(r)}
                                                    className={`px-2 py-0.5 rounded-full font-semibold text-[11px] transition-colors ${
                                                        r.is_active
                                                             ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                             : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                                    }`}
                                                >
                                                    {r.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditRoom(r)}
                                                    className="font-medium text-indigo-600 hover:text-indigo-900 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-50"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <BorrowRoomModal
                show={borrowModalOpen}
                onClose={() => setBorrowModalOpen(false)}
                room={selectedRoomToBorrow}
            />

            <ReturnRequestModal
                show={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
                transaction={selectedTxToReturn}
            />

            <SecurityConfirmReturnModal
                show={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                transaction={selectedTxToConfirm}
            />

            <RoomModal
                show={roomModalOpen}
                onClose={() => setRoomModalOpen(false)}
                room={selectedRoomToEdit}
            />

            <QrCodeModal
                show={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                qrUrl={qrUrl}
            />
        </AuthenticatedLayout>
    );
}
