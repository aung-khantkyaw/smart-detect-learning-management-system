# SDLMS Database

Dockerized PostgreSQL with automated backups and an LMS schema supporting users, courses, academic years, chats, announcements, quizzes, and assignments with an AI-detector policy hook.

## What you get

- PostgreSQL 16 in Docker
- Automatic daily backups at 03:00 UTC, rotated (days/weeks/months)
- Schema initialization via scripts in `init/`
- Restore helper script `scripts/restore_latest.sh`

## Run

```bash
# From the database folder
docker compose up -d

# Check logs/health
docker compose ps
docker logs sdlms-postgres --since=1m
```

By default:

- DB: sdlms
- User: sdlms
- Password: sdlms_password
- Port: 5432

Change these in `docker-compose.yml` as needed.

## Backups

- Created by `prodrigestivill/postgres-backup-local` into `./backups`.
- Schedule: daily at 03:00 UTC. Adjust `SCHEDULE` in `docker-compose.yml`.
- Keep policies: 7 days, 4 weeks, 6 months.

Manual backup (optional):

```bash
# Run one-off backup container
docker compose run --rm backup
```

Restore the latest backup:

```bash
./scripts/restore_latest.sh
```

## Schema overview

Key entities and relationships:

- `users` (ADMIN/TEACHER/STUDENT)
- `courses` and `course_offerings` per `academic_years` with assigned `teacher`
- `enrollments` for students
- Chat: `course_chat_rooms`, `academic_chat_rooms`, `chat_members`, `chat_messages`
- `announcements` scoped to course offering or academic year
- Materials: `materials`
- Quizzes: `quizzes`, `quiz_questions`, `quiz_options`, `quiz_submissions`, `quiz_answers`
- Assignments: `assignments`, `assignment_submissions`
- AI policy: `ai_flags` aggregated per offering and student; trigger auto-rejects when `ai_score > 50` and notifies student+teacher

## Real-time chat notes

Real-time behavior is implemented at the application layer (WebSocket/SignalR/etc.). The DB provides rooms, membership, and message storage with flexible `room_type` and `room_id` to support course or academic scopes.

## Initial admin

An admin placeholder is created with email `admin@example.com`. Replace the password hash immediately via your application.

## Migrations

The scripts in `init/` run only on first database initialization. For iterative changes, adopt a migrations tool (e.g., Prisma, Flyway, Liquibase) and stop relying on `init/` for updates after the first run.
