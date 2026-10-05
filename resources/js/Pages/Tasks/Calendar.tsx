import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import TaskDetailModal from '../Projects/TaskDetailModal';
import CreateTaskModal from '@/Components/CreateTaskModal';
import TaskViewSwitcher from '@/Components/TaskViewSwitcher';

interface CalendarProps {
    auth: any;
    tasks: any[];
    employees: any[];
    projects: any[];
    statuses: any[];
    priorities: any[];
    filters: {
        project_id?: string;
        employee_id?: string;
    };
}

// Pastel color palette matching reference design
const PASTEL_THEMES = [
    {
        bg: 'bg-emerald-50/90',
        border: 'border-emerald-200/90',
        text: 'text-emerald-950',
        badge: 'bg-emerald-100 text-emerald-800',
        timeText: 'text-emerald-700',
        hover: 'hover:bg-emerald-100/70',
    },
    {
        bg: 'bg-amber-50/90',
        border: 'border-amber-200/90',
        text: 'text-amber-950',
        badge: 'bg-amber-100 text-amber-800',
        timeText: 'text-amber-700',
        hover: 'hover:bg-amber-100/70',
    },
    {
        bg: 'bg-sky-50/90',
        border: 'border-sky-200/90',
        text: 'text-sky-950',
        badge: 'bg-sky-100 text-sky-800',
        timeText: 'text-sky-700',
        hover: 'hover:bg-sky-100/70',
    },
    {
        bg: 'bg-purple-50/90',
        border: 'border-purple-200/90',
        text: 'text-purple-950',
        badge: 'bg-purple-100 text-purple-800',
        timeText: 'text-purple-700',
        hover: 'hover:bg-purple-100/70',
    },
    {
        bg: 'bg-rose-50/90',
        border: 'border-rose-200/90',
        text: 'text-rose-950',
        badge: 'bg-rose-100 text-rose-800',
        timeText: 'text-rose-700',
        hover: 'hover:bg-rose-100/70',
    },
    {
        bg: 'bg-indigo-50/90',
        border: 'border-indigo-200/90',
        text: 'text-indigo-950',
        badge: 'bg-indigo-100 text-indigo-800',
        timeText: 'text-indigo-700',
        hover: 'hover:bg-indigo-100/70',
    },
];

const getPastelTheme = (task: any) => {
    // Pick deterministic pastel theme based on task id or project id
    const seed = (task.project_id || 0) * 7 + (task.id || 0);
    return PASTEL_THEMES[Math.abs(seed) % PASTEL_THEMES.length];
};

const formatDuration = (minutes?: number | null) => {
    if (!minutes || minutes <= 0) return '1:00h';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (m === 0) return `${h}:00h`;
    return `${h}h ${m}m`;
};

const sumMinutes = (tasks: any[]) => {
    const totalMinutes = tasks.reduce((acc, t) => acc + (t.estimated_duration || 60), 0);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (m === 0) return `${h}h 0m`;
    return `${h}h ${m}m`;
};

const toDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export default function Calendar({
    auth,
    tasks: initialTasks,
    employees = [],
    projects = [],
    statuses = [],
    priorities = [],
}: CalendarProps) {
    const [tasks, setTasks] = useState<any[]>(initialTasks || []);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createDefaultDate, setCreateDefaultDate] = useState<string>('');
    const [createDefaultAssignees, setCreateDefaultAssignees] = useState<number[]>([]);

    // Navigation and View Mode
    const [currentBaseDate, setCurrentBaseDate] = useState<Date>(() => new Date());
    const [viewMode, setViewMode] = useState<'4days' | 'week' | 'month'>('4days');
    const [groupBy, setGroupBy] = useState<'responsible' | 'project' | 'grid'>('responsible');

    // Filters and Drawer
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<number | 'all'>('all');
    const [selectedProjectFilter, setSelectedProjectFilter] = useState<number | 'all'>('all');
    const [showWaitingList, setShowWaitingList] = useState(true);
    const [waitingListSearch, setWaitingListSearch] = useState('');

    // Drag and Drop state
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
    const [dragOverCell, setDragOverCell] = useState<string | null>(null);

    // Sync tasks prop updates
    useEffect(() => {
        setTasks(initialTasks || []);
    }, [initialTasks]);

    // Keep selectedTask updated if task details change
    useEffect(() => {
        if (selectedTask && tasks) {
            const updated = tasks.find(t => t.id === selectedTask.id);
            if (updated) setSelectedTask(updated);
        }
    }, [tasks]);

    // Open task from URL query param if present
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const taskIdParam = params.get('task_id') || params.get('taskId');
        if (taskIdParam && tasks) {
            const found = tasks.find(t => String(t.id) === String(taskIdParam));
            if (found) setSelectedTask(found);
        }
    }, [tasks]);

    // Calculate dates shown in the current view
    const visibleDates = useMemo(() => {
        const dates: Date[] = [];
        const base = new Date(currentBaseDate);
        base.setHours(0, 0, 0, 0);

        if (viewMode === '4days') {
            for (let i = 0; i < 4; i++) {
                const d = new Date(base);
                d.setDate(base.getDate() + i);
                dates.push(d);
            }
        } else if (viewMode === 'week') {
            // Monday to Sunday
            const dayOfWeek = base.getDay(); // 0 is Sunday, 1 is Monday
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(base);
            monday.setDate(base.getDate() + diff);

            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                dates.push(d);
            }
        } else if (viewMode === 'month') {
            // First 14 days of current view or full month start
            const firstDayOfMonth = new Date(base.getFullYear(), base.getMonth(), 1);
            const totalDaysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= Math.min(totalDaysInMonth, 14); i++) {
                dates.push(new Date(base.getFullYear(), base.getMonth(), i));
            }
        }

        return dates;
    }, [currentBaseDate, viewMode]);

    // Paging controls
    const handlePrev = () => {
        const next = new Date(currentBaseDate);
        if (viewMode === '4days') {
            next.setDate(next.getDate() - 4);
        } else if (viewMode === 'week') {
            next.setDate(next.getDate() - 7);
        } else {
            next.setMonth(next.getMonth() - 1);
        }
        setCurrentBaseDate(next);
    };

    const handleNext = () => {
        const next = new Date(currentBaseDate);
        if (viewMode === '4days') {
            next.setDate(next.getDate() + 4);
        } else if (viewMode === 'week') {
            next.setDate(next.getDate() + 7);
        } else {
            next.setMonth(next.getMonth() + 1);
        }
        setCurrentBaseDate(next);
    };

    const handleToday = () => {
        setCurrentBaseDate(new Date());
    };

    // Filter tasks based on search & filters
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const titleMatch = t.title?.toLowerCase().includes(q);
                const descMatch = t.description?.toLowerCase().includes(q);
                const projMatch = t.project?.name?.toLowerCase().includes(q);
                if (!titleMatch && !descMatch && !projMatch) return false;
            }
            if (selectedProjectFilter !== 'all' && t.project_id !== selectedProjectFilter) {
                return false;
            }
            if (selectedEmployeeFilter !== 'all') {
                const hasAssignee = t.assignees?.some((a: any) => a.id === selectedEmployeeFilter);
                if (!hasAssignee) return false;
            }
            return true;
        });
    }, [tasks, searchQuery, selectedProjectFilter, selectedEmployeeFilter]);

    // Split tasks into Scheduled (has deadline) and Waiting List (backlog / no deadline or status To Do without deadline)
    const { scheduledTasks, waitingListTasks } = useMemo(() => {
        const scheduled: any[] = [];
        const waiting: any[] = [];

        filteredTasks.forEach(t => {
            const hasDate = t.deadline || t.start_date;
            if (hasDate) {
                scheduled.push(t);
            } else {
                waiting.push(t);
            }
        });

        return { scheduledTasks: scheduled, waitingListTasks: waiting };
    }, [filteredTasks]);

    // Filtered waiting list items based on drawer search
    const displayedWaitingList = useMemo(() => {
        if (!waitingListSearch.trim()) return waitingListTasks;
        const q = waitingListSearch.toLowerCase();
        return waitingListTasks.filter(t =>
            t.title?.toLowerCase().includes(q) ||
            t.project?.name?.toLowerCase().includes(q)
        );
    }, [waitingListTasks, waitingListSearch]);

    // Active employees who have tasks or are in the team list
    const activeEmployees = useMemo(() => {
        if (selectedEmployeeFilter !== 'all') {
            return employees.filter(e => e.id === selectedEmployeeFilter);
        }
        return employees;
    }, [employees, selectedEmployeeFilter]);

    // Active projects for "Group by project" mode
    const activeProjects = useMemo(() => {
        if (selectedProjectFilter !== 'all') {
            return projects.filter(p => p.id === selectedProjectFilter);
        }
        return projects;
    }, [projects, selectedProjectFilter]);

    // Fast lookup: task by date string and employee id / project id
    const getTasksForCell = (dateStr: string, employeeId?: number, projectId?: number) => {
        return scheduledTasks.filter(t => {
            const taskDate = (t.deadline || t.start_date || '').split('T')[0];
            if (taskDate !== dateStr) return false;

            if (employeeId !== undefined) {
                if (employeeId === 0) {
                    // Unassigned tasks
                    return !t.assignees || t.assignees.length === 0;
                }
                return t.assignees?.some((a: any) => a.id === employeeId);
            }

            if (projectId !== undefined) {
                if (projectId === 0) {
                    return !t.project_id;
                }
                return t.project_id === projectId;
            }

            return true;
        });
    };

    // Total minutes per date column
    const getDateTotalHours = (dateStr: string) => {
        const dayTasks = scheduledTasks.filter(t => {
            const taskDate = (t.deadline || t.start_date || '').split('T')[0];
            return taskDate === dateStr;
        });
        return sumMinutes(dayTasks);
    };

    // Total minutes for an employee across current visible dates
    const getEmployeeTotalHours = (employeeId: number) => {
        const datesSet = new Set(visibleDates.map(d => toDateString(d)));
        const empTasks = scheduledTasks.filter(t => {
            const taskDate = (t.deadline || t.start_date || '').split('T')[0];
            if (!datesSet.has(taskDate)) return false;
            if (employeeId === 0) return !t.assignees || t.assignees.length === 0;
            return t.assignees?.some((a: any) => a.id === employeeId);
        });
        return sumMinutes(empTasks);
    };

    // Drag & Drop handlers
    const handleDragStart = (e: React.DragEvent, task: any) => {
        setDraggedTaskId(task.id);
        e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, cellId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverCell !== cellId) {
            setDragOverCell(cellId);
        }
    };

    const handleDragLeave = () => {
        setDragOverCell(null);
    };

    // Drop onto a calendar date cell
    const handleDropOnCell = (dateStr: string, employeeId?: number) => {
        setDragOverCell(null);
        if (!draggedTaskId) return;

        const targetTask = tasks.find(t => t.id === draggedTaskId);
        if (!targetTask) return;

        // Build optimistic update
        let updatedAssignees = targetTask.assignees?.map((a: any) => a.id) || [];
        if (employeeId && employeeId > 0 && !updatedAssignees.includes(employeeId)) {
            // Assign to this person
            updatedAssignees = [employeeId];
        }

        const payload: any = {
            deadline: dateStr,
            start_date: dateStr,
        };

        if (employeeId && employeeId > 0) {
            payload.assignees = updatedAssignees;
        }

        // Optimistic UI state
        setTasks(prev =>
            prev.map(t => {
                if (t.id === draggedTaskId) {
                    const matchedEmployee = employees.find(e => e.id === employeeId);
                    return {
                        ...t,
                        deadline: dateStr,
                        start_date: dateStr,
                        assignees: matchedEmployee ? [matchedEmployee] : t.assignees,
                    };
                }
                return t;
            })
        );

        router.put(route('tasks.update', draggedTaskId), payload, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                // Revert on error
                setTasks(initialTasks);
            },
        });

        setDraggedTaskId(null);
    };

    // Drop onto Waiting List (unschedule)
    const handleDropOnWaitingList = () => {
        setDragOverCell(null);
        if (!draggedTaskId) return;

        // Optimistic update
        setTasks(prev =>
            prev.map(t => {
                if (t.id === draggedTaskId) {
                    return { ...t, deadline: null, start_date: null };
                }
                return t;
            })
        );

        router.put(route('tasks.update', draggedTaskId), {
            deadline: null,
            start_date: null,
        }, {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                setTasks(initialTasks);
            },
        });

        setDraggedTaskId(null);
    };

    // Helper for quick add on date & person
    const openQuickCreate = (dateStr?: string, employeeId?: number) => {
        setCreateDefaultDate(dateStr || toDateString(new Date()));
        setCreateDefaultAssignees(employeeId && employeeId > 0 ? [employeeId] : []);
        setShowCreateModal(true);
    };

    // Format Month title (e.g. "April 2026")
    const monthYearTitle = currentBaseDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const isToday = (d: Date) => {
        const today = new Date();
        return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4">
                    {/* Top Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-bold text-xl text-gray-900 leading-tight">Team Schedule Calendar</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Workload planning, deadlines & team schedule matrix</p>
                            </div>
                        </div>

                        {/* Right: View Switcher & Primary Action */}
                        <div className="flex items-center gap-2.5">
                            <TaskViewSwitcher current="calendar" />
                            <button
                                onClick={() => openQuickCreate()}
                                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-sm transition-all hover:shadow"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>+ Add new</span>
                            </button>
                        </div>
                    </div>

                    {/* Secondary Navigation Bar (Month Navigation, View Modes, Group By, Filters, Waiting List Toggle) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                        {/* Month & Date Navigation */}
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900 min-w-[140px]">
                                {monthYearTitle}
                            </span>
                            <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                <button
                                    onClick={handlePrev}
                                    title="Previous"
                                    className="p-1.5 rounded-md hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleToday}
                                    className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-white rounded-md transition-colors"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={handleNext}
                                    title="Next"
                                    className="p-1.5 rounded-md hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* View Mode Pills (4 Days, Week, Month) */}
                            <div className="hidden sm:inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-semibold ml-2">
                                <button
                                    onClick={() => setViewMode('4days')}
                                    className={`px-3 py-1 rounded-md transition-all ${
                                        viewMode === '4days' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    4 Days
                                </button>
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-3 py-1 rounded-md transition-all ${
                                        viewMode === 'week' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1 rounded-md transition-all ${
                                        viewMode === 'month' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Month
                                </button>
                            </div>
                        </div>

                        {/* Controls on Right: Grouping, Search, Assignee Avatar Strip, Waiting list Toggle */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Grouping Mode */}
                            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-700">
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                <select
                                    value={groupBy}
                                    onChange={e => setGroupBy(e.target.value as any)}
                                    className="bg-transparent border-none text-xs font-semibold text-gray-800 p-0 focus:ring-0 cursor-pointer"
                                >
                                    <option value="responsible">Group by responsible</option>
                                    <option value="project">Group by project</option>
                                    <option value="grid">Date grid only</option>
                                </select>
                            </div>

                            {/* Project Filter */}
                            {projects.length > 0 && (
                                <select
                                    value={selectedProjectFilter}
                                    onChange={e => setSelectedProjectFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 py-1.5 px-3 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                >
                                    <option value="all">All Projects</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            )}

                            {/* Team Assignee Avatar Strip */}
                            <div className="hidden md:flex items-center -space-x-1.5 pl-1" title="Filter by Team Member">
                                <button
                                    onClick={() => setSelectedEmployeeFilter('all')}
                                    className={`h-7 w-7 rounded-full text-[10px] font-bold border-2 transition-all ${
                                        selectedEmployeeFilter === 'all'
                                            ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200'
                                            : 'bg-gray-200 text-gray-700 border-white hover:bg-gray-300'
                                    }`}
                                >
                                    All
                                </button>
                                {employees.slice(0, 5).map(emp => {
                                    const isSelected = selectedEmployeeFilter === emp.id;
                                    const name = emp.user?.name || emp.employee_number || 'E';
                                    return (
                                        <button
                                            key={emp.id}
                                            onClick={() => setSelectedEmployeeFilter(isSelected ? 'all' : emp.id)}
                                            title={name}
                                            className={`h-7 w-7 rounded-full text-white text-[10px] font-bold border-2 transition-all flex items-center justify-center ${
                                                isSelected
                                                    ? 'ring-2 ring-indigo-500 scale-105 border-white'
                                                    : 'border-white hover:scale-105'
                                            } bg-gradient-to-br from-indigo-500 to-purple-600`}
                                        >
                                            {emp.user?.profile_photo_url ? (
                                                <img src={emp.user.profile_photo_url} alt={name} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                name.charAt(0).toUpperCase()
                                            )}
                                        </button>
                                    );
                                })}
                                {employees.length > 5 && (
                                    <span className="h-7 w-7 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold border-2 border-white flex items-center justify-center">
                                        +{employees.length - 5}
                                    </span>
                                )}
                            </div>

                            {/* Waiting list Toggle Button */}
                            <button
                                onClick={() => setShowWaitingList(prev => !prev)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                    showWaitingList
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span>Waiting list</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    showWaitingList ? 'bg-indigo-200/80 text-indigo-800' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {waitingListTasks.length}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Team Schedule Calendar" />

            {/* Mobile View: Horizontal Date Strip Carousel + Day Feed */}
            <div className="lg:hidden mb-4">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-3 shadow-sm mb-4">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                        <span className="font-bold text-sm text-gray-800">{monthYearTitle}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={handlePrev} className="p-1 text-gray-500 hover:text-gray-900 rounded">
                                ‹
                            </button>
                            <button onClick={handleToday} className="px-2 py-0.5 text-xs font-semibold bg-gray-100 rounded">
                                Today
                            </button>
                            <button onClick={handleNext} className="p-1 text-gray-500 hover:text-gray-900 rounded">
                                ›
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Date Strip (Mobile phone mockup in screenshot) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {visibleDates.map((date, idx) => {
                            const dateStr = toDateString(date);
                            const isCurrent = toDateString(currentBaseDate) === dateStr;
                            const dayLetter = date.toLocaleDateString('en-US', { weekday: 'narrow' });
                            const dayNum = date.getDate();

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentBaseDate(date)}
                                    className={`flex-shrink-0 flex flex-col items-center justify-center w-11 h-14 rounded-xl transition-all ${
                                        isCurrent
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                            : isToday(date)
                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-[10px] font-medium uppercase">{dayLetter}</span>
                                    <span className="text-sm font-bold mt-0.5">{dayNum}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Task Feed for selected date */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h3 className="font-bold text-base text-gray-900">
                                {currentBaseDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </h3>
                            <span className="text-xs text-gray-500">
                                Total workload: {getDateTotalHours(toDateString(currentBaseDate))}
                            </span>
                        </div>
                        <button
                            onClick={() => openQuickCreate(toDateString(currentBaseDate))}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm"
                        >
                            + Add
                        </button>
                    </div>

                    {getTasksForCell(toDateString(currentBaseDate)).length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
                            No tasks scheduled for this day
                        </div>
                    ) : (
                        getTasksForCell(toDateString(currentBaseDate)).map((task: any) => {
                            const theme = getPastelTheme(task);
                            const completedChecklists = task.checklists?.filter((c: any) => c.is_completed).length || 0;
                            const totalChecklists = task.checklists?.length || 0;

                            return (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className={`p-3.5 rounded-2xl border ${theme.bg} ${theme.border} cursor-pointer shadow-sm`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-xs font-bold ${theme.timeText}`}>
                                            {formatDuration(task.estimated_duration)}
                                        </span>
                                        {task.project && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 text-gray-600 truncate max-w-[120px]">
                                                {task.project.name}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className={`font-semibold text-sm ${theme.text} mb-2`}>
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-black/5">
                                        <div className="flex items-center gap-3">
                                            {totalChecklists > 0 && (
                                                <span className="flex items-center gap-1 text-[11px]">
                                                    ✓ {completedChecklists}/{totalChecklists}
                                                </span>
                                            )}
                                            {task.comments?.length > 0 && (
                                                <span className="flex items-center gap-1 text-[11px]">
                                                    💬 {task.comments.length}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex -space-x-1.5">
                                            {task.assignees?.map((a: any) => (
                                                <div
                                                    key={a.id}
                                                    className="h-5 w-5 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center border border-white"
                                                    title={a.user?.name}
                                                >
                                                    {a.user?.name?.charAt(0) || 'U'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Desktop Layout: Schedule Matrix (Left/Center) + Waiting List (Right Sidebar) */}
            <div className="hidden lg:flex gap-4 items-start">
                {/* Main Schedule Matrix */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
                    {/* Schedule Header: Date Columns with Workload */}
                    <div className="grid border-b border-gray-200 bg-gray-50/80"
                        style={{
                            gridTemplateColumns: groupBy !== 'grid' 
                                ? `260px repeat(${visibleDates.length}, minmax(180px, 1fr))` 
                                : `repeat(${visibleDates.length}, minmax(180px, 1fr))`
                        }}
                    >
                        {/* Top-Left Cell: Grouping title & search */}
                        {groupBy !== 'grid' && (
                            <div className="p-3.5 border-r border-gray-200 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {groupBy === 'responsible' ? 'Team Members' : 'Projects'}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-400">
                                    {groupBy === 'responsible' ? `${activeEmployees.length} people` : `${activeProjects.length} projects`}
                                </span>
                            </div>
                        )}

                        {/* Date Columns Header */}
                        {visibleDates.map((date, idx) => {
                            const dateStr = toDateString(date);
                            const dayLetter = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNum = date.getDate();
                            const today = isToday(date);
                            const colTotalHours = getDateTotalHours(dateStr);

                            return (
                                <div
                                    key={idx}
                                    className={`p-3 text-center border-r border-gray-200 last:border-r-0 transition-colors ${
                                        today ? 'bg-indigo-50/50' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span className={`text-sm font-bold ${today ? 'text-indigo-600' : 'text-gray-900'}`}>
                                            {dayNum} {dayLetter}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-semibold text-gray-400 mt-0.5">
                                        {colTotalHours}
                                    </div>
                                    {today && (
                                        <div className="w-8 h-1 bg-indigo-600 rounded-full mx-auto mt-1.5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Schedule Body */}
                    <div className="divide-y divide-gray-100 max-h-[calc(100vh-270px)] overflow-y-auto overflow-x-auto">
                        {/* MODE 1: Group by responsible (Team Member Rows) */}
                        {groupBy === 'responsible' && (
                            <>
                                {activeEmployees.map(emp => {
                                    const employeeName = emp.user?.name || emp.employee_number || 'Team Member';
                                    const departmentName = emp.department?.name || 'General';
                                    const empTotal = getEmployeeTotalHours(emp.id);

                                    return (
                                        <div
                                            key={emp.id}
                                            className="grid min-h-[140px] hover:bg-gray-50/30 transition-colors"
                                            style={{
                                                gridTemplateColumns: `260px repeat(${visibleDates.length}, minmax(180px, 1fr))`
                                            }}
                                        >
                                            {/* Employee Row Header */}
                                            <div className="p-3.5 border-r border-gray-200 flex flex-col justify-between bg-white sticky left-0 z-10">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm border border-white">
                                                        {emp.user?.profile_photo_url ? (
                                                            <img src={emp.user.profile_photo_url} alt={employeeName} className="h-full w-full rounded-full object-cover" />
                                                        ) : (
                                                            employeeName.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-xs font-bold text-gray-900 truncate" title={employeeName}>
                                                            {employeeName}
                                                        </h4>
                                                        <p className="text-[11px] text-gray-400 truncate">
                                                            {departmentName}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 mt-2">
                                                    <span className="font-semibold text-gray-700">{empTotal}</span>
                                                    <button
                                                        onClick={() => openQuickCreate(toDateString(visibleDates[0]), emp.id)}
                                                        className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        + Assign
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Date Cells for this Employee */}
                                            {visibleDates.map((date, idx) => {
                                                const dateStr = toDateString(date);
                                                const cellTasks = getTasksForCell(dateStr, emp.id);
                                                const cellId = `cell-${emp.id}-${dateStr}`;
                                                const isOver = dragOverCell === cellId;

                                                return (
                                                    <div
                                                        key={idx}
                                                        onDragOver={e => handleDragOver(e, cellId)}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={() => handleDropOnCell(dateStr, emp.id)}
                                                        className={`p-2 border-r border-gray-100 last:border-r-0 min-h-[140px] flex flex-col gap-2 transition-all relative group ${
                                                            isOver ? 'bg-indigo-50/70 ring-2 ring-indigo-400 ring-inset' : ''
                                                        }`}
                                                    >
                                                        {/* Task Cards in this Cell */}
                                                        {cellTasks.map((task: any) => (
                                                            <CalendarTaskCard
                                                                key={task.id}
                                                                task={task}
                                                                onSelect={() => setSelectedTask(task)}
                                                                onDragStart={e => handleDragStart(e, task)}
                                                            />
                                                        ))}

                                                        {/* Quick Add Button on Hover */}
                                                        <button
                                                            onClick={() => openQuickCreate(dateStr, emp.id)}
                                                            className="opacity-0 group-hover:opacity-100 mt-auto py-1 px-2 rounded-lg border border-dashed border-gray-300 text-[11px] font-medium text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <span>+</span> Add task
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}

                                {/* Row for Unassigned Tasks if any */}
                                {(() => {
                                    const unassignedTasks = scheduledTasks.filter(t => !t.assignees || t.assignees.length === 0);
                                    if (unassignedTasks.length === 0) return null;

                                    return (
                                        <div
                                            className="grid min-h-[120px] bg-amber-50/20"
                                            style={{
                                                gridTemplateColumns: `260px repeat(${visibleDates.length}, minmax(180px, 1fr))`
                                            }}
                                        >
                                            <div className="p-3.5 border-r border-gray-200 flex flex-col justify-between bg-white sticky left-0 z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center">
                                                        ?
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-800">Unassigned</h4>
                                                        <p className="text-[10px] text-gray-400">Needs responsible</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {visibleDates.map((date, idx) => {
                                                const dateStr = toDateString(date);
                                                const cellTasks = getTasksForCell(dateStr, 0);
                                                const cellId = `cell-unassigned-${dateStr}`;

                                                return (
                                                    <div
                                                        key={idx}
                                                        onDragOver={e => handleDragOver(e, cellId)}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={() => handleDropOnCell(dateStr, undefined)}
                                                        className="p-2 border-r border-gray-100 last:border-r-0 min-h-[120px] flex flex-col gap-2"
                                                    >
                                                        {cellTasks.map((task: any) => (
                                                            <CalendarTaskCard
                                                                key={task.id}
                                                                task={task}
                                                                onSelect={() => setSelectedTask(task)}
                                                                onDragStart={e => handleDragStart(e, task)}
                                                            />
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </>
                        )}

                        {/* MODE 2: Group by Project */}
                        {groupBy === 'project' && (
                            <>
                                {activeProjects.map(proj => (
                                    <div
                                        key={proj.id}
                                        className="grid min-h-[140px] hover:bg-gray-50/30 transition-colors"
                                        style={{
                                            gridTemplateColumns: `260px repeat(${visibleDates.length}, minmax(180px, 1fr))`
                                        }}
                                    >
                                        <div className="p-3.5 border-r border-gray-200 flex flex-col justify-between bg-white sticky left-0 z-10">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-3.5 h-3.5 rounded-md flex-shrink-0"
                                                    style={{ backgroundColor: proj.color || '#6366f1' }}
                                                />
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-900 truncate" title={proj.name}>
                                                        {proj.name}
                                                    </h4>
                                                    <span className="text-[10px] text-gray-400 capitalize">{proj.status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {visibleDates.map((date, idx) => {
                                            const dateStr = toDateString(date);
                                            const cellTasks = getTasksForCell(dateStr, undefined, proj.id);
                                            const cellId = `cell-proj-${proj.id}-${dateStr}`;

                                            return (
                                                <div
                                                    key={idx}
                                                    onDragOver={e => handleDragOver(e, cellId)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={() => handleDropOnCell(dateStr)}
                                                    className="p-2 border-r border-gray-100 last:border-r-0 min-h-[140px] flex flex-col gap-2 relative group"
                                                >
                                                    {cellTasks.map((task: any) => (
                                                        <CalendarTaskCard
                                                            key={task.id}
                                                            task={task}
                                                            onSelect={() => setSelectedTask(task)}
                                                            onDragStart={e => handleDragStart(e, task)}
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </>
                        )}

                        {/* MODE 3: Date Grid (No Rows) */}
                        {groupBy === 'grid' && (
                            <div
                                className="grid min-h-[450px]"
                                style={{
                                    gridTemplateColumns: `repeat(${visibleDates.length}, minmax(180px, 1fr))`
                                }}
                            >
                                {visibleDates.map((date, idx) => {
                                    const dateStr = toDateString(date);
                                    const cellTasks = getTasksForCell(dateStr);
                                    const cellId = `cell-grid-${dateStr}`;

                                    return (
                                        <div
                                            key={idx}
                                            onDragOver={e => handleDragOver(e, cellId)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={() => handleDropOnCell(dateStr)}
                                            className="p-2.5 border-r border-gray-100 last:border-r-0 min-h-[450px] flex flex-col gap-2 relative group"
                                        >
                                            {cellTasks.map((task: any) => (
                                                <CalendarTaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onSelect={() => setSelectedTask(task)}
                                                    onDragStart={e => handleDragStart(e, task)}
                                                />
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar: "Waiting list" Backlog */}
                {showWaitingList && (
                    <div
                        onDragOver={e => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            setDragOverCell('waiting-list');
                        }}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDropOnWaitingList}
                        className={`w-80 flex-shrink-0 bg-white rounded-2xl border transition-all duration-200 flex flex-col shadow-sm ${
                            dragOverCell === 'waiting-list'
                                ? 'border-indigo-400 bg-indigo-50/30 ring-2 ring-indigo-200'
                                : 'border-gray-200/80'
                        }`}
                        style={{ height: 'calc(100vh - 200px)' }}
                    >
                        {/* Waiting list Header */}
                        <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900">Waiting list</h3>
                                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {displayedWaitingList.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => openQuickCreate()}
                                    title="Add to waiting list"
                                    className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowWaitingList(false)}
                                    title="Collapse"
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Search in Waiting List */}
                        <div className="px-3.5 py-2 border-b border-gray-100">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search backlog tasks..."
                                    value={waitingListSearch}
                                    onChange={e => setWaitingListSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                />
                                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Drag Instructions Tip */}
                        <div className="px-3.5 py-2 bg-indigo-50/50 text-[11px] text-indigo-700 flex items-center gap-1.5 border-b border-indigo-100/50">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Drag cards directly onto calendar to schedule</span>
                        </div>

                        {/* Waiting List Cards */}
                        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
                            {displayedWaitingList.length === 0 ? (
                                <div className="py-12 text-center text-gray-400 text-xs">
                                    No backlog tasks found
                                </div>
                            ) : (
                                displayedWaitingList.map(task => (
                                    <CalendarTaskCard
                                        key={task.id}
                                        task={task}
                                        isWaitingList
                                        onSelect={() => setSelectedTask(task)}
                                        onDragStart={e => handleDragStart(e, task)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    currentUser={auth.user}
                    project={selectedTask.project}
                    employees={employees}
                    statuses={statuses}
                    priorities={priorities}
                />
            )}

            <CreateTaskModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                employees={employees}
                statuses={statuses}
                priorities={priorities}
                projects={projects}
                defaultDeadline={createDefaultDate}
                defaultAssignees={createDefaultAssignees}
            />
        </AuthenticatedLayout>
    );
}

// Subcomponent: Pastel Task Card matching the user's reference screenshot
function CalendarTaskCard({
    task,
    isWaitingList = false,
    onSelect,
    onDragStart,
}: {
    task: any;
    isWaitingList?: boolean;
    onSelect: () => void;
    onDragStart: (e: React.DragEvent) => void;
}) {
    const theme = getPastelTheme(task);
    const completedChecklists = task.checklists?.filter((c: any) => c.is_completed).length || 0;
    const totalChecklists = task.checklists?.length || 0;
    const isUrgent = task.priority === 'Urgent';

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onSelect}
            className={`group/card rounded-xl p-3 border transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md ${
                theme.bg
            } ${theme.border} ${theme.hover} select-none relative`}
        >
            {/* Top row: Duration / Time + Project Badge */}
            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                <span className={`text-[11px] font-bold ${theme.timeText} flex items-center gap-1`}>
                    <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(task.estimated_duration)}
                </span>

                {isUrgent && (
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        ASAP
                    </span>
                )}
            </div>

            {/* Task Title */}
            <h5 className={`font-semibold text-xs leading-snug line-clamp-2 ${theme.text} mb-1.5`}>
                {task.title}
            </h5>

            {/* Project Name */}
            {task.project && (
                <p className="text-[10px] font-medium text-gray-500 mb-2 truncate">
                    {task.project.name}
                </p>
            )}

            {/* Footer row: Checklist progress, comment count, and assignee avatar */}
            <div className="flex items-center justify-between pt-1.5 border-t border-black/5 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                    {totalChecklists > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-600" title="Checklist progress">
                            ✓ {completedChecklists}/{totalChecklists}
                        </span>
                    )}
                    {task.comments?.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-600" title="Comments">
                            💬 {task.comments.length}
                        </span>
                    )}
                </div>

                {/* Assignees Avatars */}
                <div className="flex -space-x-1">
                    {task.assignees?.slice(0, 2).map((a: any) => (
                        <div
                            key={a.id}
                            className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[9px] font-bold flex items-center justify-center border border-white shadow-xs"
                            title={a.user?.name || 'Assignee'}
                        >
                            {a.user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    ))}
                    {task.assignees?.length > 2 && (
                        <div className="h-5 w-5 rounded-full bg-gray-200 text-gray-600 text-[8px] font-bold flex items-center justify-center border border-white">
                            +{task.assignees.length - 2}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
