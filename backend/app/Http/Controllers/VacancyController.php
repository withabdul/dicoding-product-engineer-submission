<?php

namespace App\Http\Controllers;

use App\Http\Requests\VacancyRequest;
use App\Http\Resources\VacancyResource;
use App\Models\Vacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class VacancyController extends Controller
{
    private const PER_PAGE = 12;

    /** Public list: only vacancies still active, newest first, optional title search. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $vacancies = Vacancy::with('user')
            ->active()
            ->search($request->query('search'))
            ->latest('id')
            ->paginate(self::PER_PAGE);

        return VacancyResource::collection($vacancies);
    }

    /** Expired vacancies stay reachable by direct URL. */
    public function show(Vacancy $vacancy): VacancyResource
    {
        return new VacancyResource($vacancy->load('user'));
    }

    public function mine(Request $request): AnonymousResourceCollection
    {
        return VacancyResource::collection(
            $request->user()->vacancies()->with('user')->latest('id')->get()
        );
    }

    public function store(VacancyRequest $request): JsonResponse
    {
        $vacancy = $request->user()->vacancies()->create($request->validated());

        return (new VacancyResource($vacancy->load('user')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(VacancyRequest $request, Vacancy $vacancy): VacancyResource
    {
        Gate::authorize('update', $vacancy);
        $vacancy->update($request->validated());

        return new VacancyResource($vacancy->load('user'));
    }

    public function destroy(Vacancy $vacancy): Response
    {
        Gate::authorize('delete', $vacancy);
        $vacancy->delete();

        return response()->noContent();
    }
}
