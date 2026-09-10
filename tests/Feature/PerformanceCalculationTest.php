<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\PerformancePeriod;
use App\Models\Project;
use App\Models\SupervisorAssessment;
use App\Models\Task;
use App\Services\PerformanceCalculationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PerformanceCalculationTest extends TestCase
{
    use RefreshDatabase;

    public function test_performance_calculation_service_computes_correct_epi()
    {
        $employee = Employee::create([
            'employee_number' => 'EMP-TEST-001',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@test.com',
            'phone_number' => '1234567890',
            'join_date' => '2026-01-01',
            'employment_status' => 'Active',
            'account_status' => 'Active',
        ]);

        $supervisor = Employee::create([
            'employee_number' => 'EMP-TEST-002',
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@test.com',
            'phone_number' => '0987654321',
            'join_date' => '2026-01-01',
            'employment_status' => 'Active',
            'account_status' => 'Active',
        ]);

        $period = PerformancePeriod::create([
            'name' => 'September 2026',
            'start_date' => Carbon::now()->startOfMonth(),
            'end_date' => Carbon::now()->endOfMonth(),
            'type' => 'Monthly',
        ]);

        $project = Project::create([
            'name' => 'Test Project',
            'description' => 'Test',
            'status' => 'Active',
        ]);

        // Create 4 tasks assigned to this employee

        // Task 1: Done, On time, Low Priority (Weight: 1)
        $task1 = Task::create([
            'title' => 'Task 1',
            'project_id' => $project->id,
            'created_by' => $supervisor->id,
            'priority' => 'Low',
            'status' => 'Done',
            'deadline' => Carbon::now()->endOfMonth(),
            'updated_at' => Carbon::now()->subDays(5),
        ]);
        $task1->assignees()->attach($employee->id);

        // Task 2: Done, Late, Normal Priority (Weight: 2)
        $task2 = Task::create([
            'title' => 'Task 2',
            'project_id' => $project->id,
            'created_by' => $supervisor->id,
            'priority' => 'Normal',
            'status' => 'Done',
            'deadline' => Carbon::now()->subDays(10), // Passed deadline
            'updated_at' => Carbon::now()->subDays(2), // Finished after deadline
        ]);
        $task2->assignees()->attach($employee->id);

        // Task 3: In Progress, Urgent Priority (Weight: 4)
        $task3 = Task::create([
            'title' => 'Task 3',
            'project_id' => $project->id,
            'created_by' => $supervisor->id,
            'priority' => 'Urgent',
            'status' => 'In Progress',
            'deadline' => Carbon::now()->endOfMonth(),
        ]);
        $task3->assignees()->attach($employee->id);

        // Task 4: In Progress, Overdue, High Priority (Weight: 3)
        $task4 = Task::create([
            'title' => 'Task 4',
            'project_id' => $project->id,
            'created_by' => $supervisor->id,
            'priority' => 'High',
            'status' => 'In Progress',
            'deadline' => Carbon::now()->subDays(5),
        ]);
        $task4->assignees()->attach($employee->id);

        // Supervisor Assessment: Max is 20. Let's give: 4 + 4 + 5 + 3 = 16. Score = 16/20 = 80%
        SupervisorAssessment::create([
            'employee_id' => $employee->id,
            'supervisor_id' => $supervisor->id,
            'performance_period_id' => $period->id,
            'work_quality' => 4,
            'accuracy' => 4,
            'responsibility' => 5,
            'communication' => 3,
        ]);

        $service = new PerformanceCalculationService;
        $score = $service->calculateForEmployee($employee, $period);

        // Expected Calculations:
        // Total Assigned: 4
        // Completed: 2 (Task 1, Task 2)
        // Completion Rate: 2/4 = 50%

        // On Time: 1 (Task 1)
        // On Time Rate: 1/2 = 50%

        // Weights: 1 + 2 + 4 + 3 = 10
        // Avg Weight: 10 / 4 = 2.5
        // Task Weight Score: (2.5 / 4) * 100 = 62.5%

        // Supervisor Score: (16 / 20) * 100 = 80%

        // Final EPI:
        // (50 * 0.30) + (50 * 0.25) + (62.5 * 0.15) + (80 * 0.30)
        // = 15 + 12.5 + 9.375 + 24
        // = 60.875
        // Category should be 'Needs Improvement' (60 - 69)

        $this->assertEquals(4, $score->assigned_tasks);
        $this->assertEquals(2, $score->completed_tasks);
        $this->assertEquals(1, $score->completed_on_time_tasks);
        $this->assertEquals(1, $score->overdue_tasks); // Task 4

        $this->assertEquals(50.00, $score->completion_rate);
        $this->assertEquals(50.00, $score->on_time_rate);
        $this->assertEquals(62.50, $score->task_weight_score);
        $this->assertEquals(80.00, $score->supervisor_score);

        $this->assertEquals(60.88, round($score->final_epi, 2));
        $this->assertEquals('Needs Improvement', $score->category);
    }
}
