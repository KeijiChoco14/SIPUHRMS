<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_projects_index()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get('/projects');

        $response->assertStatus(200);
    }

    public function test_user_can_create_project()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->post('/projects', [
            'name' => 'New Project',
            'description' => 'Test description',
        ]);

        $project = \App\Models\Project::first();
        $response->assertRedirect(route('projects.show', $project));
        $this->assertDatabaseHas('projects', [
            'name' => 'New Project',
            'created_by' => $user->id,
        ]);
    }

    public function test_hrd_cannot_access_or_delete_unassigned_projects_and_tasks()
    {
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'HRD / Admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Staff / Employee']);

        $hrdUser = User::factory()->create(['name' => 'HR User']);
        $hrdUser->assignRole('HRD / Admin');
        $hrdEmployee = \App\Models\Employee::create([
            'user_id' => $hrdUser->id,
            'employee_number' => 'HRD-001',
            'first_name' => 'HR',
            'last_name' => 'Manager',
            'email' => $hrdUser->email,
            'employment_status' => 'Active',
            'account_status' => 'Active',
        ]);

        $otherUser = User::factory()->create(['name' => 'IT User']);
        $otherUser->assignRole('Staff / Employee');
        $otherEmployee = \App\Models\Employee::create([
            'user_id' => $otherUser->id,
            'employee_number' => 'IT-001',
            'first_name' => 'IT',
            'last_name' => 'Staff',
            'email' => $otherUser->email,
            'employment_status' => 'Active',
            'account_status' => 'Active',
        ]);

        // Create a project belonging to IT
        $itProject = \App\Models\Project::create([
            'name' => 'IT Infrastructure Upgrade',
            'created_by' => $otherUser->id,
            'owner_id' => $otherEmployee->id,
            'status' => 'Active',
        ]);

        // Create a task in IT project assigned to IT staff
        $itTask = \App\Models\Task::create([
            'title' => 'Configure Core Switch',
            'project_id' => $itProject->id,
            'created_by' => $otherUser->id,
            'priority' => 'High',
            'status' => 'In Progress',
        ]);
        $itTask->assignees()->attach($otherEmployee->id);

        // 1. HRD visiting the project show page directly should be 403 Forbidden
        $response = $this->actingAs($hrdUser)->get(route('projects.show', $itProject));
        $response->assertStatus(403);

        // 2. HRD trying to delete IT project should be 403 Forbidden
        $deleteProjectResp = $this->actingAs($hrdUser)->delete(route('projects.destroy', $itProject));
        $deleteProjectResp->assertStatus(403);
        $this->assertDatabaseHas('projects', ['id' => $itProject->id]);

        // 3. HRD trying to delete IT task should be 403 Forbidden
        $deleteTaskResp = $this->actingAs($hrdUser)->delete(route('tasks.destroy', $itTask));
        $deleteTaskResp->assertStatus(403);
        $this->assertDatabaseHas('tasks', ['id' => $itTask->id]);

        // 4. In "My Tasks" index, HRD should NOT see IT task
        $tasksIndexResp = $this->actingAs($hrdUser)->get(route('tasks.index'));
        $tasksIndexResp->assertStatus(200);
        $tasksIndexResp->assertInertia(fn ($page) => $page
            ->component('Tasks/Index')
            ->where('tasks', fn ($tasks) => collect($tasks)->where('id', $itTask->id)->isEmpty())
        );
    }
}
