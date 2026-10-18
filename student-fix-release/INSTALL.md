# Student registration and class update — 18 October 2026

This update fixes automatically generated admission numbers after deletion, adds an administrator-only Current Class selector to Edit Profile, preserves omitted profile fields during updates, and makes the permanent deletion warning explicit. Existing accounts and passwords are unchanged. Existing invoices, grades and attendance are retained when changing class. Deleting a student still permanently deletes linked records; this update does not restore previously deleted records.

## Before installing

1. Back up the live database in cPanel and download a copy of `jma_backend/app/Http/Controllers/StudentController.php` and the existing website files in `public_html`.
2. These paths come from this project's deployment configuration: `/home/jeremode/jma_backend` and `/home/jeremode/public_html`. If your hosting account uses different paths, use those instead.
3. Schedule a short maintenance window. In cPanel Terminal run:

```sh
cd /home/jeremode/jma_backend
php artisan down
```

## Upload and install

1. Upload `student-fix-backend.zip` into `/home/jeremode/jma_backend` and extract there, allowing replacement of StudentController.php. The ZIP contains `app/` and `database/` directly: do not place them inside an extra backend folder. It does not contain `.env`, vendor dependencies, uploads or database exports.
2. In cPanel Terminal run the migration for this update only:

```sh
cd /home/jeremode/jma_backend
php artisan migrate --path=database/migrations/2026_10_18_171220_create_student_admission_sequence_table.php --force
php artisan optimize:clear
php artisan config:cache
```

The migration creates one small table and initializes its counter above existing standard JMA admission numbers/usernames. It does not replace student data. Do not continue if migration fails: keep maintenance enabled and retain the error for investigation. Use the PHP CLI version configured for this Laravel installation (PHP 8.3 or newer).

3. Upload `student-fix-frontend.zip` into `/home/jeremode/public_html` and extract there, replacing matching files. `index.html` must be directly inside `public_html`, with `assets/` beside it. Keep older hashed assets during this update so already-open browser sessions can still load them. The frontend targets `https://api.jeremodelacademy.com.ng/api`.
4. Bring the portal back online:

```sh
cd /home/jeremode/jma_backend
php artisan up
```

5. Refresh the browser with Ctrl+F5. For an installed portal app, close and reopen it while online.

If cPanel Terminal is unavailable, ask your hosting support to execute the same commands. Do not upload a public PHP script to run migrations. Do not import a replacement school database.

## Check the update

- Sign in as administrator. Open Student Roster, click a student name, choose Edit Profile, select Current Class and Save Changes. Confirm the roster reflects the new class and the account, results, attendance and invoices remain available. Use a test student or a class correction you already intend to make.
- On a staging copy, register multiple test students, delete an earlier test student, and register another. Confirm registration succeeds with a fresh admission number. Delete the most recently registered test student and repeat: its generated number must not be reused.
- On staging, submit an already-used custom admission number and confirm the specific duplicate-number error appears.
- Do not delete a real student just to verify this fix. Deletion remains permanent.

## Rollback

Enable maintenance, restore the backed-up controller and frontend files, clear/rebuild Laravel configuration as above, then run `php artisan up`. Leave the admission sequence table and its migration record in place; dropping or resetting the counter can permit number reuse. Rolling back the code reintroduces the original registration bug. A database restore should only be performed deliberately from your backup because it can discard registrations and payments made since that backup.

## Validation scope

The regression suite uses an isolated in-memory SQLite database. It covers deletion/re-registration, custom number conflicts, initialization from existing accounts, class changes preserving records, deletion cascades, teacher restrictions, and existing registration/login/mail behavior. The MySQL/InnoDB allocation uses a transaction and a shared counter-row lock to serialize registrations. Concurrent registration against the live cPanel MySQL database has not been exercised. Production frontend build and PHP formatting are checked locally. Nothing has been uploaded to the live website by this task.
