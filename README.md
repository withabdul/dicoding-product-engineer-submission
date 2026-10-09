# Dicoding Jobs: my technical test submission

Hi! This is my submission for the Product Engineer Intern technical test: a small job vacancy system where Recruiters post vacancies and Job Seekers search for them.

I tried to follow the brief and the Figma design as closely as I could. I'm sure there are rough edges, so I wrote down the ones I know about at the bottom. Feedback is very welcome.

- **Backend:** Laravel 13 (PHP 8.3), Sanctum for login tokens, MySQL
- **Frontend:** Next.js 16 (App Router), Tailwind CSS, TanStack Query, Tiptap
- **Tests:** PHPUnit (unit + integration) and Playwright (end-to-end)

```
backend/    Laravel REST API
frontend/   Next.js app
design/     A Figma reference screenshot
GLOSSARY.md The words I used for the domain (Vacancy, Recruiter, ...)
```

The UI text is in Indonesian because that is what the Figma design uses. This README is in English.

## What it does

- **Anyone (Job Seeker):** see the list of vacancies (12 per page, newest first), search by title, open a vacancy to read the details. No account needed.
- **Recruiter (needs an account):** register, log in, then create, edit and delete their own vacancies from the dashboard. Create, list and detail are the required parts of the brief. Edit and delete are the optional ones, and I did both.
- Vacancies past their "Aktif hingga" date disappear from the list and search. Their detail page still opens if you have the link.
- The salary is only sent to the public when the Recruiter turns on "Tampilkan gaji". The owner always sees it.
- A Recruiter can only edit or delete their own vacancies (anyone else gets a 403).
- The description is rich text. The backend cleans the HTML, and the frontend cleans it again before showing it.

## What you need

New to this stack, or something is not working? There is a longer step-by-step guide with a troubleshooting list in [docs/SETUP.md](docs/SETUP.md). The short version is below.

PHP 8.3+ with Composer, MySQL 8, and Node 20+.

On Windows, [Laragon](https://laragon.org) gives you PHP, Composer and MySQL in one install. After installing it, make sure `php` and `composer` work in a new terminal. If not, add the Laragon PHP and Composer folders to your PATH.

## Run the backend

```bash
cd backend
composer install
cp .env.example .env            # on PowerShell: copy .env.example .env
php artisan key:generate
mysql -uroot -e "CREATE DATABASE dicoding_jobs"
php artisan migrate --seed
php artisan serve               # http://localhost:8000
```

The database settings in `.env` assume MySQL on `127.0.0.1` with user `root` and no password (Laragon's default). Change them if yours are different.

The seeder creates a demo Recruiter you can log in with (`recruiter@example.com` / `password`) and four vacancies.

## Run the frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # on PowerShell: copy .env.example .env.local
npm run dev                     # http://localhost:3000
```

`.env.local` only has `NEXT_PUBLIC_API_URL=http://localhost:8000/api`. Change it if the backend runs on another port.

## Run the tests

**Backend (unit + integration).** These use an in-memory SQLite database, so MySQL is not needed.

```bash
cd backend
php artisan test
```

- Unit: the "active" and "search" scopes, expiry, and the validation rules.
- Integration: list, search, detail, create, update, delete, the 403 for non-owners, salary visibility, HTML cleaning, register, login and logout.

**Frontend (Playwright end-to-end).** These click through the real app, so the backend must be running with the seeded data first (`php artisan migrate:fresh --seed && php artisan serve`). Playwright starts the Next.js dev server by itself, or reuses one that is already running.

```bash
cd frontend
npx playwright install chromium   # first time only
npm run test:e2e
```

The three scenarios from the brief: open the vacancies list, search a job by title, and view a vacancy's details.

## API

| Method | Path | Login needed | What it does |
| --- | --- | --- | --- |
| GET | `/api/options` | no | Positions and locations for the form |
| GET | `/api/vacancies?search=&page=` | no | Active vacancies, paginated |
| GET | `/api/vacancies/{id}` | no | One vacancy |
| POST | `/api/register`, `/api/login` | no | Returns `{ token, user }` |
| GET | `/api/me`, `/api/my-vacancies` | yes | The logged-in Recruiter and their vacancies |
| POST | `/api/vacancies` | yes | Create a vacancy |
| PUT / DELETE | `/api/vacancies/{id}` | owner only | Update / delete |
| POST | `/api/logout` | yes | Revoke the current token |

Send the token as `Authorization: Bearer <token>`.

## Choices I made (and why)

- **Two kinds of users, but only Recruiters have accounts.** The brief has a Recruiter and a Job Seeker, but nothing for a Job Seeker to do after logging in (there is no "apply"). So Job Seekers are just visitors.
- **Company info lives on the Recruiter account** (name, sector, size) instead of a separate table. The Figma form has no company fields, and this kept things small.
- **Positions and locations are fixed lists** in `backend/config/vacancy.php`, not database tables. Simple, but changing them means editing code.
- **Search happens on the server** (`LIKE` on the title), with a 300 ms debounce on the frontend so it does not call the API on every key press.
- **The salary is hidden by the API, not just by the UI.** If I only hid it in the page, anyone could still read it from the response.

## Things I'm not sure about, or didn't do

I'd rather tell you than hide them:

- The login token is kept in `localStorage`. If the site ever had an XSS bug, the token could be stolen. Cookie-based login would be safer, but I did not set up CSRF and CORS for it.
- Registration is open and there is no email verification.
- The title search escapes `%` and `_` using `LIKE ... ESCAPE '!'`. I tested it on SQLite (the test database), but not directly on MySQL.
- The Figma file only has a 1440 px desktop design. I did not design or check a mobile layout.
- A few small visual differences from Figma remain: the editor toolbar uses plain text and emoji buttons instead of the Figma icons, the company logo is a placeholder, and the Cancel button is about 3 px off.
- The editor asks for links and images with a browser prompt, and images are URLs only (no upload).
- The E2E tests depend on the seeded data. If you change those four vacancies, they can fail.
- Edit and delete are tested on the backend, but have no browser test.
- I have not tried the setup steps on a completely fresh computer, so a step might be missing.
