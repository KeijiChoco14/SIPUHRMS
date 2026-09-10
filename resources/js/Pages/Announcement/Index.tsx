import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

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
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Company Announcements</h2>
                    {isHR && (
                        <button 
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors"
                        >
                            {showForm ? 'Cancel' : 'Post Announcement'}
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Announcements" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    
                    {flash?.success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {flash.success}
                        </div>
                    )}

                    {showForm && (
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">New Announcement</h3>
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea 
                                        value={data.message} 
                                        onChange={e => setData('message', e.target.value)}
                                        rows={4}
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    />
                                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                                    <select 
                                        value={data.target_audience} 
                                        onChange={e => setData('target_audience', e.target.value)}
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    >
                                        <option value="All">All Employees</option>
                                        <option value="Supervisors">Supervisors Only</option>
                                    </select>
                                    {errors.target_audience && <p className="text-red-500 text-xs mt-1">{errors.target_audience}</p>}
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Post
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-6">
                        {announcements.length > 0 ? (
                            announcements.map((announcement: any) => (
                                <div key={announcement.id} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {new Date(announcement.published_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-4 flex items-center space-x-2">
                                        <span className="font-medium text-gray-700">{announcement.creator?.name}</span>
                                        <span>&bull;</span>
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">{announcement.target_audience}</span>
                                    </div>
                                    <div className="text-gray-700 whitespace-pre-wrap">
                                        {announcement.message}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-12 text-center text-gray-500 rounded-lg shadow-sm">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                                No announcements have been posted yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
