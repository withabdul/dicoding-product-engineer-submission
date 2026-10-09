<?php

namespace Tests\Unit;

use App\Http\Requests\VacancyRequest;
use App\Models\Vacancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class VacancyTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_excludes_expired_and_includes_today(): void
    {
        $today = Vacancy::factory()->create(['active_until' => today()->toDateString()]);
        $future = Vacancy::factory()->create();
        Vacancy::factory()->expired()->create();

        $ids = Vacancy::active()->pluck('id')->all();

        $this->assertEqualsCanonicalizing([$today->id, $future->id], $ids);
    }

    public function test_search_scope_matches_title_case_insensitively(): void
    {
        Vacancy::factory()->create(['title' => 'Android Developer']);
        Vacancy::factory()->create(['title' => 'Product Engineer']);

        $this->assertSame(['Android Developer'], Vacancy::search('android')->pluck('title')->all());
    }

    public function test_search_scope_treats_like_wildcards_literally(): void
    {
        Vacancy::factory()->create(['title' => 'Backend Developer']);
        Vacancy::factory()->create(['title' => '100% Remote Engineer']);

        $this->assertSame(['100% Remote Engineer'], Vacancy::search('100%')->pluck('title')->all());
        $this->assertCount(0, Vacancy::search('_')->get());
    }

    public function test_blank_search_returns_everything(): void
    {
        Vacancy::factory()->count(2)->create();

        $this->assertCount(2, Vacancy::search('  ')->get());
    }

    public function test_is_expired(): void
    {
        $this->assertTrue(Vacancy::factory()->expired()->make()->isExpired());
        $this->assertFalse(Vacancy::factory()->make()->isExpired());
    }

    public function test_validation_rejects_bad_enums_and_salary_range(): void
    {
        $data = array_merge(Vacancy::factory()->make()->toArray(), [
            'position' => 'Astronaut',
            'job_type' => 'freelance',
            'min_experience' => '99',
            'salary_min' => 10,
            'salary_max' => 5,
        ]);

        $errors = Validator::make($data, (new VacancyRequest)->rules())->errors();

        $this->assertEqualsCanonicalizing(
            ['position', 'job_type', 'min_experience', 'salary_max'],
            $errors->keys(),
        );
    }
}
