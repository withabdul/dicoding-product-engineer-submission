<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Vacancy> */
class VacancyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->jobTitle(),
            'position' => fake()->randomElement(config('vacancy.positions')),
            'job_type' => fake()->randomElement(config('vacancy.job_types')),
            'candidates_needed' => fake()->numberBetween(1, 5),
            'active_until' => now()->addDays(14)->toDateString(),
            'location' => fake()->randomElement(config('vacancy.locations')),
            'is_remote' => false,
            'description' => '<h2>Deskripsi Pekerjaan</h2><p>'.fake()->paragraph().'</p>',
            'salary_min' => 8_000_000,
            'salary_max' => 12_000_000,
            'show_salary' => true,
            'min_experience' => fake()->randomElement(config('vacancy.experiences')),
        ];
    }

    public function expired(): static
    {
        return $this->state(['active_until' => now()->subDay()->toDateString()]);
    }
}
