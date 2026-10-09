# Dicoding Jobs: Vacancy System

A simple job vacancy system. Recruiters create and manage vacancies. Job Seekers search by title and read details without an account.

- **Backend:** Laravel 13 (PHP 8.3), Sanctum token auth, MySQL
- **Frontend:** Next.js 16 (App Router), Tailwind CSS, TanStack Query, Tiptap
- **Tests:** PHPUnit (unit + integration), Playwright (E2E)

```
backend/    Laravel REST API
frontend/   Next.js app
GLOSSARY.md Domain terms
```

## Features

- Public: list (12 per page, newest first), search by title, vacancy detail.
- Recruiter (register / login): dashboard, create, edit, delete. Only the owner can edit or delete (others get 403).
- Vacancies past their "Aktif hingga" date are hidden from the public list and search. Their detail page still opens by direct URL.
- Salary is sent by the public API only when the Recruiter turns on "Tampilkan gaji". The owner always sees it.
- The description is rich text. The backend sanitizes the HTML (HTMLPurifier), and the frontend sanitizes again (DOMPurify) on render.

## Requirements

PHP 8.3+ with Composer, MySQL 8, Node 20+. On Windows, [Laragon](https://laragon.org) provides PHP, Composer and MySQL.

## Run the backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# create an empty MySQL database named dicoding_jobs (user root, no password, see .env)
php artisan migrate --seed
php artisan serve        # http://localhost:8000
```

The seeder creates a demo Recruiter (`recruiter@example.com` / `password`) and four vacancies.

## Run the frontend

```bash
cd frontend
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev                    # http://localhost:3000
```

## Run the tests

**Backend (unit + integration).** They use in-memory SQLite, so MySQL is not needed.

```bash
cd backend
php artisan test
```

**Frontend (Playwright E2E).** These run against the real backend and the seeded data. Start the backend first (`php artisan migrate:fresh --seed && php artisan serve`), then:

```bash
cd frontend
npx playwright install chromium   # first time only
npm run test:e2e
```

Scenarios: open the vacancies list, search a job by title, view vacancy details.

## API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/options` | no | Positions and locations for the form |
| GET | `/api/vacancies?search=&page=` | no | Active vacancies, paginated |
| GET | `/api/vacancies/{id}` | no | Vacancy detail |
| POST | `/api/register`, `/api/login` | no | Returns `{ token, user }` |
| GET | `/api/me`, `/api/my-vacancies` | yes | Current Recruiter and their vacancies |
| POST | `/api/vacancies` | yes | Create |
| PUT / DELETE | `/api/vacancies/{id}` | owner | Update / delete |
| POST | `/api/logout` | yes | Revoke the current token |

Send the token as `Authorization: Bearer <token>`.

## Known limitations

- The token is stored in `localStorage`, so an XSS bug would expose it. Sanitizing the description reduces that risk. Cookie-based SPA auth would be safer but needs CSRF/CORS/domain setup.
- Registration is open and there is no email verification.
- Positions and locations are fixed lists in `backend/config/vacancy.php`.
- The company logo is a placeholder. Company data (name, sector, size) lives on the Recruiter account.
- Editor links and images are entered with a browser prompt (image by URL, no upload).
