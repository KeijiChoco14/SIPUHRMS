import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import EmployeeDashboard from './Dashboard/Partials/EmployeeDashboard';
import SupervisorDashboard from './Dashboard/Partials/SupervisorDashboard';
import HRDashboard from './Dashboard/Partials/HRDashboard';
import ManagerDashboard from './Dashboard/Partials/ManagerDashboard';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
}

export default function Dashboard({ role, employeeData, supervisorData, hrData, managerData, announcements }: any) {
    const renderDashboard = () => {
        if (role === 'Staff / Employee') {
            return <EmployeeDashboard data={{ ...employeeData, announcements }} />;
        } else if (role === 'Supervisor' || role === 'Head of Department') {
            return <SupervisorDashboard data={{ ...supervisorData, announcements }} />;
        } else if (role === 'HRD / Admin') {
            return <HRDashboard data={{ ...hrData, announcements }} />;
        } else if (role === 'General Manager' || role === 'Super Admin') {
            return <ManagerDashboard data={{ ...managerData, announcements }} />;
        }
        
        return (
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    Welcome to the dashboard.
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {getGreeting()} 👋
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Here's what's happening today
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />
            {renderDashboard()}
        </AuthenticatedLayout>
    );
}
