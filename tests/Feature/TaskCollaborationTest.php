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
use Tests\TestCase;

class TaskCollaborationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_add_comment_to_task()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $employee = Employee::create([
            'user_id' => $user->id,
            'employee_number' => 'EMP-TEST-01',
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'hire_date' => now(),
            'status' => 'active',
        ]);

        $project = Project::create([
            'name' => 'Test Project',
            'status' => ProjectStatus::Planning->value,
        ]);

        $task = Task::create([
            'title' => 'Test Task',
            'project_id' => $project->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::ToDo->value,
        ]);

        $response = $this->actingAs($user)->post("/tasks/{$task->id}/comments", [
            'content' => 'This is a test comment.',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'employee_id' => $employee->id,
            'content' => 'This is a test comment.',
        ]);
    }
}
