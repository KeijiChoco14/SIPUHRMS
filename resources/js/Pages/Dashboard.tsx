import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import EmployeeDashboard from './Dashboard/Partials/EmployeeDashboard';
import SupervisorDashboard from './Dashboard/Partials/SupervisorDashboard';
import HRDashboard from './Dashboard/Partials/HRDashboard';
import ManagerDashboard from './Dashboard/Partials/ManagerDashboard';

interface LauncherStats {
    activeTasks?: number;
    masterKeyOnRequest?: number;
    pendingLeaves?: number;
    pendingOvertime?: number;
    totalEmployees?: number;
    totalDepartments?: number;
}

interface DashboardProps {
    view?: string;
    role: string;
    launcherStats?: LauncherStats;
    announcements?: any[];
    employeeData?: any;
    supervisorData?: any;
    hrData?: any;
    managerData?: any;
}

interface AppItem {
    id: string;
    name: string;
    description: string;
    category: string;
    href?: string;
    action?: () => void;
    icon: React.ReactNode;
    gradient: string;
    badge?: string | number | null;
    badgeColor?: string;
    visible?: boolean;
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
}

function getTodayDate(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function Dashboard({
    view = 'launcher',
    role,
    launcherStats = {},
    announcements = [],
    employeeData,
    supervisorData,
    hrData,
    managerData,
}: DashboardProps) {
    const user = usePage().props.auth.user as any;
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const isSuperAdmin = user.roles?.some((r: any) => r.name === 'Super Admin');
    const isHRD = user.roles?.some((r: any) => r.name === 'HRD / Admin');
    const isManager = user.roles?.some((r: any) => r.name === 'General Manager');
    const isSupervisor = user.roles?.some((r: any) => ['Supervisor', 'Head of Department'].includes(r.name));
    // Management / HRD access level (Super Admin, HRD / Admin, General Manager)
    const isAdmin = isSuperAdmin || isHRD || isManager;
    const canViewPerformance = isAdmin;
    const canViewProjects = isAdmin || isSupervisor;

    // Listen for Ctrl+K / Cmd+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Define all Desk Apps
    const apps: AppItem[] = useMemo(() => [
        {
            id: 'task-management',
            name: 'Task Management',
            description: 'Manage team tasks, kanban boards, and calendar schedules',
            category: 'Operations',
            action: () => router.get(route('dashboard'), { view: 'tasks' }),
            gradient: 'from-blue-500 to-indigo-600',
            badge: launcherStats.activeTasks && launcherStats.activeTasks > 0 ? `${launcherStats.activeTasks} Tasks` : null,
            badgeColor: 'bg-indigo-600',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            id: 'housekeeping-key',
            name: 'Housekeeping (HK)',
            description: 'Hotel master key access requests and extensions',
            category: 'Hotel Operations',
            href: route('master-keys.index'),
            gradient: 'from-amber-500 to-orange-600',
            badge: launcherStats.masterKeyOnRequest && launcherStats.masterKeyOnRequest > 0 ? `${launcherStats.masterKeyOnRequest} Requests` : null,
            badgeColor: 'bg-amber-500',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            ),
        },
        {
            id: 'human-resources',
            name: 'Human Resources (HR)',
            description: 'Employee records, organization, attendance, leave & payroll',
            category: 'People & HR',
            action: () => router.get(route('dashboard'), { view: 'hr' }),
            gradient: 'from-purple-500 to-indigo-600',
            badge: launcherStats.totalEmployees && launcherStats.totalEmployees > 0 ? `${launcherStats.totalEmployees} Staff` : null,
            badgeColor: 'bg-purple-600',
            visible: isAdmin,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            id: 'employees',
            name: 'Employee Records',
            description: 'Manage employee identity, job history, and employment contracts',
            category: 'People & HR',
            href: route('employees.index'),
            gradient: 'from-fuchsia-600 to-pink-600',
            badge: launcherStats.totalEmployees && launcherStats.totalEmployees > 0 ? `${launcherStats.totalEmployees} Staff` : null,
            badgeColor: 'bg-fuchsia-600',
            visible: isAdmin,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            id: 'attendance',
            name: isAdmin ? 'Attendance & Schedules' : 'My Attendance',
            description: isAdmin
                ? 'Daily attendance logs, employee clock-ins, and shift rosters'
                : 'Your personal daily attendance records and work hours history',
            category: 'Time & Pay',
            href: isAdmin ? route('attendance.index') : route('attendance.my'),
            gradient: 'from-teal-500 to-emerald-600',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            id: 'leave',
            name: 'Leave Requests',
            description: 'Annual leave, sick leave requests, and manager approvals',
            category: 'Time & Pay',
            href: route('leave.index'),
            gradient: 'from-sky-500 to-blue-600',
            badge: launcherStats.pendingLeaves && launcherStats.pendingLeaves > 0 ? `${launcherStats.pendingLeaves} Pending` : null,
            badgeColor: 'bg-sky-600',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            id: 'overtime',
            name: 'Overtime Requests',
            description: 'Overtime work orders (SPKL) and hour calculations',
            category: 'Time & Pay',
            href: route('overtime.index'),
            gradient: 'from-rose-500 to-red-600',
            badge: launcherStats.pendingOvertime && launcherStats.pendingOvertime > 0 ? `${launcherStats.pendingOvertime} Pending` : null,
            badgeColor: 'bg-rose-600',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
        },
        {
            id: 'payroll',
            name: isAdmin ? 'Payroll Management' : 'My Payslips',
            description: isAdmin
                ? 'Manage payroll batches, generate salaries, and monthly compensation reports'
                : 'Monthly payslip breakdown, allowances, and personal salary records',
            category: 'Time & Pay',
            href: isAdmin ? route('payroll.index') : route('payroll.my'),
            gradient: 'from-emerald-600 to-teal-700',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            id: 'projects',
            name: 'Team Projects',
            description: 'Project grouping, milestone targets, and work progress',
            category: 'Operations',
            href: route('projects.index'),
            gradient: 'from-violet-500 to-purple-600',
            visible: canViewProjects,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
        {
            id: 'directory',
            name: 'Staff Directory',
            description: 'Contact directory of all employees, departments, and positions',
            category: 'Company',
            href: route('directory.index'),
            gradient: 'from-cyan-500 to-blue-500',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
        },
        {
            id: 'announcements',
            name: 'Announcements',
            description: 'Company memos, official news, and hotel announcements',
            category: 'Company',
            href: route('announcements.index'),
            gradient: 'from-pink-500 to-rose-600',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            ),
        },
        {
            id: 'documents',
            name: 'Documents & SOP',
            description: 'Digital repository of SOPs, hotel forms, and policy archives',
            category: 'Company',
            href: route('documents.index'),
            gradient: 'from-slate-600 to-gray-700',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            id: 'performance',
            name: 'Reports & KPI',
            description: 'Staff performance evaluation, EPI scoring, and performance analytics',
            category: 'Management',
            href: route('performance.index'),
            gradient: 'from-indigo-600 to-violet-700',
            visible: canViewPerformance,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            id: 'departments',
            name: 'Departments',
            description: 'Hotel organization structure, department divisions, and headcounts',
            category: 'People & HR',
            href: route('departments.index'),
            gradient: 'from-blue-600 to-cyan-600',
            visible: isAdmin,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            id: 'settings',
            name: 'System Settings',
            description: 'System configurations, roles & permissions, and audit logs',
            category: 'Administration',
            href: route('settings.index'),
            gradient: 'from-zinc-700 to-slate-900',
            visible: isSuperAdmin,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
        {
            id: 'my-overview',
            name: 'Personal Dashboard',
            description: 'Personal work stats, individual attendance, and account performance',
            category: 'Personal',
            action: () => router.get(route('dashboard'), { view: 'overview' }),
            gradient: 'from-indigo-700 to-sky-700',
            visible: true,
            icon: (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ].filter(a => a.visible !== false), [launcherStats, isAdmin, isSuperAdmin, canViewPerformance, canViewProjects]);

    // Filter apps based on search query
    const filteredApps = useMemo(() => {
        if (!searchQuery.trim()) return apps;
        const q = searchQuery.toLowerCase().trim();
        return apps.filter(
            app =>
                app.name.toLowerCase().includes(q) ||
                app.description.toLowerCase().includes(q) ||
                app.category.toLowerCase().includes(q)
        );
    }, [apps, searchQuery]);

    // Handle open first matching app on Enter
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && filteredApps.length > 0) {
            e.preventDefault();
            const firstApp = filteredApps[0];
            if (firstApp.action) {
                firstApp.action();
            } else if (firstApp.href) {
                router.visit(firstApp.href);
            }
        }
    };

    // Sub-Workspace: TASK MANAGEMENT
    if (view === 'tasks') {
        const tasksSummary = employeeData?.tasksSummary || {
            todo: 0,
            in_progress: 0,
            review: 0,
            done: 0,
            overdue: 0,
        };
        const upcomingTasks = employeeData?.upcomingTasks || [];
        const recentActivities = employeeData?.recentActivities || [];
        const projectProgress = supervisorData?.projectProgress || managerData?.projectProgress || [];

        return (
            <AuthenticatedLayout
                hideSidebar={false}
                header={
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-0.5">
                                <Link href={route('dashboard')} className="hover:underline flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Main Menu
                                </Link>
                                <span>/</span>
                                <span className="text-gray-500">Task Management</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                Task Management Workspace
                            </h2>
                        </div>
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Desk Launcher
                        </Link>
                    </div>
                }
            >
                <Head title="Task Management Workspace - Swiss-Belinn" />

                <div className="space-y-6">
                    {/* Action Tabs Bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
                                Task Summary
                            </span>
                            <Link
                                href={route('tasks.index')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                                My Tasks
                            </Link>
                            <Link
                                href={route('tasks.kanban')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                                Kanban Board
                            </Link>
                            <Link
                                href={route('tasks.calendar')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                                Task Calendar
                            </Link>
                            {canViewProjects && (
                                <Link
                                    href={route('projects.index')}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                >
                                    Projects ({projectProgress.length})
                                </Link>
                            )}
                        </div>

                        <Link
                            href={route('tasks.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Task
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-xs text-gray-500 font-medium">To Do (Queue)</span>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{tasksSummary.todo}</p>
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-xs text-gray-500 font-medium">In Progress</span>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{tasksSummary.in_progress}</p>
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mt-2"></span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-xs text-gray-500 font-medium">Awaiting Review</span>
                            <p className="text-2xl font-bold text-purple-600 mt-1">{tasksSummary.review}</p>
                            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mt-2"></span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-xs text-gray-500 font-medium">Completed</span>
                            <p className="text-2xl font-bold text-emerald-600 mt-1">{tasksSummary.done}</p>
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mt-2"></span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
                            <span className="text-xs text-gray-500 font-medium">Overdue</span>
                            <p className="text-2xl font-bold text-red-600 mt-1">{tasksSummary.overdue}</p>
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-2"></span>
                        </div>
                    </div>

                    {/* Upcoming Deadlines & Recent Activities */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Upcoming Deadlines */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 text-sm">Upcoming Deadlines</h3>
                                <Link href={route('tasks.index')} className="text-xs text-indigo-600 hover:underline">
                                    View All →
                                </Link>
                            </div>
                            {upcomingTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingTasks.map((task: any) => (
                                        <Link
                                            key={task.id}
                                            href={route('tasks.show', task.id)}
                                            className="p-3 rounded-xl bg-gray-50 hover:bg-indigo-50/50 transition-colors flex items-center justify-between gap-3 group border border-gray-100"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 truncate">
                                                    {task.title}
                                                </p>
                                                <span className="text-[10px] text-gray-500">
                                                    Status: {task.status} • Priority: {task.priority}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg shrink-0">
                                                {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '-'}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-6">No tasks with upcoming deadlines.</p>
                            )}
                        </div>

                        {/* Recent Activities */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 text-sm">Recent Activities</h3>
                                <span className="text-xs text-gray-400">Task Logs</span>
                            </div>
                            {recentActivities.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivities.map((act: any) => (
                                        <div key={act.id} className="flex items-start gap-3 text-xs">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-800 font-medium truncate">
                                                    {act.employee?.user?.name || 'User'} {act.activity_type} on{' '}
                                                    <span className="font-bold">{act.task?.title || 'Task'}</span>
                                                </p>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(act.created_at).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 text-center py-6">No recent task activity history.</p>
                            )}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Sub-Workspace: HUMAN RESOURCES (HR)
    if (view === 'hr') {
        return (
            <AuthenticatedLayout
                hideSidebar={false}
                header={
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold mb-0.5">
                                <Link href={route('dashboard')} className="hover:underline flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Main Menu
                                </Link>
                                <span>/</span>
                                <span className="text-gray-500">Human Resources (HR)</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                Human Resources Workspace
                            </h2>
                        </div>
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Desk Launcher
                        </Link>
                    </div>
                }
            >
                <Head title="Human Resources (HR) - Swiss-Belinn" />

                <div className="space-y-6">
                    {/* Action Tabs Bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-sm shadow-purple-600/30">
                                HR Summary
                            </span>
                            {isAdmin && (
                                <>
                                    <Link
                                        href={route('employees.index')}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                    >
                                        Employee Records
                                    </Link>
                                    <Link
                                        href={route('departments.index')}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                    >
                                        Departments & Divisions
                                    </Link>
                                    <Link
                                        href={route('attendance.index')}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                    >
                                        Attendance Logs
                                    </Link>
                                    <Link
                                        href={route('schedules.index')}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                    >
                                        Schedules & Shifts
                                    </Link>
                                </>
                            )}
                            <Link
                                href={route('leave.index')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                                Leave Requests
                            </Link>
                            <Link
                                href={route('overtime.index')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                                Overtime (SPKL)
                            </Link>
                            <Link
                                href={route('directory.index')}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            >
                                Staff Directory
                            </Link>
                        </div>
                    </div>

                    {/* HR Dashboard partial */}
                    <HRDashboard data={{ ...hrData, announcements }} />
                </div>
            </AuthenticatedLayout>
        );
    }

    // Sub-Workspace: OVERVIEW / PERSONAL DASHBOARD
    if (view === 'overview') {
        const renderRoleDashboard = () => {
            if (role === 'Staff / Employee' || role === 'OJT / Trainee') {
                return <EmployeeDashboard data={{ ...employeeData, announcements }} />;
            } else if (role === 'Supervisor' || role === 'Head of Department') {
                return <SupervisorDashboard data={{ ...supervisorData, announcements }} />;
            } else if (role === 'HRD / Admin') {
                return <HRDashboard data={{ ...hrData, announcements }} />;
            } else if (role === 'General Manager' || role === 'Super Admin') {
                return <ManagerDashboard data={{ ...managerData, announcements }} />;
            }
            return <EmployeeDashboard data={{ ...employeeData, announcements }} />;
        };

        return (
            <AuthenticatedLayout
                hideSidebar={false}
                header={
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-0.5">
                                <Link href={route('dashboard')} className="hover:underline flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Main Menu
                                </Link>
                                <span>/</span>
                                <span className="text-gray-500">Personal Dashboard</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                {getGreeting()}, {user.name} 👋
                            </h2>
                        </div>
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Desk Launcher
                        </Link>
                    </div>
                }
            >
                <Head title="Personal Dashboard - Swiss-Belinn" />
                {renderRoleDashboard()}
            </AuthenticatedLayout>
        );
    }

    // MAIN VIEW: FRAPPE / ERPNEXT DESK APP LAUNCHER
    return (
        <AuthenticatedLayout
            hideSidebar={true}
            header={
                <div className="relative w-full max-w-lg mx-auto">
                    <div className="relative flex items-center">
                        <svg
                            className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search modules or apps..."
                            className="w-full pl-10 pr-16 py-2 text-sm bg-gray-100/90 hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-800 placeholder-gray-400"
                        />
                        <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
                            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 rounded shadow-2xs">Ctrl</kbd>
                            <kbd className="hidden sm:inline-block px-1 py-0.5 text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 rounded shadow-2xs">K</kbd>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Main Menu - SIPU Swiss-Belinn" />

            <div className="py-6 sm:py-10 space-y-10">
                {/* Greeting & Header Bar */}
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {getTodayDate()} • Swiss-Belinn SKA Pekanbaru
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {getGreeting()}, {user.name} 👋
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Select an application module below to open your workspace
                    </p>
                </div>

                {/* Announcement Ticker (if any) */}
                {announcements.length > 0 && !searchQuery && (
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href={route('announcements.index')}
                            className="block p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/80 hover:border-indigo-200 shadow-xs hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                                            Latest Announcement
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {announcements[0]?.title}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-700 font-medium truncate mt-0.5">
                                        {announcements[0]?.content}
                                    </p>
                                </div>
                                <span className="text-xs text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform shrink-0 hidden sm:inline">
                                    Open →
                                </span>
                            </div>
                        </Link>
                    </div>
                )}

                {/* APP LAUNCHER GRID (Frappe Desk style) */}
                <div className="max-w-5xl mx-auto">
                    {filteredApps.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-6 sm:gap-x-10 gap-y-8 sm:gap-y-12 place-items-center">
                            {filteredApps.map((app) => {
                                const CardContent = (
                                    <div className="flex flex-col items-center group cursor-pointer focus:outline-none">
                                        {/* Squircle App Icon */}
                                        <div className="relative">
                                            <div
                                                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-[22px] bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-md shadow-gray-200/80 group-hover:shadow-xl group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 ease-out`}
                                            >
                                                {app.icon}
                                            </div>

                                            {/* Badge Notification */}
                                            {app.badge && (
                                                <span className={`absolute -top-1.5 -right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-md border-2 border-white animate-pulse ${app.badgeColor || 'bg-red-500'}`}>
                                                    {app.badge}
                                                </span>
                                            )}
                                        </div>

                                        {/* App Title */}
                                        <span className="mt-3 text-xs sm:text-[13px] font-semibold text-gray-700 group-hover:text-indigo-600 text-center tracking-tight transition-colors line-clamp-2 max-w-[110px] leading-snug">
                                            {app.name}
                                        </span>
                                    </div>
                                );

                                if (app.href) {
                                    return (
                                        <Link key={app.id} href={app.href} title={app.description}>
                                            {CardContent}
                                        </Link>
                                    );
                                }

                                return (
                                    <button
                                        key={app.id}
                                        type="button"
                                        onClick={app.action}
                                        title={app.description}
                                        className="bg-transparent border-0 p-0"
                                    >
                                        {CardContent}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-base">Module Not Found</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    No application matches the keyword "{searchQuery}"
                                </p>
                            </div>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                            >
                                Reset Search
                            </button>
                        </div>
                    )}
                </div>

                {/* Desk Footer Quick Stats */}
                <div className="pt-8 border-t border-gray-200/60 max-w-4xl mx-auto flex flex-wrap items-center justify-between text-xs text-gray-400 gap-4">
                    <div className="flex items-center gap-4">
                        <span>Role: <strong className="text-gray-700 font-semibold">{role}</strong></span>
                        <span>•</span>
                        <span>Total Modules: <strong className="text-gray-700 font-semibold">{apps.length}</strong></span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                        SIPU Management System • Swiss-Belinn SKA Pekanbaru
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
