<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\PayrollPeriod;
use Illuminate\Support\Facades\DB;

class PayrollCalculationService
{
    // Define some static rates for the sake of the project scope.
    // In a real system, these would be in a settings table or employee contract.
    const BASE_SALARY_DEFAULT = 4000000;

    const POSITION_ALLOWANCE_SUPERVISOR = 1500000;

    const MEAL_ALLOWANCE_PER_DAY = 50000;

    const LATE_PENALTY_PER_MINUTE = 1000; // e.g., 1000 IDR per minute late

    public function generateForPeriod(PayrollPeriod $period)
    {
        $employees = Employee::where('employment_status', 'Active')->get();

        DB::beginTransaction();
        try {
            foreach ($employees as $employee) {
                $this->calculateForEmployee($employee, $period);
            }
            $period->update(['status' => 'Processing']);
            DB::commit();

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function calculateForEmployee(Employee $employee, PayrollPeriod $period)
    {
        // Get attendance data for the period
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('date', [$period->start_date, $period->end_date])
            ->get();

        $daysPresent = $attendances->whereIn('status', ['Present', 'Late'])->count();
        $totalLateMinutes = $attendances->sum('late_duration_minutes');

        // Determine Base Salary (Assuming it's not saved in the Employee model yet, we default)
        // If the Employee model had a `base_salary` column, we'd use `$employee->base_salary`.
        $baseSalary = self::BASE_SALARY_DEFAULT;

        // Position Allowance
        $role = $employee->user?->getRoleNames()->first();
        $positionAllowance = ($role === 'Supervisor' || $role === 'Head of Department' || $role === 'General Manager')
            ? self::POSITION_ALLOWANCE_SUPERVISOR : 0;

        // Meal Allowance
        $mealAllowance = $daysPresent * self::MEAL_ALLOWANCE_PER_DAY;

        // Late Deduction
        $lateDeduction = $totalLateMinutes * self::LATE_PENALTY_PER_MINUTE;

        $totalAllowance = $positionAllowance + $mealAllowance;
        $totalDeduction = $lateDeduction;
        $netSalary = $baseSalary + $totalAllowance - $totalDeduction;

        // Ensure net salary isn't negative
        if ($netSalary < 0) {
            $netSalary = 0;
        }

        $payroll = Payroll::updateOrCreate(
            ['employee_id' => $employee->id, 'payroll_period_id' => $period->id],
            [
                'base_salary' => $baseSalary,
                'total_allowance' => $totalAllowance,
                'total_deduction' => $totalDeduction,
                'net_salary' => $netSalary,
                'status' => 'Draft',
            ]
        );

        // Delete old items if re-calculating
        $payroll->items()->delete();

        // Create Payroll Items
        if ($positionAllowance > 0) {
            PayrollItem::create([
                'payroll_id' => $payroll->id,
                'type' => 'Earnings',
                'name' => 'Position Allowance',
                'amount' => $positionAllowance,
            ]);
        }

        if ($mealAllowance > 0) {
            PayrollItem::create([
                'payroll_id' => $payroll->id,
                'type' => 'Earnings',
                'name' => "Meal Allowance ({$daysPresent} days)",
                'amount' => $mealAllowance,
            ]);
        }

        if ($lateDeduction > 0) {
            PayrollItem::create([
                'payroll_id' => $payroll->id,
                'type' => 'Deduction',
                'name' => "Late Penalty ({$totalLateMinutes} mins)",
                'amount' => $lateDeduction,
            ]);
        }

        return $payroll;
    }
}
