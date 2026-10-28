import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Badge from '@/Components/Badge';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';

interface AttendanceItem {
    id: number;
    employee_id: number;
    shift_id?: number | null;
    date: string;
    clock_in: string | null;
    clock_out: string | null;
    clock_in_at?: string | null;
    clock_out_at?: string | null;
    clock_in_latitude?: number | null;
    clock_in_longitude?: number | null;
    clock_in_accuracy?: number | null;
    clock_in_distance?: number | null;
    clock_out_latitude?: number | null;
    clock_out_longitude?: number | null;
    clock_out_accuracy?: number | null;
    clock_out_distance?: number | null;
    status: string;
    is_late: boolean;
    late_duration_minutes: number;
    early_leave_minutes: number;
    overtime_minutes: number;
    source: string;
    notes?: string | null;
    correction_reason?: string | null;
    corrected_at?: string | null;
    employee?: {
        id: number;
        employee_number: string;
        user?: {
            id: number;
            name: string;
            email: string;
            profile_photo_url?: string;
        };
        department?: {
            id: number;
            name: string;
        };
    };
    shift?: {
        id: number;
        name: string;
        code?: string;
        start_time: string;
        end_time: string;
        color?: string;
    };
    corrected_by_user?: {
        name: string;
    };
    events?: Array<{
        id: number;
        event_type: string;
        status: string;
        reason?: string | null;
        notes?: string | null;
        distance?: number | null;
        accuracy?: number | null;
        created_at: string;
    }>;
}

interface LocationConfig {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    min_accuracy_meters: number;
    is_active: boolean;
}

interface Props {
    attendances: AttendanceItem[];
    selectedDate: string;
    startDate: string;
    endDate: string;
    filters: {
        department_id?: string;
        employee_id?: string;
        shift_id?: string;
        status?: string;
        search?: string;
    };
    summary: {
        total_scheduled: number;
        total_clocked_in: number;
        total_late: number;
        total_unclosed: number;
    };
    departments: Array<{ id: number; name: string }>;
    shifts: Array<{ id: number; name: string; code?: string; start_time: string; end_time: string }>;
    employees: Array<{ id: number; user_id: number; employee_number: string; user?: { id: number; name: string } }>;
    location: LocationConfig;
}

