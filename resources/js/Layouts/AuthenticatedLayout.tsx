import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect, useMemo } from 'react';

const icons: Record<string, JSX.Element> = {
    'Main Menu': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    'Menu Utama': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
    'HR Dashboard': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    'Dashboard HR': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    'Task Summary': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    'Ringkasan Tugas': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    'Personal Dashboard': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    'Dashboard Pribadi': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Projects: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    'My Tasks': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    Kanban: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
    Calendar: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Employees: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Departments: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    'My Attendance': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Attendance Logs': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Shifts & Roster': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    'Leave Requests': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    'Overtime': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Overtime (SPKL)': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    'My Payslips': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    'Payroll Management': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    'Employee Directory': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Announcements: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
    Documents: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    'Reports & EPI': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    'Roles & Permissions': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    'Audit Logs': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    'System Settings': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    'Master Key Access': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    'Master Key Requests': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    'Form & Log Master Key': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    'Profile Settings': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

const roleBadgeColors: Record<string, string> = {
    'Super Admin': 'bg-red-100 text-red-700',
    'HRD / Admin': 'bg-purple-100 text-purple-700',
    'General Manager': 'bg-amber-100 text-amber-700',
    'Head of Department': 'bg-blue-100 text-blue-700',
    'Supervisor': 'bg-teal-100 text-teal-700',
    'Staff / Employee': 'bg-slate-100 text-slate-700',
};

interface ModuleInfo {
    key: string;
    title: string;
    subtitle: string;
    badgeBg: string;
    badgeBorder: string;
    dotColor: string;
    sections: {
        title: string;
        items: {
            name: string;
            route: string;
            params?: Record<string, any>;
            pattern: string;
        }[];
    }[];
}

export default function Authenticated({
    user: _ignoredUser,
    header,
    children,
    hideSidebar = false,
}: PropsWithChildren<{ header?: ReactNode; user?: any; hideSidebar?: boolean }>) {
    const user = usePage().props.auth.user as any;
    const currentUrl = usePage().url;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [navigatingMethod, setNavigatingMethod] = useState<'get' | 'post' | 'put' | 'patch' | 'delete'>('get');

    // Sidebar open/close state with localStorage persistence
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sipu_sidebar_open');
            if (saved !== null) return saved === 'true';
        }
        return true;
    });

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sipu_sidebar_open', String(next));
            }
            return next;
        });
    };

    // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const removeStart = router.on('start', (event: any) => {
            setIsNavigating(true);
            const method = (event.detail?.visit?.method || 'get').toLowerCase();
            setNavigatingMethod(method as any);
        });

        const removeFinish = router.on('finish', () => setIsNavigating(false));
        const removeError = router.on('error', () => setIsNavigating(false));
        const removeCancel = router.on('cancel', () => setIsNavigating(false));

        return () => {
            removeStart();
            removeFinish();
            removeError();
            removeCancel();
        };
    }, []);

    const userRole = user.roles?.[0]?.name ?? 'Staff / Employee';
    const isSuperAdmin = user.roles?.some((r: any) => r.name === 'Super Admin');
    const isHRD = user.roles?.some((r: any) => r.name === 'HRD / Admin');
    const isManager = user.roles?.some((r: any) => r.name === 'General Manager');
    const isSupervisor = user.roles?.some((r: any) => ['Supervisor', 'Head of Department'].includes(r.name));
    // Hak akses level manajemen / HRD (Super Admin, HRD / Admin, General Manager)
    const isAdmin = isSuperAdmin || isHRD || isManager;
    const canViewPerformance = isAdmin;
    const canViewProjects = isAdmin || isSupervisor;

    // Detect active module and provide strictly contextual menus
    const activeModuleInfo = useMemo<ModuleInfo>(() => {
        // 1. Task Management
        if (
            currentUrl.includes('view=tasks') ||
            route().current('tasks.*') ||
            route().current('projects.*')
        ) {
            return {
                key: 'tasks',
                title: 'Task Management',
                subtitle: 'Workspace & Projects',
                badgeBg: 'bg-blue-50',
                badgeBorder: 'border-blue-200',
                dotColor: 'bg-blue-600',
                sections: [
                    {
                        title: 'Task Workspace',
                        items: [
                            { name: 'Task Summary', route: 'dashboard', params: { view: 'tasks' }, pattern: 'dashboard' },
                            { name: 'My Tasks', route: 'tasks.index', pattern: 'tasks.index' },
                            { name: 'Kanban', route: 'tasks.kanban', pattern: 'tasks.kanban' },
                            { name: 'Calendar', route: 'tasks.calendar', pattern: 'tasks.calendar' },
                            canViewProjects ? { name: 'Projects', route: 'projects.index', pattern: 'projects.*' } : null,
                        ].filter(Boolean) as any[],
                    },
                ],
            };
        }

        // 2. Housekeeping (HK)
        if (route().current('master-keys.*') || currentUrl.includes('/master-keys')) {
            return {
                key: 'housekeeping',
                title: 'Housekeeping (HK)',
                subtitle: 'Hotel Key Operations',
                badgeBg: 'bg-amber-50',
                badgeBorder: 'border-amber-200',
                dotColor: 'bg-amber-500',
                sections: [
                    {
                        title: 'Master Key Operations',
                        items: [
                            { name: 'Master Key Requests', route: 'master-keys.index', pattern: 'master-keys.*' },
                        ],
                    },
                ],
            };
        }

        // 3. Human Resources (HR)
        if (
            currentUrl.includes('view=hr') ||
            route().current('employees.*') ||
            route().current('departments.*') ||
            route().current('attendance.*') ||
            route().current('schedules.*') ||
            route().current('shifts.*') ||
            route().current('leave.*') ||
            route().current('overtime.*') ||
            route().current('payroll.*') ||
            route().current('directory.*') ||
            route().current('performance.*') ||
            currentUrl.includes('/employees') ||
            currentUrl.includes('/departments') ||
            currentUrl.includes('/attendance') ||
            currentUrl.includes('/leave') ||
            currentUrl.includes('/overtime') ||
            currentUrl.includes('/payroll') ||
            currentUrl.includes('/directory') ||
            currentUrl.includes('/performance')
        ) {
            return {
                key: 'hr',
                title: 'Human Resources (HR)',
                subtitle: 'People & Organization',
                badgeBg: 'bg-purple-50',
                badgeBorder: 'border-purple-200',
                dotColor: 'bg-purple-600',
                sections: [
                    isAdmin && {
                        title: 'HR Summary',
                        items: [
                            { name: 'HR Dashboard', route: 'dashboard', params: { view: 'hr' }, pattern: 'dashboard' },
                        ],
                    },
                    {
                        title: 'Employees & Organization',
                        items: [
                            isAdmin ? { name: 'Employees', route: 'employees.index', pattern: 'employees.*' } : null,
                            isAdmin ? { name: 'Departments', route: 'departments.index', pattern: 'departments.*' } : null,
                            { name: 'Employee Directory', route: 'directory.index', pattern: 'directory.index' },
                        ].filter(Boolean) as any[],
                    },
                    {
                        title: 'Attendance & Schedules',
                        items: [
                            { name: 'My Attendance', route: 'attendance.my', pattern: 'attendance.my' },
                            isAdmin ? { name: 'Attendance Logs', route: 'attendance.index', pattern: 'attendance.index' } : null,
                            isAdmin ? { name: 'Shifts & Roster', route: 'schedules.index', pattern: 'schedules.*|shifts.*' } : null,
                        ].filter(Boolean) as any[],
                    },
                    {
                        title: 'Leave & Overtime',
                        items: [
                            { name: 'Leave Requests', route: 'leave.index', pattern: 'leave.*' },
                            { name: 'Overtime (SPKL)', route: 'overtime.index', pattern: 'overtime.*' },
                        ],
                    },
                    {
                        title: 'Compensation & Payroll',
                        items: [
                            { name: 'My Payslips', route: 'payroll.my', pattern: 'payroll.my' },
                            isAdmin ? { name: 'Payroll Management', route: 'payroll.index', pattern: 'payroll.index' } : null,
                        ].filter(Boolean) as any[],
                    },
                    canViewPerformance && {
                        title: 'Performance & Evaluation',
                        items: [
                            { name: 'Reports & EPI', route: 'performance.index', pattern: 'performance.*' },
                        ],
                    },
                ].filter(Boolean) as any[],
            };
        }

        // 4. Company & Documents
        if (
            route().current('announcements.*') ||
            route().current('documents.*') ||
            currentUrl.includes('/announcements') ||
            currentUrl.includes('/documents')
        ) {
            return {
                key: 'company',
                title: 'Company & Documents',
                subtitle: 'Archives & Information',
                badgeBg: 'bg-teal-50',
                badgeBorder: 'border-teal-200',
                dotColor: 'bg-teal-600',
                sections: [
                    {
                        title: 'Hotel Information',
                        items: [
                            { name: 'Announcements', route: 'announcements.index', pattern: 'announcements.index' },
                            { name: 'Documents', route: 'documents.index', pattern: 'documents.index' },
                            { name: 'Employee Directory', route: 'directory.index', pattern: 'directory.index' },
                        ],
                    },
                ],
            };
        }

        // 5. System Administration
        if (
            route().current('roles.*') ||
            route().current('audit-logs.*') ||
            route().current('settings.*') ||
            currentUrl.includes('/roles') ||
            currentUrl.includes('/audit-logs') ||
            currentUrl.includes('/settings')
        ) {
            return {
                key: 'admin',
                title: 'System & Administration',
                subtitle: 'Super Admin Center',
                badgeBg: 'bg-slate-100',
                badgeBorder: 'border-slate-200',
                dotColor: 'bg-slate-700',
                sections: [
                    {
                        title: 'Administration',
                        items: [
                            { name: 'Roles & Permissions', route: 'roles.index', pattern: 'roles.*' },
                            { name: 'Audit Logs', route: 'audit-logs.index', pattern: 'audit-logs.*' },
                            { name: 'System Settings', route: 'settings.index', pattern: 'settings.*' },
                        ],
                    },
                ],
            };
        }

        // 6. Personal Profile & Overview
        if (
            currentUrl.includes('view=overview') ||
            route().current('profile.*') ||
            currentUrl.includes('/profile')
        ) {
            return {
                key: 'overview',
                title: 'Account & Profile',
                subtitle: 'Personal Space',
                badgeBg: 'bg-sky-50',
                badgeBorder: 'border-sky-200',
                dotColor: 'bg-sky-600',
                sections: [
                    {
                        title: 'Personal Space',
                        items: [
                            { name: 'Personal Dashboard', route: 'dashboard', params: { view: 'overview' }, pattern: 'dashboard' },
                            { name: 'Profile Settings', route: 'profile.edit', pattern: 'profile.*' },
                            { name: 'My Attendance', route: 'attendance.my', pattern: 'attendance.my' },
                            { name: 'My Payslips', route: 'payroll.my', pattern: 'payroll.my' },
                        ],
                    },
                ],
            };
        }

        // Default Fallback
        return {
            key: 'general',
            title: 'Workspace',
            subtitle: 'Swiss-Belinn SKA',
            badgeBg: 'bg-gray-100',
            badgeBorder: 'border-gray-200',
            dotColor: 'bg-indigo-600',
            sections: [
                {
                    title: 'Workspace',
                    items: [
                        { name: 'Main Menu', route: 'dashboard', pattern: 'dashboard' },
                    ],
                },
            ],
        };
    }, [currentUrl, isAdmin, isManager, isSupervisor, canViewPerformance, canViewProjects]);

    const getItemHref = (item: any): string => {
        return (item.params ? route(item.route, item.params) : route(item.route)) as unknown as string;
    };

    const isItemActive = (item: any) => {
        if (item.params?.view) {
            return route().current(item.pattern) && currentUrl.includes(`view=${item.params.view}`);
        }
        if (item.route === 'dashboard') {
            return route().current('dashboard') && !currentUrl.includes('view=');
        }
        return route().current(item.pattern);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex selection:bg-indigo-500 selection:text-white">
            {/* Desktop Sidebar (Only rendered when hideSidebar is false and isSidebarOpen is true) */}
            {!hideSidebar && isSidebarOpen && (
                <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 min-h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 shrink-0">
                    {/* Brand Header with Close / Collapse Button */}
                    <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
                        <Link href="/" className="flex items-center min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden shrink-0">
                                <ApplicationLogo className="h-full w-full object-cover" />
                            </div>
                            <div className="ml-2.5 min-w-0">
                                <span className="font-bold text-white text-xs tracking-tight block truncate">SIPU Management</span>
                                <span className="block text-[9px] text-indigo-200 leading-none">Swiss-Belinn SKA</span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            title="Collapse Sidebar (Ctrl+B)"
                            className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors ml-2 shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Quick Link: Return to Desk Launcher (Main Menu) */}
                    <div className="p-3 pb-2 border-b border-gray-100/80">
                        <Link
                            href={route('dashboard')}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-all border border-gray-200/60 group font-semibold text-xs shadow-2xs"
                            title="Back to Main Menu (App Launcher)"
                        >
                            <div className="w-6 h-6 rounded-lg bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <span className="truncate">← Main Menu (Desk)</span>
                        </Link>
                    </div>

                    {/* Active Module Indicator Card */}
                    <div className="px-3 pt-3 pb-1">
                        <div className={`p-2.5 rounded-xl ${activeModuleInfo.badgeBg} border ${activeModuleInfo.badgeBorder}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block leading-tight">Active Module</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${activeModuleInfo.dotColor} shrink-0`}></span>
                                <span className="text-xs font-bold text-gray-800 truncate">{activeModuleInfo.title}</span>
                            </div>
                        </div>
                    </div>

                    {/* Module Navigation (Only active module menus) */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                        {activeModuleInfo.sections.map((section, idx) => (
                            <div key={idx}>
                                <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                    {section.title}
                                </h3>
                                <ul className="space-y-0.5">
                                    {section.items.map((item: any, itemIdx: number) => {
                                        const active = isItemActive(item);
                                        return (
                                            <li key={itemIdx}>
                                                <Link
                                                    href={getItemHref(item)}
                                                    className={`group flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-200 ${
                                                        active
                                                            ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700 shadow-sm shadow-indigo-100/50 ring-1 ring-indigo-50 font-semibold'
                                                            : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:translate-x-1'
                                                    }`}
                                                >
                                                    <span className={`transition-colors shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                        {icons[item.name] || <span className="w-5 h-5 rounded bg-gray-200 inline-block" />}
                                                    </span>
                                                    <span className="truncate">{item.name}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* User Profile & Collapse Sidebar Footer */}
                    <div className="border-t border-gray-100 p-3 bg-white/50">
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 shadow-xs shrink-0">
                                <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                                <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold ${roleBadgeColors[userRole] || 'bg-gray-100 text-gray-600'}`}>
                                    {userRole}
                                </span>
                            </div>
                        </div>

                        {/* Bottom Collapse Button */}
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-2"
                            title="Collapse Sidebar (Ctrl+B)"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                            <span>Collapse Sidebar</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Topbar */}
                <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-30 shadow-sm transition-all duration-300">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                            >
                                <span className="sr-only">Open main menu</span>
                                {showingNavigationDropdown ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                            <Link href="/" className="ml-3 md:hidden flex items-center">
                                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center overflow-hidden">
                                    <ApplicationLogo className="h-full w-full object-cover" />
                                </div>
                                <span className="ml-2 font-bold text-gray-800 text-sm">SIPU Management</span>
                            </Link>
                        </div>

                        {/* Desktop: Toggle Sidebar Button & Collapsed Indicator */}
                        {!hideSidebar && (
                            <div className="hidden md:flex items-center gap-2 mr-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={toggleSidebar}
                                    title={isSidebarOpen ? "Collapse Sidebar (Ctrl+B)" : "Expand Sidebar (Ctrl+B)"}
                                    className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex items-center gap-1.5 group"
                                >
                                    <svg className="w-5 h-5 transition-transform group-hover:scale-105" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {isSidebarOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>

                                {/* When sidebar is collapsed: show mini brand and active module indicator */}
                                {!isSidebarOpen && (
                                    <div className="flex items-center gap-2.5">
                                        <Link
                                            href={route('dashboard')}
                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors group"
                                            title="Back to Main Menu (Desk Launcher)"
                                        >
                                            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center p-1 shadow-sm">
                                                <ApplicationLogo className="h-full w-full object-contain filter brightness-0 invert" />
                                            </div>
                                            <span className="font-bold text-gray-800 text-xs tracking-tight hidden lg:inline">SIPU</span>
                                        </Link>
                                        <span className="text-gray-300">|</span>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/80 text-xs font-semibold text-gray-700 border border-gray-200/60">
                                            <span className={`w-2 h-2 rounded-full ${activeModuleInfo.dotColor}`}></span>
                                            <span>{activeModuleInfo.title}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Logo on desktop when sidebar is hidden (Frappe Desk mode) */}
                        {hideSidebar && (
                            <div className="hidden md:flex items-center gap-3 shrink-0 mr-6">
                                <Link href={route('dashboard')} className="flex items-center gap-2.5 group">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-sm overflow-hidden p-1.5 group-hover:scale-105 transition-transform">
                                        <ApplicationLogo className="h-full w-full object-contain filter brightness-0 invert" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-900 text-sm tracking-tight leading-none group-hover:text-indigo-600 transition-colors">SIPU Management</span>
                                        <span className="block text-[10px] text-gray-400 leading-none mt-0.5">Swiss-Belinn SKA</span>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Page heading inline / Search slot */}
                        <div className="hidden md:block flex-1 min-w-0 w-full mr-6 [&>div]:w-full [&>h2]:w-full">
                            {header}
                        </div>

                        {/* Topbar right */}
                        <div className="ml-auto flex items-center gap-3">
                            {/* Notifications Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="relative flex items-center justify-center p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                                        <svg className="w-5 h-5 transition-transform duration-300 hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                        {(usePage().props.auth as any).notifications?.length > 0 && (
                                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                        )}
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content contentClasses="w-80 bg-white py-0">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {(usePage().props.auth as any).notifications?.length > 0 ? (
                                            (usePage().props.auth as any).notifications.map((notif: any) => {
                                                const handleDeleteNotification = (e: React.MouseEvent) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    router.delete(route('notifications.destroy', notif.id), {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                    });
                                                };
                                                const isMention = notif.data?.type === 'comment_mention';

                                                const content = (
                                                    <div className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group flex justify-between items-start gap-2.5 ${isMention ? 'bg-indigo-50/20' : ''}`}>
                                                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                                            {isMention ? (
                                                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                                                                    @
                                                                </div>
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-gray-800 leading-snug font-medium line-clamp-2">{notif.data.message}</p>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    {isMention && (
                                                                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-semibold px-1 rounded">
                                                                            Tagged
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] text-gray-400">{new Date(notif.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={handleDeleteNotification}
                                                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                                            title="Delete Notification"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                    </div>
                                                );
                                                
                                                return notif.data.action_url ? (
                                                    <Link key={notif.id} href={notif.data.action_url} className="block">
                                                        {content}
                                                    </Link>
                                                ) : (
                                                    <div key={notif.id}>{content}</div>
                                                );
                                            })
                                        ) : (
                                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                </Dropdown.Content>
                            </Dropdown>

                            {/* User Profile Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 focus:outline-none transition-all duration-300 rounded-xl px-2 py-1.5 hover:bg-gray-100/50 hover:shadow-sm">
                                        <div className="h-9 w-9 rounded-full overflow-hidden shadow-md ring-2 ring-white shrink-0">
                                            <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
                                        </div>
                                        <span className="hidden sm:inline-block text-gray-700 font-medium">{user.name}</span>
                                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Mobile header (below topbar) */}
                    <div className="md:hidden border-t border-gray-100 px-4 py-2">
                        {header}
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} md:hidden border-t border-gray-200 bg-white`}>
                        <div className="space-y-1 pt-2 pb-3 px-2 max-h-[70vh] overflow-y-auto">
                            {/* Return to Desk Launcher on mobile */}
                            <div className="mb-2">
                                <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard') && !currentUrl.includes('view=')}>
                                    <span className="flex items-center gap-2 font-bold text-indigo-600">
                                        {icons['Main Menu'] || icons['Menu Utama']}
                                        Main Menu (Desk Launcher)
                                    </span>
                                </ResponsiveNavLink>
                            </div>

                            {/* Active module indicator */}
                            <div className="px-3 py-1.5 mb-2 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${activeModuleInfo.dotColor}`}></span>
                                <span>Module: {activeModuleInfo.title}</span>
                            </div>

                            {activeModuleInfo.sections.map((section, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{section.title}</div>
                                    {section.items.map((item: any, itemIdx: number) => {
                                        const active = isItemActive(item);
                                        return (
                                            <ResponsiveNavLink key={itemIdx} href={getItemHref(item)} active={active}>
                                                <span className="flex items-center gap-2">
                                                    {icons[item.name] || <span className="w-5 h-5 rounded bg-gray-200 inline-block" />}
                                                    {item.name}
                                                </span>
                                            </ResponsiveNavLink>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 shrink-0">
                                    <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                                <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className={`flex-1 overflow-y-auto transition-all duration-300 ${hideSidebar ? 'p-4 sm:p-6 lg:p-10' : 'p-4 sm:p-6 lg:p-8'}`}>
                    <div className={hideSidebar ? 'max-w-6xl mx-auto' : isSidebarOpen ? 'max-w-7xl mx-auto' : 'w-full max-w-[1650px] mx-auto'}>
                        {children}
                    </div>
                </main>
            </div>

            {/* Global Loading Top Bar & Floating Notification */}
            {isNavigating && (
                <>
                    <div className="fixed top-0 left-0 right-0 h-1 z-[99999] overflow-hidden bg-indigo-100/60 pointer-events-none">
                        <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full animate-indeterminate" />
                    </div>

                    <div className="fixed bottom-6 right-6 z-[99999] flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900/90 text-white backdrop-blur-md shadow-2xl border border-white/10 pointer-events-none transition-all duration-200">
                        <svg className="animate-spin h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="text-xs font-medium tracking-wide">
                            {navigatingMethod === 'delete' && 'Deleting data...'}
                            {(navigatingMethod === 'put' || navigatingMethod === 'patch') && 'Saving changes...'}
                            {navigatingMethod === 'post' && 'Processing data...'}
                            {navigatingMethod === 'get' && 'Loading page...'}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
