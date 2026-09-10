<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Employee::with(['user', 'department', 'position', 'supervisor.user']);

        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('employee_number', 'like', "%{$search}%");
        }

        if ($department = $request->input('department')) {
            $query->where('department_id', $department);
        }

        if ($status = $request->input('status')) {
            $query->where('employment_status', $status);
        }

        $employees = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Organization/Employees/Index', [
            'employees' => $employees,
            'departments' => Department::all(),
            'positions' => Position::all(),
            'roles' => Role::pluck('name'),
            'filters' => $request->only(['search', 'department', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Organization/Employees/Form', [
            'departments' => Department::all(),
            'positions' => Position::all(),
            'roles' => Role::pluck('name'),
            'supervisors' => Employee::with('user')->get()->map(fn ($e) => [
                'id' => $e->id,
                'name' => $e->user?->name ?? 'Unknown',
            ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'employee_number' => 'required|string|unique:employees,employee_number',
            'phone_number' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'supervisor_id' => 'nullable|exists:employees,id',
            'join_date' => 'nullable|date',
            'employment_status' => 'required|string',
            'role' => 'required|string|exists:roles,name',
        ]);

        // Create user account
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);
        $user->assignRole($validated['role']);

        // Create employee record
        $employee = Employee::create([
            'user_id' => $user->id,
            'employee_number' => $validated['employee_number'],
            'phone_number' => $validated['phone_number'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'position_id' => $validated['position_id'] ?? null,
            'supervisor_id' => $validated['supervisor_id'] ?? null,
            'join_date' => $validated['join_date'] ?? now(),
            'employment_status' => $validated['employment_status'],
        ]);

        AuditLog::log([
            'action' => 'created',
            'model_type' => 'Employee',
            'model_id' => $employee->id,
            'description' => 'Created employee: '.$validated['name'].' ('.$validated['employee_number'].')',
        ]);

        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        $employee->load(['user', 'department', 'position', 'supervisor.user']);

        return Inertia::render('Organization/Employees/Form', [
            'employee' => $employee,
            'currentRole' => $employee->user?->getRoleNames()->first(),
            'departments' => Department::all(),
            'positions' => Position::all(),
            'roles' => Role::pluck('name'),
            'supervisors' => Employee::with('user')
                ->where('id', '!=', $employee->id)
                ->get()
                ->map(fn ($e) => [
                    'id' => $e->id,
                    'name' => $e->user?->name ?? 'Unknown',
                ]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$employee->user_id,
            'employee_number' => 'required|string|unique:employees,employee_number,'.$employee->id,
            'phone_number' => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'supervisor_id' => 'nullable|exists:employees,id',
            'join_date' => 'nullable|date',
            'employment_status' => 'required|string',
            'role' => 'required|string|exists:roles,name',
            'password' => 'nullable|string|min:8',
        ]);

        // Update user account
        $user = $employee->user;
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (! empty($validated['password'])) {
            $user->update(['password' => bcrypt($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        // Update employee record
        $employee->update([
            'employee_number' => $validated['employee_number'],
            'phone_number' => $validated['phone_number'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'position_id' => $validated['position_id'] ?? null,
            'supervisor_id' => $validated['supervisor_id'] ?? null,
            'join_date' => $validated['join_date'] ?? null,
            'employment_status' => $validated['employment_status'],
        ]);

        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $user = $employee->user;
        $employee->delete();
        $user?->delete();

        return redirect()->route('employees.index')->with('success', 'Employee deleted successfully.');
    }
}
