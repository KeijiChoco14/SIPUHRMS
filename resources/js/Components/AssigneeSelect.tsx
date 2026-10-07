import React, { useState, useMemo } from 'react';

export default function AssigneeSelect({ 
    employees, 
    selectedIds, 
    onChange 
}: { 
    employees: any[], 
    selectedIds: number[], 
    onChange: (ids: number[]) => void 
}) {
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

    // Extract unique departments
    const departments = useMemo(() => {
        const deps = new Set<string>();
        employees.forEach(emp => {
            if (emp.department?.name) {
                deps.add(emp.department.name);
            }
        });
        return ['All', ...Array.from(deps)];
    }, [employees]);

    // Filter employees based on department and search
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchDept = selectedDepartment === 'All' || emp.department?.name === selectedDepartment;
            // Filter out already selected to make selection cleaner
            const notSelected = !selectedIds.includes(emp.id);
            return matchDept && notSelected;
        });
    }, [employees, selectedDepartment, selectedIds]);

    // Get selected employees objects
    const selectedEmployees = useMemo(() => {
        return selectedIds.map(id => employees.find(e => e.id === id)).filter(Boolean);
    }, [selectedIds, employees]);

    const handleSelect = (id: number) => {
        onChange([...selectedIds, id]);
    };

    const handleRemove = (idToRemove: number) => {
        onChange(selectedIds.filter(id => id !== idToRemove));
    };

    return (
        <div className="space-y-3">
            {/* Selected Assignees Tags */}
            <div className="min-h-[42px] p-2 bg-gray-50 rounded-md border border-gray-200">
                {selectedEmployees.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedEmployees.map((emp: any) => (
                            <div key={emp.id} className="inline-flex items-center bg-indigo-100 text-indigo-800 text-sm px-2.5 py-1 rounded-full font-medium">
                                <span>{emp.user?.name || emp.employee_number}</span>
                                <button 
                                    type="button"
                                    onClick={() => handleRemove(emp.id)}
                                    className="ml-1.5 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                                >
                                    <span className="sr-only">Remove assignee</span>
                                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 italic py-1">No assignees selected yet</div>
                )}
            </div>

            {/* Selection Controls */}
            <div className="flex flex-col sm:flex-row gap-2">
                <select
                    className="block w-full sm:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-gray-50"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                    ))}
                </select>

                <div className="flex-1">
                    <select 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm cursor-pointer"
                        onChange={(e) => {
                            if (e.target.value) handleSelect(parseInt(e.target.value));
                            e.target.value = ""; // reset after selection
                        }}
                        value=""
                    >
                        <option value="" disabled>+ Select employee to assign...</option>
                        {filteredEmployees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.user?.name || emp.employee_number} {emp.department && selectedDepartment === 'All' ? `(${emp.department.name})` : ''}
                            </option>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <option value="" disabled>No employees available (or all selected)</option>
                        )}
                    </select>
                </div>
            </div>
        </div>
    );
}
