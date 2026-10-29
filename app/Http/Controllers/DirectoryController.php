<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DirectoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with([
            'user:id,name,email,username,profile_photo_path',
            'department:id,name',
        ])->where('employment_status', 'Active');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                })->orWhere('employee_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $employees = $query->join('users', 'employees.user_id', '=', 'users.id')
            ->orderBy('users.name')
            ->select('employees.*')
            ->get();
        $departments = Department::getCachedList();

        return Inertia::render('Directory/Index', [
            'employees' => $employees,
            'departments' => $departments,
            'filters' => $request->only(['search', 'department_id']),
        ]);
    }
}
