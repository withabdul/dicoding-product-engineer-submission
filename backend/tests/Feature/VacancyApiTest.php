<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VacancyApiTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Android Developer',
            'position' => 'Android Developer',
            'job_type' => 'full_time',
            'candidates_needed' => 2,
            'active_until' => now()->addWeek()->toDateString(),
            'location' => 'Bandung',
            'is_remote' => true,
            'description' => '<h2>Tugas</h2><p>Bangun aplikasi.</p>',
            'salary_min' => 8000000,
            'salary_max' => null,
            'show_salary' => false,
            'min_experience' => '1_3',
        ], $overrides);
    }

    public function test_list_is_public_paginated_and_hides_expired(): void
    {
        Vacancy::factory()->count(13)->create();
        Vacancy::factory()->expired()->create();

        $this->getJson('/api/vacancies')
            ->assertOk()
            ->assertJsonCount(12, 'data')
            ->assertJsonPath('meta.total', 13)
            ->assertJsonPath('meta.last_page', 2);
    }

    public function test_search_filters_by_title(): void
    {
        Vacancy::factory()->create(['title' => 'Android Developer']);
        Vacancy::factory()->create(['title' => 'Product Engineer']);

        $this->getJson('/api/vacancies?search=engineer')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Product Engineer');
    }

    public function test_detail_returns_vacancy_with_company_and_works_for_expired(): void
    {
        $vacancy = Vacancy::factory()->expired()->create();

        $this->getJson("/api/vacancies/{$vacancy->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $vacancy->id)
            ->assertJsonPath('data.company.name', $vacancy->user->company_name);
    }

    public function test_detail_of_missing_vacancy_is_404(): void
    {
        $this->getJson('/api/vacancies/999')->assertNotFound();
    }

    public function test_salary_is_hidden_publicly_unless_opted_in_but_owner_sees_it(): void
    {
        $hidden = Vacancy::factory()->create(['show_salary' => false]);
        $shown = Vacancy::factory()->create(['show_salary' => true]);

        $this->getJson("/api/vacancies/{$hidden->id}")->assertJsonMissingPath('data.salary_min');
        $this->getJson("/api/vacancies/{$shown->id}")->assertJsonPath('data.salary_min', 8000000);

        $this->actingAs($hidden->user, 'sanctum')
            ->getJson("/api/vacancies/{$hidden->id}")
            ->assertJsonPath('data.salary_min', 8000000);
    }

    public function test_guest_cannot_create(): void
    {
        $this->postJson('/api/vacancies', $this->payload())->assertUnauthorized();
        $this->assertDatabaseCount('vacancies', 0);
    }

    public function test_recruiter_can_create_and_description_is_sanitized(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/vacancies', $this->payload(['description' => '<p>Halo</p><script>alert(1)</script>']))
            ->assertCreated()
            ->assertJsonPath('data.title', 'Android Developer');

        $vacancy = Vacancy::sole();
        $this->assertSame($user->id, $vacancy->user_id);
        $this->assertStringNotContainsString('script', $vacancy->description);
    }

    public function test_create_validates_input(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson('/api/vacancies', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title', 'position', 'job_type', 'candidates_needed', 'active_until',
                'location', 'description', 'salary_min', 'min_experience',
            ]);
    }

    public function test_create_rejects_past_deadline(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum')
            ->postJson('/api/vacancies', $this->payload(['active_until' => now()->subDay()->toDateString()]))
            ->assertJsonValidationErrors('active_until');
    }

    public function test_owner_can_update_and_delete(): void
    {
        $vacancy = Vacancy::factory()->create();
        $this->actingAs($vacancy->user, 'sanctum');

        $this->putJson("/api/vacancies/{$vacancy->id}", $this->payload(['title' => 'Senior Android']))
            ->assertOk()
            ->assertJsonPath('data.title', 'Senior Android');

        $this->deleteJson("/api/vacancies/{$vacancy->id}")->assertNoContent();
        $this->assertModelMissing($vacancy);
    }

    public function test_other_recruiter_cannot_update_or_delete(): void
    {
        $vacancy = Vacancy::factory()->create(['title' => 'Original']);
        $this->actingAs(User::factory()->create(), 'sanctum');

        $this->putJson("/api/vacancies/{$vacancy->id}", $this->payload())->assertForbidden();
        $this->deleteJson("/api/vacancies/{$vacancy->id}")->assertForbidden();

        $this->assertSame('Original', $vacancy->fresh()->title);
    }

    public function test_my_vacancies_lists_only_own_including_expired(): void
    {
        $me = User::factory()->create();
        Vacancy::factory()->for($me)->create();
        Vacancy::factory()->for($me)->expired()->create();
        Vacancy::factory()->create();

        $this->actingAs($me, 'sanctum')
            ->getJson('/api/my-vacancies')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_options_endpoint_lists_positions_and_locations(): void
    {
        $this->getJson('/api/options')
            ->assertOk()
            ->assertJsonFragment(['Bandung'])
            ->assertJsonStructure(['positions', 'locations']);
    }
}
