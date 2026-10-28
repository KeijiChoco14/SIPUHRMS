<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Employee;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TaskApprovalFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_assignee_can_move_task_to_done_but_cannot_approve_it()
    {
        $creator = User::factory()->create();
        $assigneeUser = User::factory()->create();
        $assigneeEmployee = Employee::create([
            'user_id' => $assigneeUser->id,
            'employee_number' => 'EMP-001',
            'job_title' => 'Staff',
            'employment_status' => 'Permanent',
            'join_date' => now()->subYear(),
        ]);

        $project = Project::create([
            'name' => 'Approval Flow Test Project',
            'status' => ProjectStatus::Active->value,
            'created_by' => $creator->id,
        ]);

        $task = Task::create([
            'title' => 'Feature Implementation',
            'project_id' => $project->id,
            'created_by' => $creator->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::InProgress->value,
            'deadline' => now()->addDays(2)->toDateString(),
        ]);

        $task->assignees()->attach($assigneeEmployee->id);

        // Assignee moves task to Done (awaiting approval)
        $response = $this->actingAs($assigneeUser)->put(route('tasks.update', $task->id), [
            'status' => TaskStatus::Done->value,
        ]);
        $response->assertSessionHasNoErrors();
        $this->assertEquals(TaskStatus::Done, $task->fresh()->status);

        // Assignee attempts to Approve task -> Forbidden (403)
        $response = $this->actingAs($assigneeUser)->put(route('tasks.update', $task->id), [
            'status' => TaskStatus::Approved->value,
        ]);
        $response->assertStatus(403);
        $this->assertEquals(TaskStatus::Done, $task->fresh()->status);
    }

    public function test_task_creator_can_approve_task()
    {
        $creator = User::factory()->create();
        $assigneeUser = User::factory()->create();
        $assigneeEmployee = Employee::create([
            'user_id' => $assigneeUser->id,
            'employee_number' => 'EMP-002',
            'job_title' => 'Staff',
            'employment_status' => 'Permanent',
            'join_date' => now()->subYear(),
        ]);

        $task = Task::create([
            'title' => 'Design Review',
            'created_by' => $creator->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::Done->value,
            'deadline' => now()->addDays(1)->toDateString(),
        ]);
        $task->assignees()->attach($assigneeEmployee->id);

        // Creator approves the task
        $response = $this->actingAs($creator)->put(route('tasks.update', $task->id), [
            'status' => TaskStatus::Approved->value,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals(TaskStatus::Approved, $task->fresh()->status);
    }

    public function test_task_creator_can_return_task_to_in_progress_and_edit_deadline()
    {
        $creator = User::factory()->create();
        $creatorEmployee = Employee::create([
            'user_id' => $creator->id,
            'employee_number' => 'EMP-003',
            'job_title' => 'Lead',
            'employment_status' => 'Permanent',
            'join_date' => now()->subYear(),
        ]);

        $task = Task::create([
            'title' => 'Backend API',
            'created_by' => $creator->id,
            'priority' => TaskPriority::High->value,
            'status' => TaskStatus::Done->value,
            'deadline' => now()->addDays(1)->toDateString(),
        ]);

        $newDeadline = now()->addDays(5)->toDateString();
        $revisionNote = 'Mohon perbaiki validasi input dan error handling';

        // Task creator returns task to In Progress with new deadline and revision notes
        $response = $this->actingAs($creator)->put(route('tasks.update', $task->id), [
            'status' => TaskStatus::InProgress->value,
            'deadline' => $newDeadline,
            'revision_note' => $revisionNote,
        ]);

        $response->assertSessionHasNoErrors();
        $task->refresh();

        $this->assertEquals(TaskStatus::InProgress, $task->status);
        $this->assertEquals($newDeadline, $task->deadline->toDateString());

        // Comment should be recorded
        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'employee_id' => $creatorEmployee->id,
        ]);
    }

    public function test_assignee_cannot_revert_approved_task()
    {
        $creator = User::factory()->create();
        $assigneeUser = User::factory()->create();
        $assigneeEmployee = Employee::create([
            'user_id' => $assigneeUser->id,
            'employee_number' => 'EMP-004',
            'job_title' => 'Staff',
            'employment_status' => 'Permanent',
            'join_date' => now()->subYear(),
        ]);

        $task = Task::create([
            'title' => 'Completed Task',
            'created_by' => $creator->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::Approved->value,
            'deadline' => now()->addDays(1)->toDateString(),
        ]);
        $task->assignees()->attach($assigneeEmployee->id);

        // Assignee attempts to revert Approved task -> 403 Forbidden
        $response = $this->actingAs($assigneeUser)->put(route('tasks.update', $task->id), [
            'status' => TaskStatus::InProgress->value,
        ]);

        $response->assertStatus(403);
        $this->assertEquals(TaskStatus::Approved, $task->fresh()->status);
    }
}
