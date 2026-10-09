<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Stevebauman\Purify\Facades\Purify;

class VacancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ownership is enforced by VacancyPolicy in the controller.
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->description)) {
            $this->merge(['description' => Purify::clean($this->description)]);
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'position' => ['required', Rule::in(config('vacancy.positions'))],
            'job_type' => ['required', Rule::in(config('vacancy.job_types'))],
            'candidates_needed' => ['required', 'integer', 'min:1', 'max:10000'],
            'active_until' => ['required', 'date', 'after_or_equal:today'],
            'location' => ['required', Rule::in(config('vacancy.locations'))],
            'is_remote' => ['boolean'],
            'description' => ['required', 'string', 'max:20000'],
            'salary_min' => ['required', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'gte:salary_min'],
            'show_salary' => ['boolean'],
            'min_experience' => ['required', Rule::in(config('vacancy.experiences'))],
        ];
    }
}
