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

        $response->assertRedirect('/projects');
        $this->assertDatabaseHas('projects', [
            'name' => 'New Project',
            'created_by' => $user->id,
        ]);
    }
}
