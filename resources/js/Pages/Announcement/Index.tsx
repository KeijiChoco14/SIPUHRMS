import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Badge from '@/Components/Badge';

export default function AnnouncementIndex({ announcements, auth, flash }: any) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        message: '',
        target_audience: 'All',
    });

    const isHR = auth.user.roles?.some((r: any) => r.name === 'HRD / Admin' || r.name === 'General Manager');

    const submit = (e: any) => {
        e.preventDefault();
        post(route('announcements.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="font-bold text-xl text-slate-900 tracking-tight">Swiss-Belinn Internal Announcements</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Official hotel management notices and updates for all staff and departments.</p>
                    </div>
                    {isHR && (
                        <PrimaryButton 
                            onClick={() => setShowForm(!showForm)}
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {showForm ? 'Close Form' : 'New Announcement'}
                        </PrimaryButton>
                    )}
                </div>
            }
        >
            <Head title="Announcements" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {flash?.success && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xs">
                            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {showForm && (
                        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                            <h3 className="text-base font-semibold text-slate-900 mb-4">Post New Announcement</h3>
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Announcement Title</label>
                                    <input 
                                        type="text" 
                                        value={data.title} 
                                        placeholder="Hotel announcement headline..."
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 shadow-xs text-sm text-slate-900 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] py-2.5 px-3"
                                    />
                                    {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Message Content</label>
                                    <textarea 
                                        value={data.message} 
                                        onChange={e => setData('message', e.target.value)}
                                        placeholder="Write detailed announcement for staff members..."
                                        rows={4}
                                        className="w-full rounded-xl border-slate-300 shadow-xs text-sm text-slate-900 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] py-2.5 px-3"
                                    />
                                    {errors.message && <p className="text-rose-500 text-xs mt-1">{errors.message}</p>}
                                </div>
                                <div className="mb-5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Target Audience</label>
                                    <select 
                                        value={data.target_audience} 
                                        onChange={e => setData('target_audience', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 shadow-xs text-sm text-slate-900 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] py-2.5 px-3"
                                    >
                                        <option value="All">All Staff (All Employees)</option>
                                        <option value="Supervisors">HOD & Supervisors Only</option>
                                    </select>
                                    {errors.target_audience && <p className="text-rose-500 text-xs mt-1">{errors.target_audience}</p>}
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <SecondaryButton onClick={() => setShowForm(false)}>
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton 
                                        type="submit" 
                                        disabled={processing}
                                    >
                                        {processing ? 'Publishing...' : 'Publish Announcement'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {announcements.length > 0 ? (
                            announcements.map((announcement: any) => (
                                <div key={announcement.id} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 border-l-4 border-l-[#E31B23] hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <h3 className="text-lg font-bold text-slate-900">{announcement.title}</h3>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium shrink-0 tabular-nums">
                                            {new Date(announcement.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                                        <span className="font-semibold text-slate-700">{announcement.creator?.name || 'Admin'}</span>
                                        <span>&bull;</span>
                                        <Badge variant="brand">{announcement.target_audience}</Badge>
                                    </div>
                                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {announcement.message}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-16 text-center text-slate-500 rounded-2xl shadow-xs border border-slate-200">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">No announcements yet</h3>
                                <p className="mt-1 text-xs text-slate-400">Official announcements from hotel management will be displayed here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
