<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Demo data; the Playwright E2E suite depends on these titles. */
    public function run(): void
    {
        // Safe to run twice: the setup scripts call this on every run.
        if (User::where('email', 'recruiter@example.com')->exists()) {
            return;
        }

        $recruiter = User::factory()->create([
            'name' => 'Dicoding Recruiter',
            'email' => 'recruiter@example.com',
            'company_name' => 'Dicoding Indonesia',
            'company_sector' => 'Technology',
            'company_size' => '50-100',
        ]);

        $rows = [
            ['Product Engineer', 'Product Engineer', '1_3'],
            ['Android Developer', 'Android Developer', '4_5'],
            ['iOS Developer', 'iOS Developer', '1_3'],
            ['Code Reviewer', 'Code Reviewer', 'lt_1'],
        ];

        foreach ($rows as [$title, $position, $experience]) {
            Vacancy::factory()->for($recruiter)->create([
                'title' => $title,
                'position' => $position,
                'job_type' => 'full_time',
                'location' => 'Bandung',
                'min_experience' => $experience,
                'active_until' => now()->addMonths(2)->toDateString(),
            ]);
        }
    }
}