export default function AttendanceIndex({
    attendances,
    selectedDate,
    startDate,
    endDate,
    filters,
    summary,
    departments,
    shifts,
    employees,
    location,
}: Props) {
    const [filterStart, setFilterStart] = useState(startDate);
    const [filterEnd, setFilterEnd] = useState(endDate);
    const [filterDept, setFilterDept] = useState(filters.department_id || '');
    const [filterShift, setFilterShift] = useState(filters.shift_id || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Modals
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState<AttendanceItem | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

    // Form: Geofencing Location Update
    const locationForm = useForm({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        radius_meters: location.radius_meters,
        min_accuracy_meters: location.min_accuracy_meters,
        is_active: location.is_active,
    });

    // Form: Manual Attendance Correction
    const correctionForm = useForm({
        clock_in: '',
        clock_out: '',
        status: 'Present',
        late_duration_minutes: 0,
        overtime_minutes: 0,
        correction_reason: '',
    });

    const handleApplyFilters = () => {
        router.get(
            route('attendance.index'),
            {
                start_date: filterStart,
                end_date: filterEnd,
                department_id: filterDept || undefined,
                shift_id: filterShift || undefined,
                status: filterStatus || undefined,
                search: searchTerm || undefined,
            },
            { preserveState: true }
        );
    };

    const handleResetFilters = () => {
        setFilterStart(new Date().toISOString().split('T')[0]);
        setFilterEnd(new Date().toISOString().split('T')[0]);
        setFilterDept('');
        setFilterShift('');
        setFilterStatus('');
        setSearchTerm('');
        router.get(route('attendance.index'), {}, { preserveState: true });
    };

    const handleLocationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        locationForm.patch(route('attendance.location.update'), {
            onSuccess: () => setIsLocationModalOpen(false),
        });
    };

    const openCorrectionModal = (item: AttendanceItem) => {
        setSelectedAttendance(item);
        correctionForm.setData({
            clock_in: item.clock_in ? item.clock_in.substring(0, 5) : '',
            clock_out: item.clock_out ? item.clock_out.substring(0, 5) : '',
            status: item.status,
            late_duration_minutes: item.late_duration_minutes || 0,
            overtime_minutes: item.overtime_minutes || 0,
            correction_reason: '',
        });
        setIsCorrectionModalOpen(true);
    };

    const handleCorrectionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAttendance) return;

        correctionForm.patch(route('attendance.correct', selectedAttendance.id), {
            onSuccess: () => {
                setIsCorrectionModalOpen(false);
                correctionForm.reset();
            },
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Present':
                return 'success';
            case 'Late':
                return 'warning';
            case 'Absent':
                return 'danger';
            case 'Leave':
                return 'info';
            case 'Off':
            default:
                return 'neutral';
        }
    };

    const exportUrl = route('attendance.export', {
        start_date: filterStart,
        end_date: filterEnd,
        department_id: filterDept || undefined,
        status: filterStatus || undefined,
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-bold text-xl text-slate-900 tracking-tight">Attendance & Geofencing Management</h2>
                        <p className="text-xs text-slate-500">Monitor employee check-ins, shift punctuality, and GPS geofence audit logs.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={exportUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                        >
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export CSV
                        </a>
                        <button
                            type="button"
                            onClick={() => setIsLocationModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Geofencing Settings
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Attendance Logs & Reports" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* TOP SUMMARY STAT CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Scheduled Roster</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-slate-900">{summary.total_scheduled}</span>
                                <span className="text-[11px] text-slate-500">Employees</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                            <span className="text-emerald-600 block text-[10px] uppercase font-bold tracking-wider">Clocked In</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-emerald-600">{summary.total_clocked_in}</span>
                                <span className="text-[11px] text-slate-500">Recorded</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                            <span className="text-amber-600 block text-[10px] uppercase font-bold tracking-wider">Late Arrivals</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-amber-600">{summary.total_late}</span>
                                <span className="text-[11px] text-slate-500">Employees</span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                            <span className="text-blue-600 block text-[10px] uppercase font-bold tracking-wider">In Progress / Unclosed</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-blue-600">{summary.total_unclosed}</span>
                                <span className="text-[11px] text-slate-500">No Clock Out Yet</span>
                            </div>
                        </div>
                    </div>

                    {/* FILTERS PANEL */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={filterStart}
                                    onChange={(e) => setFilterStart(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-xs py-2 px-3 shadow-2xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={filterEnd}
                                    onChange={(e) => setFilterEnd(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-xs py-2 px-3 shadow-2xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Department</label>
                                <select
                                    value={filterDept}
                                    onChange={(e) => setFilterDept(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-xs py-2 px-3 shadow-2xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Shift</label>
                                <select
                                    value={filterShift}
                                    onChange={(e) => setFilterShift(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-xs py-2 px-3 shadow-2xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                                >
                                    <option value="">All Shifts</option>
                                    {shifts.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.code ? `(${s.code})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-xs py-2 px-3 shadow-2xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                    <option value="Off">Off</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-600 font-semibold mb-1">Search Employee</label>
                                <input
                                    type="text"
                                    placeholder="Name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 text-xs py-2 px-3 shadow-2xs focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="px-4 py-1.5 rounded-lg bg-[#E31B23] hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* ATTENDANCE RECORDS TABLE */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Attendance Records Log</h3>
                                <p className="text-xs text-slate-500">Showing {attendances.length} records matching current criteria.</p>
                            </div>
                            <span className="text-xs font-mono text-slate-400">
                                Geofence Target: {location.radius_meters}m Radius
                            </span>
                        </div>

                        {attendances && attendances.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                                        <tr>
                                            <th className="px-5 py-3.5">Employee</th>
                                            <th className="px-5 py-3.5">Department</th>
                                            <th className="px-5 py-3.5">Shift</th>
                                            <th className="px-5 py-3.5 text-center">Clock In</th>
                                            <th className="px-5 py-3.5 text-center">Clock Out</th>
                                            <th className="px-5 py-3.5 text-center">Status</th>
                                            <th className="px-5 py-3.5 text-center">Late / OT</th>
                                            <th className="px-5 py-3.5">GPS Distance</th>
                                            <th className="px-5 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium">
                                        {attendances.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-600">
                                                            {item.employee?.user?.name ? item.employee.user.name.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-900 block">
                                                                {item.employee?.user?.name || 'Unknown'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                {item.employee?.employee_number || '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                                                    {item.employee?.department?.name || '-'}
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                                                    {item.shift ? (
                                                        <span className="font-semibold text-slate-800">
                                                            {item.shift.name} {item.shift.code ? `(${item.shift.code})` : ''}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">Regular</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                                                    {item.clock_in ? item.clock_in.substring(0, 5) : '-'}
                                                </td>
                                                <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                                                    {item.clock_out ? item.clock_out.substring(0, 5) : '-'}
                                                </td>
                                                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                    <Badge variant={getStatusVariant(item.status)} dot>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-3.5 text-center tabular-nums whitespace-nowrap">
                                                    {item.late_duration_minutes > 0 ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                                                            {item.late_duration_minutes}m late
                                                        </span>
                                                    ) : item.overtime_minutes > 0 ? (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                            {item.overtime_minutes}m OT
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                                    {item.clock_in_distance !== undefined && item.clock_in_distance !== null ? (
                                                        <span className={`inline-flex items-center gap-1 font-semibold ${
                                                            item.clock_in_distance <= location.radius_meters ? 'text-emerald-700' : 'text-rose-700'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                                item.clock_in_distance <= location.radius_meters ? 'bg-emerald-500' : 'bg-rose-500'
                                                            }`}></span>
                                                            {item.clock_in_distance}m
                                                        </span>
                                                    ) : (
                                                        item.source || '-'
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedAttendance(item);
                                                                setIsDetailModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                                            title="View GPS & Audit Details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openCorrectionModal(item)}
                                                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                                                            title="HR Manual Correction"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-400 text-xs">
                                No attendance records found matching current date and filters.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL 1: GEOFENCING CONFIGURATION */}
            <Modal show={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} maxWidth="md">
                <form onSubmit={handleLocationSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Hotel Geofencing Configuration</h3>
                            <p className="text-xs text-slate-500">Configure Swiss-Belinn SKA Pekanbaru attendance radius & GPS tolerance.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLocationModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                        <div>
                            <InputLabel value="Location Name *" />
                            <TextInput
                                className="mt-1 block w-full text-xs"
                                value={locationForm.data.name}
                                onChange={(e) => locationForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={locationForm.errors.name} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Latitude *" />
                                <TextInput
                                    type="number"
                                    step="any"
                                    className="mt-1 block w-full text-xs font-mono"
                                    value={locationForm.data.latitude}
                                    onChange={(e) => locationForm.setData('latitude', parseFloat(e.target.value))}
                                    required
                                />
                                <InputError message={locationForm.errors.latitude} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Longitude *" />
                                <TextInput
                                    type="number"
                                    step="any"
                                    className="mt-1 block w-full text-xs font-mono"
                                    value={locationForm.data.longitude}
                                    onChange={(e) => locationForm.setData('longitude', parseFloat(e.target.value))}
                                    required
                                />
                                <InputError message={locationForm.errors.longitude} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Perimeter Radius (Meters) *" />
                                <TextInput
                                    type="number"
                                    min={5}
                                    max={5000}
                                    className="mt-1 block w-full text-xs font-mono"
                                    value={locationForm.data.radius_meters}
                                    onChange={(e) => locationForm.setData('radius_meters', parseInt(e.target.value, 10))}
                                    required
                                />
                                <span className="text-[10px] text-slate-400 block mt-1">Recommended: 50 - 200m</span>
                                <InputError message={locationForm.errors.radius_meters} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Max GPS Accuracy Error (Meters) *" />
                                <TextInput
                                    type="number"
                                    min={10}
                                    max={2000}
                                    className="mt-1 block w-full text-xs font-mono"
                                    value={locationForm.data.min_accuracy_meters}
                                    onChange={(e) => locationForm.setData('min_accuracy_meters', parseInt(e.target.value, 10))}
                                    required
                                />
                                <span className="text-[10px] text-slate-400 block mt-1">Recommended: 100 - 150m</span>
                                <InputError message={locationForm.errors.min_accuracy_meters} className="mt-1" />
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={locationForm.data.is_active}
                                    onChange={(e) => locationForm.setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 text-[#E31B23] focus:ring-[#E31B23]"
                                />
                                <span className="font-semibold text-slate-800 text-xs">Enable Geofence Validation</span>
                            </label>
                            <span className="text-[11px] text-slate-500 block mt-1">
                                When active, employees must be within the specified radius to clock in or clock out.
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setIsLocationModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={locationForm.processing}>
                            {locationForm.processing ? 'Saving...' : 'Save Settings'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL 2: ATTENDANCE DETAIL & AUDIT LOG */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="lg">
                {selectedAttendance && (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Attendance Verification Detail</h3>
                                <p className="text-xs text-slate-500">
                                    {selectedAttendance.employee?.user?.name} • {selectedAttendance.date}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Clock In Event</span>
                                <span className="text-sm font-bold text-slate-900 block mt-1">
                                    {selectedAttendance.clock_in || '-'} WIB
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                                    Distance: {selectedAttendance.clock_in_distance ? `${selectedAttendance.clock_in_distance}m` : '-'}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                    Coords: {selectedAttendance.clock_in_latitude?.toFixed(5) || '-'}, {selectedAttendance.clock_in_longitude?.toFixed(5) || '-'}
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Clock Out Event</span>
                                <span className="text-sm font-bold text-slate-900 block mt-1">
                                    {selectedAttendance.clock_out || '-'} WIB
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                                    Distance: {selectedAttendance.clock_out_distance ? `${selectedAttendance.clock_out_distance}m` : '-'}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                    Coords: {selectedAttendance.clock_out_latitude?.toFixed(5) || '-'}, {selectedAttendance.clock_out_longitude?.toFixed(5) || '-'}
                                </span>
                            </div>
                        </div>

                        {/* Audit Events History */}
                        <div>
                            <span className="text-xs font-bold text-slate-800 block mb-2">Audit Event Logs:</span>
                            {selectedAttendance.events && selectedAttendance.events.length > 0 ? (
                                <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
                                    {selectedAttendance.events.map((ev) => (
                                        <div key={ev.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between">
                                            <div>
                                                <span className="font-semibold text-slate-800 uppercase text-[10px] tracking-wide block">
                                                    {ev.event_type} ({ev.status})
                                                </span>
                                                <span className="text-slate-500 text-[11px]">{ev.notes || ev.reason || '-'}</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                                {new Date(ev.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-slate-200">
                                    No audit events recorded for this session.
                                </div>
                            )}
                        </div>

                        {selectedAttendance.correction_reason && (
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                                <span className="font-bold block">HR Manual Correction:</span>
                                <span>{selectedAttendance.correction_reason}</span>
                                <span className="text-[10px] text-amber-600 block mt-1">
                                    Corrected by {selectedAttendance.corrected_by_user?.name || 'HR Admin'}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <SecondaryButton onClick={() => setIsDetailModalOpen(false)}>
                                Close
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL 3: HR MANUAL CORRECTION */}
            <Modal show={isCorrectionModalOpen} onClose={() => setIsCorrectionModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCorrectionSubmit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Manual Attendance Correction</h3>
                            <p className="text-xs text-slate-500">
                                Adjust check-in/out for {selectedAttendance?.employee?.user?.name} ({selectedAttendance?.date})
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCorrectionModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Clock In (HH:mm)" />
                                <TextInput
                                    type="time"
                                    className="mt-1 block w-full text-xs"
                                    value={correctionForm.data.clock_in}
                                    onChange={(e) => correctionForm.setData('clock_in', e.target.value)}
                                />
                                <InputError message={correctionForm.errors.clock_in} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Clock Out (HH:mm)" />
                                <TextInput
                                    type="time"
                                    className="mt-1 block w-full text-xs"
                                    value={correctionForm.data.clock_out}
                                    onChange={(e) => correctionForm.setData('clock_out', e.target.value)}
                                />
                                <InputError message={correctionForm.errors.clock_out} className="mt-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Status *" />
                                <select
                                    value={correctionForm.data.status}
                                    onChange={(e) => correctionForm.setData('status', e.target.value)}
                                    className="mt-1 block w-full text-xs rounded-xl border-slate-200"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Leave">Leave</option>
                                    <option value="Off">Off</option>
                                </select>
                                <InputError message={correctionForm.errors.status} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Late Duration (Minutes)" />
                                <TextInput
                                    type="number"
                                    min={0}
                                    max={1440}
                                    className="mt-1 block w-full text-xs"
                                    value={correctionForm.data.late_duration_minutes}
                                    onChange={(e) => correctionForm.setData('late_duration_minutes', parseInt(e.target.value, 10) || 0)}
                                />
                                <InputError message={correctionForm.errors.late_duration_minutes} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Correction Reason (Mandatory Audit Trail) *" />
                            <textarea
                                rows={3}
                                value={correctionForm.data.correction_reason}
                                onChange={(e) => correctionForm.setData('correction_reason', e.target.value)}
                                placeholder="E.g., Employee device GPS malfunctioned at parking lot. Verified physical presence with Supervisor."
                                className="mt-1 block w-full text-xs rounded-xl border-slate-200 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                                required
                            />
                            <span className="text-[10px] text-slate-400 block mt-1">
                                This reason is recorded in the permanent audit trail.
                            </span>
                            <InputError message={correctionForm.errors.correction_reason} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setIsCorrectionModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={correctionForm.processing}>
                            {correctionForm.processing ? 'Saving...' : 'Apply Correction'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
