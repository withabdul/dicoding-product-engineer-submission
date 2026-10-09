# Setup guide

A step-by-step version of the setup in the [README](../README.md), with the places where I got stuck. If you only need the short version, the README has it.

It takes about 10 minutes if PHP, MySQL and Node are already installed.

## The quick way

Install the tools in step 1 and start MySQL. Then, from the repo root:

```bash
./setup.sh          # macOS, Linux, Git Bash
.\setup.ps1         # Windows PowerShell
```

It runs steps 3 and 4 for you: `composer install`, creates the `.env` files, creates the `dicoding_jobs` database (if the `mysql` command is available), migrates and seeds the demo data, and runs `npm install`. It keeps your existing `.env` and app key, and seeding twice does not duplicate the demo data, so you can run it again whenever.

It does **not** start the servers. Start them yourself (steps 3 and 4 end with the commands). If it stops with an error, the message says what is missing, and the troubleshooting list at the bottom of this page covers the common ones.

The rest of this page is the same thing done by hand.

## 1. Install what you need

| Tool | Version | Check with |
| --- | --- | --- |
| PHP | 8.3 or newer | `php -v` |
| Composer | 2.x | `composer -V` |
| MySQL | 8 | `mysql --version` |
| Node.js | 20 or newer | `node -v` |
| Git | any | `git --version` |

**Windows (what I used):** install [Laragon](https://laragon.org). It comes with PHP, Composer and MySQL. Start Laragon and click **Start All** so MySQL is running. Then open a **new** terminal and run the checks above.

If `php` or `composer` is "not recognized", add these two folders to your PATH (the PHP folder name depends on your Laragon version), then open a new terminal again:

```
C:\laragon\bin\php\php-8.3.xx-Win32-vs16-x64
C:\laragon\bin\composer
```

The `mysql` command is not needed to *run* the app. It is only a quick way to create the database. If you don't have it in your PATH, create the database from Laragon's database tool (HeidiSQL) instead.

**macOS / Linux:** install PHP 8.3, Composer, MySQL 8 and Node with your package manager (Homebrew, apt, ...). Then start MySQL.

## 2. Get the code

```bash
git clone https://github.com/withabdul/dicoding-product-engineer-submission.git
cd dicoding-product-engineer-submission
```

## 3. Backend (Laravel)

```bash
cd backend
composer install
```

Create your `.env` file:

```bash
cp .env.example .env              # PowerShell: copy .env.example .env
php artisan key:generate
```

Create an empty database called `dicoding_jobs`, with either of these:

```bash
mysql -uroot -e "CREATE DATABASE dicoding_jobs"
```

or create it by hand in HeidiSQL (Laragon) or any MySQL tool.

The `.env` file already expects MySQL on `127.0.0.1:3306`, user `root`, no password, database `dicoding_jobs`. That is Laragon's default. If your MySQL has a password or another user, change `DB_USERNAME` and `DB_PASSWORD` in `backend/.env`.

Create the tables and the demo data, then start the API:

```bash
php artisan migrate --seed
php artisan serve
```

Leave this terminal open. The API is now on `http://localhost:8000`.

**Check it works:** open `http://localhost:8000/api/vacancies` in your browser. You should see JSON with four vacancies (Product Engineer, Android Developer, iOS Developer, Code Reviewer). The Laravel welcome page at `http://localhost:8000/` is normal. This project has no pages on the backend, only the API.

## 4. Frontend (Next.js)

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local        # PowerShell: copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. You should see the list with four vacancies.

`.env.local` only contains `NEXT_PUBLIC_API_URL=http://localhost:8000/api`. If you started the backend on another port (for example `php artisan serve --port=8001`), change it there and restart `npm run dev`.

## 5. Try it

- **As a Job Seeker:** search "android" on the home page, then open a vacancy.
- **As a Recruiter:** click **Masuk** and log in with the demo account `recruiter@example.com` / `password`. Open **Dashboard** to create, edit or delete a vacancy. You can also register a new Recruiter.

## 6. Run the tests

**Backend** (no MySQL needed, it uses in-memory SQLite):

```bash
cd backend
php artisan test
```

**Frontend end-to-end** (needs the backend running with the seeded data, see step 3):

```bash
cd frontend
npx playwright install chromium   # first time only, ~120 MB
npm run test:e2e
```

Playwright starts the Next.js dev server itself, or reuses the one you already have running.

If you changed the demo vacancies, reset them before running the E2E tests:

```bash
cd backend
php artisan migrate:fresh --seed
```

## When something goes wrong

**`php` / `composer` is not recognized.**
It is not in your PATH, or the terminal was opened before you changed it. Add the folders from step 1 and open a new terminal.

**The home page shows no vacancies, or "Gagal memuat lowongan".**
The frontend cannot reach the API. Check that:
1. `php artisan serve` is still running.
2. MySQL is running (Laragon: Start All).
3. `http://localhost:8000/api/vacancies` opens in the browser.
4. `NEXT_PUBLIC_API_URL` in `frontend/.env.local` matches the backend port.

**`SQLSTATE[HY000] [2002] Connection refused` when migrating.**
MySQL is not running, or `DB_HOST` / `DB_PORT` in `backend/.env` is wrong.

**`SQLSTATE[HY000] [1049] Unknown database 'dicoding_jobs'`.**
The database from step 3 was not created yet.

**`Access denied for user 'root'`.**
Your MySQL root user has a password. Set `DB_PASSWORD` in `backend/.env`.

**`Port 8000 is already in use`.**
Run `php artisan serve --port=8001` and update `NEXT_PUBLIC_API_URL` to match.

**Playwright says the browser is missing.**
Run `npx playwright install chromium`.

**The E2E tests fail on search or details.**
They expect the four seeded vacancies. Run `php artisan migrate:fresh --seed` in `backend`, then try again.

**The log-in works but you get sent back to the login page.**
The login token lives in the browser's `localStorage`. If you cleared site data or use a strict private window, log in again.
