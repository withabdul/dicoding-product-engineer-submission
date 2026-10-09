<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Vacancy */
class VacancyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Salary is public only when the Recruiter opted in; the owner always sees it.
        $viewer = $request->user('sanctum');
        $showSalary = $this->show_salary || $viewer?->id === $this->user_id;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'position' => $this->position,
            'job_type' => $this->job_type,
            'candidates_needed' => $this->candidates_needed,
            'active_until' => $this->active_until->toDateString(),
            'location' => $this->location,
            'is_remote' => $this->is_remote,
            'description' => $this->description,
            'min_experience' => $this->min_experience,
            'show_salary' => $this->show_salary,
            $this->mergeWhen($showSalary, [
                'salary_min' => $this->salary_min,
                'salary_max' => $this->salary_max,
            ]),
            'created_at' => $this->created_at->toIso8601String(),
            'company' => [
                'name' => $this->user->company_name,
                'sector' => $this->user->company_sector,
                'size' => $this->user->company_size,
            ],
        ];
    }
}
