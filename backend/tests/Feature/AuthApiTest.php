<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    private function registration(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Rina',
            'email' => 'rina@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'company_name' => 'Acme',
            'company_sector' => 'Technology',
            'company_size' => '10-50',
        ], $overrides);
    }

    public function test_register_returns_token_and_user(): void
    {
        $this->postJson('/api/register', $this->registration())
            ->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'email', 'company' => ['name']]])
            ->assertJsonPath('user.company.name', 'Acme');

        $this->assertDatabaseHas('users', ['email' => 'rina@example.com']);
    }

    public function test_register_validates_duplicate_email_and_password_confirmation(): void
    {
        User::factory()->create(['email' => 'rina@example.com']);

        $this->postJson('/api/register', $this->registration(['password_confirmation' => 'nope']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_with_valid_and_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'rina@example.com']);

        $this->postJson('/api/login', ['email' => 'rina@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['token']);

        $this->postJson('/api/login', ['email' => 'rina@example.com', 'password' => 'wrong'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_me_requires_a_token_and_logout_revokes_it(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();

        $token = User::factory()->create()->createToken('t')->plainTextToken;
        $this->withToken($token)->getJson('/api/me')->assertOk();

        $this->withToken($token)->postJson('/api/logout')->assertNoContent();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
