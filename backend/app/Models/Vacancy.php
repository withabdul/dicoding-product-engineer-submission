<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'title', 'position', 'job_type', 'candidates_needed', 'active_until', 'location',
    'is_remote', 'description', 'salary_min', 'salary_max', 'show_salary', 'min_experience',
])]
class Vacancy extends Model
{
    /** @use HasFactory<\Database\Factories\VacancyFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'active_until' => 'date',
            'is_remote' => 'boolean',
            'show_salary' => 'boolean',
            'candidates_needed' => 'integer',
            'salary_min' => 'integer',
            'salary_max' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Vacancies still accepting candidates (today counts as active). */
    public function scopeActive(Builder $query): void
    {
        $query->whereDate('active_until', '>=', today());
    }

    public function scopeSearch(Builder $query, ?string $term): void
    {
        $term = trim((string) $term);
        if ($term === '') {
            return;
        }
        // Escape LIKE wildcards so "100%" or "_" search literally. "!" is the escape
        // char because, unlike "\", it means the same thing on MySQL and SQLite.
        $escaped = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $term);
        $query->whereRaw("title LIKE ? ESCAPE '!'", ["%{$escaped}%"]);
    }

    public function isExpired(): bool
    {
        return $this->active_until->lt(today());
    }
}
