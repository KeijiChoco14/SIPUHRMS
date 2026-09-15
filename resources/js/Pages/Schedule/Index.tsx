import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

export default function ScheduleIndex({ schedules, employees, shifts, startDate, endDate }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: '',
        shift_id: '',
        date: '',
    });

    // Generate dates array for the current week
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    let end = new Date(endDate);
    
    while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const getDayName = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const getDisplayDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getScheduleForCell = (employeeId: number, dateStr: string) => {
        return schedules.find((s: any) => s.employee_id === employeeId && s.date === dateStr);
    };

    const openAssignModal = (employee: any, date: Date) => {
        const dateStr = formatDate(date);
        setSelectedEmployee(employee);
        setSelectedDate(dateStr);
        
        const existing = getScheduleForCell(employee.id, dateStr);
        
        setData({
            employee_id: employee.id,
            date: dateStr,
            shift_id: existing ? existing.shift_id : '',
        });
        
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('schedules.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const changeWeek = (offsetDays: number) => {
        const newStart = new Date(startDate);
        newStart.setDate(newStart.getDate() + offsetDays);
        router.get(route('schedules.index'), { start_date: formatDate(newStart) }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Weekly Roster</h2>}>
            <Head title="Roster" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Shift Roster</h3>
                        <p className="text-sm text-gray-500 mt-1">Assign weekly schedules to employees.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white border border-gray-300 rounded-lg p-1">
                        <button onClick={() => changeWeek(-7)} className="p-2 hover:bg-gray-100 rounded text-gray-600">
                            &larr; Prev Week
                        </button>
                        <span className="font-bold text-sm px-4">
                            {getDisplayDate(dates[0])} - {getDisplayDate(dates[dates.length - 1])}
                        </span>
                        <button onClick={() => changeWeek(7)} className="p-2 hover:bg-gray-100 rounded text-gray-600">
                            Next Week &rarr;
                        </button>
                    </div>

                    <PrimaryButton onClick={() => router.get(route('shifts.index'))} className="bg-indigo-600 hover:bg-indigo-700">
                        Manage Shifts
                    </PrimaryButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 w-48 border-r border-gray-200 sticky left-0 bg-gray-50 z-10">Employee</th>
                                {dates.map((date, i) => (
                                    <th key={i} className="px-2 py-3 text-center border-r border-gray-200">
                                        <div className="font-bold text-gray-900">{getDayName(date)}</div>
                                        <div className="text-xs">{getDisplayDate(date)}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map((employee: any) => (
                                <tr key={employee.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 border-r border-gray-200 sticky left-0 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                                        <div className="font-bold text-gray-900 truncate">{employee.user.name}</div>
                                        <div className="text-xs text-gray-500">{employee.designation}</div>
                                    </td>
                                    
                                    {dates.map((date, i) => {
                                        const dateStr = formatDate(date);
                                        const schedule = getScheduleForCell(employee.id, dateStr);
                                        
                                        return (
                                            <td key={i} className="px-1 py-1 border-r border-gray-200 relative group h-16 min-w-[100px] cursor-pointer hover:bg-indigo-50/50 transition-colors" onClick={() => openAssignModal(employee, date)}>
                                                {schedule ? (
                                                    <div className="absolute inset-1 rounded flex flex-col justify-center items-center p-1 text-center shadow-sm" style={{ backgroundColor: schedule.shift.color + '20', border: `1px solid ${schedule.shift.color}40` }}>
                                                        <div className="font-bold text-xs truncate w-full" style={{ color: schedule.shift.color }}>{schedule.shift.name}</div>
                                                        <div className="text-[10px] text-gray-600 truncate w-full">
                                                            {schedule.shift.start_time.substring(0, 5)} - {schedule.shift.end_time.substring(0, 5)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-transparent group-hover:text-indigo-300 text-xl">
                                                        +
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal} maxWidth="sm">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Assign Shift</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {selectedEmployee?.user.name} &bull; {selectedDate}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="shift_id" value="Select Shift" />
                            {shifts.length > 0 ? (
                                <select
                                    id="shift_id"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.shift_id}
                                    onChange={e => setData('shift_id', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Select a shift --</option>
                                    {shifts.map((shift: any) => (
                                        <option key={shift.id} value={shift.id}>
                                            {shift.name} ({shift.start_time.substring(0,5)} - {shift.end_time.substring(0,5)})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="mt-1 p-3 bg-amber-50 text-amber-700 rounded border border-amber-200 text-sm">
                                    No shifts available. Please <button type="button" onClick={() => router.get(route('shifts.index'))} className="font-bold underline hover:text-amber-900">create a shift type</button> first.
                                </div>
                            )}
                            <InputError message={errors.shift_id} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between">
                        <button 
                            type="button" 
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            onClick={() => {
                                const sched = getScheduleForCell(selectedEmployee.id, selectedDate);
                                if (sched) {
                                    router.delete(route('schedules.destroy', sched.id), {
                                        onSuccess: () => closeModal()
                                    });
                                } else {
                                    closeModal();
                                }
                            }}
                        >
                            {getScheduleForCell(selectedEmployee?.id, selectedDate) ? 'Remove Shift' : 'Cancel'}
                        </button>
                        
                        <PrimaryButton disabled={processing || shifts.length === 0} className="bg-indigo-600 hover:bg-indigo-700">
                            Save Assignment
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
