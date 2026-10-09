<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vacancy;

class VacancyPolicy
{
    public function update(User $user, Vacancy $vacancy): bool
    {
        return $vacancy->user_id === $user->id;
    }

    public function delete(User $user, Vacancy $vacancy): bool
    {
        return $vacancy->user_id === $user->id;
    }
}
