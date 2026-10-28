import React from 'react';
import Modal from '@/Components/Modal';

interface AttendanceDetailModalProps {
    show: boolean;
    onClose: () => void;
    record: any | null;
    hotelLocation: any;
    onOpenCorrection: (record: any) => void;
}

export default function AttendanceDetailModal({
    show,
    onClose,
    record,
    hotelLocation,
    onOpenCorrection,
}: AttendanceDetailModalProps) {
    if (!record) return null;

    const clockInValid = record.clock_in_distance !== null && record.clock_in_distance !== undefined
        ? record.clock_in_distance <= (hotelLocation?.radius_meters || 100)
        : null;

    const clockOutValid = record.clock_out_distance !== null && record.clock_out_distance !== undefined
        ? record.clock_out_distance <= (hotelLocation?.radius_meters || 100)
        : null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="3xl">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E31B23] to-red-500 text-white flex items-center justify-center font-bold text-base shadow-md">
                            {record.employee?.user?.name ? record.employee.user.name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {record.employee?.user?.name || 'Staff Member'}
                                </h2>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                    {record.employee?.employee_number || 'NIP -'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {record.employee?.department?.name || 'No Department'} &bull; {record.employee?.designation || 'Staff'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenCorrection(record);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold border border-purple-200 transition-colors flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Correct Attendance</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Schedule & Timing Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Work Date</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">{record.date}</span>
                        <span className="text-slate-500 text-[11px]">{record.shift?.name || 'Standard Shift'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Schedule</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                            {record.shift ? `${record.shift.start_time.substring(0,5)} - ${record.shift.end_time.substring(0,5)}` : '-'}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                            {record.shift?.is_overnight ? 'Overnight Shift' : 'Regular Shift'}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Actual Times</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">
                            {record.clock_in ? record.clock_in.substring(0,5) : '--:--'} &rarr; {record.clock_out ? record.clock_out.substring(0,5) : '--:--'}
                        </span>
                        <span className="text-slate-500 text-[11px]">Duration: {record.worked_duration || '-'}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status</span>
                        <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                record.status === 'Present' && !record.is_late
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : record.is_late
                                        ? 'bg-amber-100 text-amber-800'
                                        : record.status === 'In Progress'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-rose-100 text-rose-800'
                            }`}>
                                {record.is_late ? `Late (${record.late_duration_minutes}m)` : record.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dual GPS Verification Audit Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Clock-In GPS Card */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Clock-In Geofence</h4>
                            </div>
                            {clockInValid !== null && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    clockInValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {clockInValid ? '✓ Valid (In Radius)' : '✗ Out of Radius'}
                                </span>
                            )}
                        </div>

                        {record.clock_in ? (
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Clock-In Time:</span>
                                    <span className="font-semibold text-slate-800 tabular-nums">
                                        {record.clock_in} WIB
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Device Coordinates:</span>
                                    <span className="font-mono text-slate-800">
                                        {record.clock_in_latitude?.toFixed(6) ?? '-'}, {record.clock_in_longitude?.toFixed(6) ?? '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Distance to Hotel:</span>
                                    <span className="font-bold text-slate-900 tabular-nums">
                                        {record.clock_in_distance !== null && record.clock_in_distance !== undefined ? `${record.clock_in_distance} meters` : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">GPS Accuracy:</span>
                                    <span className="font-medium text-slate-700">
                                        {record.clock_in_accuracy ? `±${record.clock_in_accuracy}m` : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Allowed Hotel Radius:</span>
                                    <span className="text-slate-700 font-medium">{hotelLocation?.radius_meters || 100}m</span>
                                </div>

                                {record.clock_in_latitude && record.clock_in_longitude && (
                                    <div className="pt-2">
                                        <a
                                            href={`https://www.google.com/maps?q=${record.clock_in_latitude},${record.clock_in_longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Open Clock-In Pin on Maps</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-slate-400 text-xs">
                                No clock-in recorded for this shift.
                            </div>
                        )}
                    </div>

                    {/* Clock-Out GPS Card */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Clock-Out Geofence</h4>
                            </div>
                            {clockOutValid !== null && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    clockOutValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {clockOutValid ? '✓ Valid (In Radius)' : '✗ Out of Radius'}
                                </span>
                            )}
                        </div>

                        {record.clock_out ? (
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Clock-Out Time:</span>
                                    <span className="font-semibold text-slate-800 tabular-nums">
                                        {record.clock_out} WIB
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Device Coordinates:</span>
                                    <span className="font-mono text-slate-800">
                                        {record.clock_out_latitude?.toFixed(6) ?? '-'}, {record.clock_out_longitude?.toFixed(6) ?? '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Distance to Hotel:</span>
                                    <span className="font-bold text-slate-900 tabular-nums">
                                        {record.clock_out_distance !== null && record.clock_out_distance !== undefined ? `${record.clock_out_distance} meters` : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-50">
                                    <span className="text-slate-500">GPS Accuracy:</span>
                                    <span className="font-medium text-slate-700">
                                        {record.clock_out_accuracy ? `±${record.clock_out_accuracy}m` : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500">Allowed Hotel Radius:</span>
                                    <span className="text-slate-700 font-medium">{hotelLocation?.radius_meters || 100}m</span>
                                </div>

                                {record.clock_out_latitude && record.clock_out_longitude && (
                                    <div className="pt-2">
                                        <a
                                            href={`https://www.google.com/maps?q=${record.clock_out_latitude},${record.clock_out_longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Open Clock-Out Pin on Maps</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-slate-400 text-xs">
                                Shift in progress (pending clock-out).
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit & Correction Details (If record was manually corrected) */}
                {record.correction_reason && (
                    <div className="mt-4 p-4 rounded-2xl bg-purple-50 border border-purple-200/80">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <h4 className="text-xs font-bold text-purple-900">HR Manual Administrative Correction</h4>
                        </div>
                        <p className="text-xs text-purple-800">
                            <strong>Reason:</strong> {record.correction_reason}
                        </p>
                        <p className="text-[11px] text-purple-600 mt-1">
                            Corrected by: <strong>{record.corrected_by_user?.name || 'HR Admin'}</strong> on{' '}
                            {record.corrected_at ? new Date(record.corrected_at).toLocaleString('en-US') : '-'}
                        </p>
                    </div>
                )}

                {/* Audit Events Timeline */}
                {record.events && record.events.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                            Audit Trail Events ({record.events.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {record.events.map((evt: any) => (
                                <div key={evt.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            evt.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                        }`}>
                                            {evt.event_type}
                                        </span>
                                        <span className="text-slate-700">{evt.notes || evt.reason || '-'}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 tabular-nums">
                                        {new Date(evt.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    >
                        Close Detail
                    </button>
                </div>
            </div>
        </Modal>
    );
}
