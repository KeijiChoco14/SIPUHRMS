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

    public function test_user_can_tag_user_in_comment_and_trigger_notification()
    {
        \Illuminate\Support\Facades\Notification::fake();

        $author = User::create([
            'name' => 'Author User',
            'email' => 'author@example.com',
            'password' => bcrypt('password'),
        ]);

        $authorEmployee = Employee::create([
            'user_id' => $author->id,
            'employee_number' => 'EMP-TEST-02',
            'status' => 'active',
        ]);

        $taggedUser = User::create([
            'name' => 'Tagged Person',
            'email' => 'tagged@example.com',
            'password' => bcrypt('password'),
        ]);

        $taggedEmployee = Employee::create([
            'user_id' => $taggedUser->id,
            'employee_number' => 'EMP-TEST-03',
            'status' => 'active',
        ]);

        $task = Task::create([
            'title' => 'Important Task',
            'priority' => TaskPriority::High->value,
            'status' => TaskStatus::ToDo->value,
        ]);

        $response = $this->actingAs($author)->post("/tasks/{$task->id}/comments", [
            'content' => 'Halo @Tagged Person tolong cek ini ya',
            'tagged_user_ids' => [$taggedUser->id],
        ]);

        $response->assertStatus(302);
        
        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'employee_id' => $authorEmployee->id,
            'content' => 'Halo @Tagged Person tolong cek ini ya',
        ]);

        \Illuminate\Support\Facades\Notification::assertSentTo(
            $taggedUser,
            \App\Notifications\CommentMentioned::class,
            function ($notification) use ($task) {
                return $notification->task->id === $task->id;
            }
        );
    }

    public function test_user_can_tag_by_typing_at_name_without_explicit_ids()
    {
        \Illuminate\Support\Facades\Notification::fake();

        $author = User::create([
            'name' => 'Author Two',
            'email' => 'author2@example.com',
            'password' => bcrypt('password'),
        ]);

        Employee::create([
            'user_id' => $author->id,
            'employee_number' => 'EMP-TEST-04',
            'status' => 'active',
        ]);

        $colleague = User::create([
            'name' => 'Colleague User',
            'email' => 'colleague@example.com',
            'password' => bcrypt('password'),
        ]);

        Employee::create([
            'user_id' => $colleague->id,
            'employee_number' => 'EMP-TEST-05',
            'status' => 'active',
        ]);

        $task = Task::create([
            'title' => 'Another Task',
            'priority' => TaskPriority::Normal->value,
            'status' => TaskStatus::ToDo->value,
        ]);

        // Post without tagged_user_ids array, only typing @Colleague User in content
        $response = $this->actingAs($author)->post("/tasks/{$task->id}/comments", [
            'content' => 'Tolong dibantu @Colleague User ya',
        ]);

        $response->assertStatus(302);

        \Illuminate\Support\Facades\Notification::assertSentTo(
            $colleague,
            \App\Notifications\CommentMentioned::class
        );
    }
}
