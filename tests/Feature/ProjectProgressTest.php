<?php

namespace Tests\Feature;

use App\Enums\ProjectStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProjectProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_progress_is_calculated_from_tasks()
    {
        $role = Role::create(['name' => 'Super Admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $department = Department::create(['name' => 'IT']);

        $project = Project::create([
            'name' => 'Progress Test Project',
            'department_id' => $department->id,
            'status' => ProjectStatus::Planning->value,
            'created_by' => $user->id,
        ]);

        $this->assertEquals(0, $project->fresh()->progress);

        // Add 4 tasks
        $task1 = Task::create([
            'title' => 'Task 1',
            'project_id' => $project->id,
            'created_by' => $user->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::ToDo->value,
        ]);

        $task2 = Task::create([
            'title' => 'Task 2',
            'project_id' => $project->id,
            'created_by' => $user->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::ToDo->value,
        ]);

        $task3 = Task::create([
            'title' => 'Task 3',
            'project_id' => $project->id,
            'created_by' => $user->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::Done->value,
        ]);

        $task4 = Task::create([
            'title' => 'Task 4',
            'project_id' => $project->id,
            'created_by' => $user->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::Done->value,
        ]);

        // 2 of 4 tasks are Done -> 50%
        $this->assertEquals(50, $project->fresh()->progress);

        // Update task1 to Done -> 3 of 4 -> 75%
        $task1->update(['status' => TaskStatus::Done->value]);
        $this->assertEquals(75, $project->fresh()->progress);

        // Update task2 to Done -> 4 of 4 -> 100%
        $task2->update(['status' => TaskStatus::Done->value]);
        $this->assertEquals(100, $project->fresh()->progress);
        $this->assertEquals(ProjectStatus::Completed, $project->fresh()->status);

        // Reopen task2 -> 3 of 4 -> 75% -> status reverts to Active
        $task2->update(['status' => TaskStatus::InProgress->value]);
        $this->assertEquals(75, $project->fresh()->progress);
        $this->assertEquals(ProjectStatus::Active, $project->fresh()->status);

        // Done again
        $task2->update(['status' => TaskStatus::Done->value]);
        $this->assertEquals(100, $project->fresh()->progress);
        $this->assertEquals(ProjectStatus::Completed, $project->fresh()->status);

        // Delete task4 -> 3 of 3 -> 100%
        $task4->delete();
        $this->assertEquals(100, $project->fresh()->progress);
        $this->assertEquals(ProjectStatus::Completed, $project->fresh()->status);

        // Delete remaining tasks -> 0 tasks -> 0%
        $task1->delete();
        $task2->delete();
        $task3->delete();
        $this->assertEquals(0, $project->fresh()->progress);
    }

    public function test_projects_index_route_provides_computed_progress_and_counts()
    {
        $role = Role::create(['name' => 'Super Admin']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $project = Project::create([
            'name' => 'Index Route Project',
            'status' => ProjectStatus::Planning->value,
            'created_by' => $user->id,
        ]);

        Task::create([
            'title' => 'Done Task',
            'project_id' => $project->id,
            'created_by' => $user->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::Done->value,
        ]);

        Task::create([
            'title' => 'In Progress Task',
            'project_id' => $project->id,
            'created_by' => $user->id,
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::InProgress->value,
        ]);

        $response = $this->actingAs($user)->get(route('projects.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Projects/Index')
                ->has('projects.data', 1)
                ->where('projects.data.0.progress', 50)
                ->where('projects.data.0.total_tasks', 2)
                ->where('projects.data.0.completed_tasks', 1)
        );
    }
}
