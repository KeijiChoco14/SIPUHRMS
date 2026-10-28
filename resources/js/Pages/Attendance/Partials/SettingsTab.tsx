import React from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

interface SettingsTabProps {
    location: any;
}

export default function SettingsTab({ location }: SettingsTabProps) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: location?.name || 'Swiss-Belinn SKA Pekanbaru',
        latitude: location?.latitude ?? 0.49909785,
        longitude: location?.longitude ?? 101.41851615,
        radius_meters: location?.radius_meters || 100,
        min_accuracy_meters: location?.min_accuracy_meters || 50,
        is_active: location?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('attendance.location.update'), {
            preserveScroll: true,
        });
    };

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Hotel Attendance Geofencing Configuration</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage the physical boundary radius and minimum GPS accuracy policy for Swiss-Belinn SKA Pekanbaru.
                        </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        data.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                        {data.is_active ? '● Geofencing Active' : '○ Disabled'}
                    </span>
                </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="hotel_name" value="Hotel Location Name" />
                        <TextInput
                            id="hotel_name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full text-xs"
                            required
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="latitude" value="Latitude" />
                            <TextInput
                                id="latitude"
                                type="number"
                                step="any"
                                value={data.latitude}
                                onChange={(e) => setData('latitude', parseFloat(e.target.value))}
                                className="mt-1 block w-full text-xs font-mono"
                                required
                            />
                            <InputError message={errors.latitude} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="longitude" value="Longitude" />
                            <TextInput
                                id="longitude"
                                type="number"
                                step="any"
                                value={data.longitude}
                                onChange={(e) => setData('longitude', parseFloat(e.target.value))}
                                className="mt-1 block w-full text-xs font-mono"
                                required
                            />
                            <InputError message={errors.longitude} className="mt-1" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <a
                            href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#E31B23] hover:underline font-semibold"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>Preview Hotel Pin on Google Maps</span>
                        </a>
                    </div>

                    {/* Radius Slider & Input */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <InputLabel htmlFor="radius_meters" value="Geofence Radius (Meters)" />
                                <p className="text-[11px] text-slate-500">
                                    Maximum allowed distance between device GPS and hotel center. Default recommended: 100 meters.
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-slate-900 tabular-nums">{data.radius_meters}</span>
                                <span className="text-xs text-slate-500 ml-1">meters</span>
                            </div>
                        </div>

                        <input
                            type="range"
                            min="20"
                            max="500"
                            step="5"
                            value={data.radius_meters}
                            onChange={(e) => setData('radius_meters', parseInt(e.target.value) || 100)}
                            className="w-full accent-[#E31B23] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>20m (Strict)</span>
                            <span>100m (Standard Hotel Grounds)</span>
                            <span>500m (Extended Campus)</span>
                        </div>
                        <InputError message={errors.radius_meters} className="mt-1" />
                    </div>

                    {/* Minimum GPS Accuracy */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <InputLabel htmlFor="min_accuracy" value="Minimum Accepted GPS Accuracy (Meters)" />
                                <p className="text-[11px] text-slate-500">
                                    Devices reporting GPS accuracy worse than this threshold will be prompted to seek better signal.
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-base font-bold text-slate-900 tabular-nums">±{data.min_accuracy_meters}</span>
                                <span className="text-xs text-slate-500 ml-1">meters</span>
                            </div>
                        </div>
                        <TextInput
                            id="min_accuracy"
                            type="number"
                            min="10"
                            max="200"
                            value={data.min_accuracy_meters}
                            onChange={(e) => setData('min_accuracy_meters', parseInt(e.target.value) || 50)}
                            className="mt-1 block w-full text-xs"
                            required
                        />
                        <InputError message={errors.min_accuracy_meters} className="mt-1" />
                    </div>

                    {/* Active Switch */}
                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="is_active_toggle"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-slate-300 text-[#E31B23] focus:ring-[#E31B23] h-4 w-4"
                        />
                        <label htmlFor="is_active_toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                            Enable Active Geofence Enforcement for Clock In & Out
                        </label>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    {recentlySuccessful && (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Settings saved successfully.
                        </span>
                    )}
                    <div className="ml-auto">
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Saving Changes...' : 'Save Geofence Configuration'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>

            {/* Policy Notes */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Operational Policy Guidelines</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-800/90 leading-relaxed text-[11px]">
                    <li><strong>Server-Authoritative Clock:</strong> Official attendance timestamps strictly use server time (Asia/Jakarta, WIB) to avoid clock tampering on employee smartphones.</li>
                    <li><strong>Radius Calibration:</strong> Do not set radius lower than 50m without on-site testing. Structural hotel concrete and indoor Wi-Fi may cause minor GPS drift up to 25m.</li>
                    <li><strong>Overnight Shifts:</strong> The system automatically assigns overnight clock-outs to the originating shift date, maintaining seamless continuity across midnight.</li>
                    <li><strong>Audit Integrity:</strong> Any change to these coordinates or radius is logged to the system audit trail. Historical attendance logs preserve their original validation distance.</li>
                </ul>
            </div>
        </div>
    );
}
