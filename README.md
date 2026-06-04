# RedHorn

Gestionale per clienti, progetti, scadenze e finanze pensato per freelance e piccole agenzie creative.

## Avvio Locale

```bash
docker compose up --build
```

Servizi:

- Frontend: http://localhost:3100
- Backend API: http://localhost:8100/api
- Django admin: http://localhost:8100/admin
- PostgreSQL: localhost:15432

## Prima Migrazione

In un secondo terminale:

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

Per popolare dati demo locali:

```bash
docker compose exec backend python manage.py seed_demo
```

Credenziali demo locali:

- Username: `admin`
- Password: `admin123`
