import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function TaskDetailModal({ task, onClose, currentUser }: { task: any, onClose: () => void, currentUser: any }) {
    const [activeTab, setActiveTab] = useState('details');

    const checklistForm = useForm({
        title: ''
    });

    const commentForm = useForm({
        content: ''
    });

    const attachmentForm = useForm({
        file: null as File | null
    });

    const addChecklist = (e: React.FormEvent) => {
        e.preventDefault();
        checklistForm.post(route('tasks.checklists.store', task.id), {
            onSuccess: () => checklistForm.reset(),
            preserveScroll: true
        });
    };

    const toggleChecklist = (checklist: any) => {
        router.put(route('tasks.checklists.update', checklist.id), {
            is_completed: !checklist.is_completed
        }, { preserveScroll: true });
    };

    const deleteChecklist = (checklist: any) => {
        router.delete(route('tasks.checklists.destroy', checklist.id), { preserveScroll: true });
    };

    const addComment = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(route('tasks.comments.store', task.id), {
            onSuccess: () => commentForm.reset(),
            preserveScroll: true
        });
    };

    const uploadAttachment = (e: React.FormEvent) => {
        e.preventDefault();
        attachmentForm.post(route('tasks.attachments.store', task.id), {
            onSuccess: () => attachmentForm.reset(),
            preserveScroll: true
        });
    };

    const acknowledgeTask = () => {
        router.post(route('tasks.acknowledge', task.id), {}, { preserveScroll: true });
    };

    const isAssignee = task.assignees?.some((a: any) => a.user?.id === currentUser?.id);
    const hasAcknowledged = task.assignees?.find((a: any) => a.user?.id === currentUser?.id)?.pivot?.acknowledged_at !== null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
                
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl h-[85vh] flex flex-col z-10">
                    
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
                        <div>
                            <h3 className="text-xl leading-6 font-semibold text-gray-900 flex items-center gap-3">
                                {task.title}
                                <span className={`text-xs px-2 py-1 rounded font-semibold
                                    ${task.priority === 'Urgent' ? 'bg-red-100 text-red-800' : ''}
                                    ${task.priority === 'High' ? 'bg-orange-100 text-orange-800' : ''}
                                    ${task.priority === 'Normal' ? 'bg-blue-100 text-blue-800' : ''}
                                    ${task.priority === 'Low' ? 'bg-gray-100 text-gray-800' : ''}
                                `}>
                                    {task.priority}
                                </span>
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Status: <span className="font-medium text-gray-700">{task.status}</span></p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            {['details', 'checklists', 'attachments', 'comments', 'activity'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        
                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                    <div className="bg-white p-4 rounded border text-sm text-gray-700 whitespace-pre-wrap">
                                        {task.description || <span className="italic text-gray-400">No description provided.</span>}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Assignees</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {task.assignees?.map((assignee: any) => (
                                            <span key={assignee.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                                {assignee.user?.name || assignee.employee_number}
                                                {assignee.pivot?.acknowledged_at && <span className="ml-1 text-green-600" title={`Acknowledged at ${assignee.pivot.acknowledged_at}`}>✓</span>}
                                            </span>
                                        ))}
                                        {task.assignees?.length === 0 && <span className="text-sm text-gray-500">Unassigned</span>}
                                    </div>
                                </div>

                                {isAssignee && !hasAcknowledged && (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <p className="text-sm text-yellow-700">
                                                    You have been assigned to this task. Please acknowledge receipt.
                                                </p>
                                                <button onClick={acknowledgeTask} className="mt-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-1 px-3 rounded">
                                                    Acknowledge Task
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Checklists Tab */}
                        {activeTab === 'checklists' && (
                            <div className="space-y-4">
                                <form onSubmit={addChecklist} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={checklistForm.data.title}
                                        onChange={e => checklistForm.setData('title', e.target.value)}
                                        placeholder="Add a checklist item..."
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    <button type="submit" disabled={checklistForm.processing} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">Add</button>
                                </form>

                                <div className="bg-white rounded border divide-y">
                                    {task.checklists?.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-3">
                                            <div className="flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={item.is_completed}
                                                    onChange={() => toggleChecklist(item)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <span className={`ml-3 text-sm ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                    {item.title}
                                                </span>
                                            </div>
                                            <button onClick={() => deleteChecklist(item)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                                        </div>
                                    ))}
                                    {task.checklists?.length === 0 && <div className="p-4 text-center text-sm text-gray-500">No checklist items yet.</div>}
                                </div>
                            </div>
                        )}

                        {/* Attachments Tab */}
                        {activeTab === 'attachments' && (
                            <div className="space-y-4">
                                <form onSubmit={uploadAttachment} className="flex items-end gap-2 bg-white p-4 rounded border">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                                        <input 
                                            type="file" 
                                            onChange={e => attachmentForm.setData('file', e.target.files ? e.target.files[0] : null)}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                        {attachmentForm.errors.file && <p className="text-red-500 text-xs mt-1">{attachmentForm.errors.file}</p>}
                                    </div>
                                    <button type="submit" disabled={attachmentForm.processing || !attachmentForm.data.file} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">Upload</button>
                                </form>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {task.attachments?.map((attachment: any) => (
                                        <div key={attachment.id} className="bg-white border rounded p-3 flex justify-between items-center">
                                            <div className="flex items-center overflow-hidden">
                                                <svg className="h-8 w-8 text-gray-400 flex-shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                <div className="truncate">
                                                    <a href={`/storage/${attachment.file_path}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate block">
                                                        {attachment.file_name}
                                                    </a>
                                                    <span className="text-xs text-gray-500">{(attachment.file_size / 1024).toFixed(1)} KB • Uploaded by {attachment.employee?.user?.name}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => router.delete(route('tasks.attachments.destroy', attachment.id), {preserveScroll: true})} className="ml-2 text-red-500 hover:text-red-700">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {task.attachments?.length === 0 && <div className="text-center py-6 text-sm text-gray-500 bg-white rounded border">No attachments found.</div>}
                            </div>
                        )}

                        {/* Comments Tab */}
                        {activeTab === 'comments' && (
                            <div className="flex flex-col h-full">
                                <div className="flex-1 space-y-4 mb-4">
                                    {task.comments?.map((comment: any) => (
                                        <div key={comment.id} className="bg-white p-4 rounded shadow-sm border">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-medium text-sm text-gray-900">{comment.employee?.user?.name}</div>
                                                <div className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</div>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    ))}
                                    {task.comments?.length === 0 && <div className="text-center py-6 text-sm text-gray-500">No comments yet. Start the conversation!</div>}
                                </div>
                                
                                <form onSubmit={addComment} className="mt-auto bg-white p-4 rounded border">
                                    <textarea 
                                        value={commentForm.data.content}
                                        onChange={e => commentForm.setData('content', e.target.value)}
                                        rows={3}
                                        placeholder="Write a comment..."
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm mb-2"
                                    ></textarea>
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={commentForm.processing || !commentForm.data.content.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">Post Comment</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Activity History Tab */}
                        {activeTab === 'activity' && (
                            <div className="space-y-4">
                                <ul className="relative border-l border-gray-200 ml-3 space-y-6">
                                    {task.activities?.map((activity: any) => (
                                        <li key={activity.id} className="ml-6">
                                            <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-8 ring-gray-50">
                                                <svg className="w-3 h-3 text-indigo-800" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path></svg>
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{activity.description}</span>
                                                <span className="text-xs text-gray-500 mt-0.5">by {activity.employee?.user?.name || 'System'} on {new Date(activity.created_at).toLocaleString()}</span>
                                                {activity.old_value && activity.new_value && (
                                                    <div className="mt-2 text-xs text-gray-600 bg-white p-2 border rounded inline-block">
                                                        <span className="line-through mr-2">{JSON.stringify(activity.old_value)}</span>
                                                        <span>➔</span>
                                                        <span className="ml-2 font-semibold">{JSON.stringify(activity.new_value)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                    {task.activities?.length === 0 && <div className="text-sm text-gray-500 ml-4">No activity recorded yet.</div>}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
