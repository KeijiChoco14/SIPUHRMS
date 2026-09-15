import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const icons: Record<string, JSX.Element> = {
    Dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
    Projects: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    'My Tasks': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    Kanban: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
    Employees: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Departments: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    'My Attendance': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Attendance Logs': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Shifts & Roster': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    'Leave Requests': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    'Overtime': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'My Payslips': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    'Payroll Management': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    'Employee Directory': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Announcements: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
    Documents: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    'Reports & EPI': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    'Roles & Permissions': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    'Audit Logs': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    'System Settings': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const roleBadgeColors: Record<string, string> = {
    'Super Admin': 'bg-red-100 text-red-700',
    'HRD / Admin': 'bg-purple-100 text-purple-700',
    'General Manager': 'bg-amber-100 text-amber-700',
    'Head of Department': 'bg-blue-100 text-blue-700',
    'Supervisor': 'bg-teal-100 text-teal-700',
    'Staff / Employee': 'bg-slate-100 text-slate-700',
};

export default function Authenticated({
    user: _ignoredUser,
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode, user?: any }>) {
    const user = usePage().props.auth.user as any;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const userRole = user.roles?.[0]?.name ?? 'Staff / Employee';

    const isAdmin = ['Super Admin', 'HRD / Admin'].some(r => user.roles?.some((ur: any) => ur.name === r));
    const isManager = user.roles?.some((r: any) => r.name === 'General Manager');
    const isSupervisor = user.roles?.some((r: any) => ['Supervisor', 'Head of Department'].includes(r.name));
    const canViewPerformance = isAdmin || isManager;
    const canViewProjects = isAdmin || isManager || isSupervisor;

    const menuSections = [
        {
            title: 'Workspace',
            items: [
                { name: 'Dashboard', route: 'dashboard', pattern: 'dashboard' },
                canViewProjects && { name: 'Projects', route: 'projects.index', pattern: 'projects.*' },
                { name: 'My Tasks', route: 'tasks.index', pattern: 'tasks.index' },
                { name: 'Kanban', route: 'tasks.kanban', pattern: 'tasks.kanban' },
            ].filter(Boolean)
        },
        (isAdmin || isManager) && {
            title: 'People',
            items: [
                isAdmin && { name: 'Employees', route: 'employees.index', pattern: 'employees.*' },
                isAdmin && { name: 'Departments', route: 'departments.index', pattern: 'departments.*' },
            ].filter(Boolean)
        },
        {
            title: 'Time & Pay',
            items: [
                { name: 'My Attendance', route: 'attendance.my', pattern: 'attendance.my' },
                isAdmin && { name: 'Attendance Logs', route: 'attendance.index', pattern: 'attendance.index' },
                isAdmin && { name: 'Shifts & Roster', route: 'schedules.index', pattern: 'schedules.*|shifts.*' },
                { name: 'Leave Requests', route: 'leave.index', pattern: 'leave.*' },
                { name: 'Overtime', route: 'overtime.index', pattern: 'overtime.*' },
                { name: 'My Payslips', route: 'payroll.my', pattern: 'payroll.my' },
                isAdmin && { name: 'Payroll Management', route: 'payroll.index', pattern: 'payroll.index' },
            ].filter(Boolean)
        },
        {
            title: 'Company',
            items: [
                { name: 'Employee Directory', route: 'directory.index', pattern: 'directory.index' },
                { name: 'Announcements', route: 'announcements.index', pattern: 'announcements.index' },
                { name: 'Documents', route: 'documents.index', pattern: 'documents.index' },
            ]
        },
        canViewPerformance && {
            title: 'Analytics',
            items: [
                { name: 'Reports & EPI', route: 'performance.index', pattern: 'performance.*' },
            ]
        },
        isAdmin && {
            title: 'Administration',
            items: [
                { name: 'Roles & Permissions', route: 'roles.index', pattern: 'roles.*' },
                { name: 'Audit Logs', route: 'audit-logs.index', pattern: 'audit-logs.*' },
                { name: 'System Settings', route: 'settings.index', pattern: 'settings.*' },
            ]
        }
    ].filter(Boolean) as { title: string; items: any[] }[];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex selection:bg-indigo-500 selection:text-white">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white/70 backdrop-blur-xl border-r border-gray-200/50 min-h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">
                {/* Logo Header */}
                <div className="flex h-16 shrink-0 items-center px-5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700">
                    <Link href="/" className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
                            <ApplicationLogo className="h-full w-full object-cover" />
                        </div>
                        <div className="ml-3">
                            <span className="font-bold text-white text-sm tracking-tight">Swiss-Belinn SKA Pekanbaru</span>
                            <span className="block text-[10px] text-indigo-200 leading-none">Internal Management</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                    {menuSections.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                {section.title}
                            </h3>
                            <ul className="space-y-0.5">
                                {section.items.map((item: any, itemIdx: number) => (
                                    <li key={itemIdx}>
                                        <Link
                                            href={route(item.route) as unknown as string}
                                            className={`group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-300 ease-out ${route().current(item.pattern)
                                                ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700 shadow-sm shadow-indigo-100/50 ring-1 ring-indigo-50'
                                                : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:translate-x-1'
                                                }`}
                                        >
                                            <span className={`transition-colors ${route().current(item.pattern) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                                {icons[item.name] || <span className="w-5 h-5 rounded bg-gray-200" />}
                                            </span>
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* User Profile Section */}
                <div className="border-t border-gray-100 p-3">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 shadow-sm shrink-0">
                            <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleBadgeColors[userRole] || 'bg-gray-100 text-gray-600'}`}>
                                {userRole}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
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
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                )}
                            </button>
                            <Link href="/" className="ml-3 md:hidden flex items-center">
                                <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center overflow-hidden">
                                    <ApplicationLogo className="h-full w-full object-cover" />
                                </div>
                                <span className="ml-2 font-bold text-gray-800 text-sm">Swiss-Belinn SKA Pekanbaru</span>
                            </Link>
                        </div>

                        {/* Page heading inline */}
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
                                            (usePage().props.auth as any).notifications.map((notif: any) => (
                                                <div key={notif.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <p className="text-sm text-gray-800">{notif.data.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                                </div>
                                            ))
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
                            {menuSections.map((section, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{section.title}</div>
                                    {section.items.map((item: any, itemIdx: number) => (
                                        <ResponsiveNavLink key={itemIdx} href={route(item.route) as unknown as string} active={route().current(item.pattern)}>
                                            <span className="flex items-center gap-2">
                                                {icons[item.name]}
                                                {item.name}
                                            </span>
                                        </ResponsiveNavLink>
                                    ))}
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
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
