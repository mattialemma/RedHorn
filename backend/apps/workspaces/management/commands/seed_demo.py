from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.clients.models import Client
from apps.finances.models import Expense, Invoice
from apps.projects.models import Project, Task
from apps.workspaces.models import Workspace


class Command(BaseCommand):
    help = "Create local demo data for RedHorn."

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(username="admin", defaults={"email": "admin@redhorn.local"})
        if created:
            user.set_password("admin123")
            user.is_staff = True
            user.is_superuser = True
            user.save()

        workspace, _ = Workspace.objects.get_or_create(name="RedHorn Studio", owner=user)
        today = timezone.localdate()

        conad, _ = Client.objects.get_or_create(
            workspace=workspace,
            name="Conad",
            defaults={"category": "Video", "status": Client.Status.ACTIVE, "email": "marketing@conad.example"},
        )
        nutella, _ = Client.objects.get_or_create(
            workspace=workspace,
            name="Nutella",
            defaults={"category": "Campagne", "status": Client.Status.TO_INVOICE, "email": "brand@nutella.example"},
        )
        kreo, _ = Client.objects.get_or_create(
            workspace=workspace,
            name="Kreo",
            defaults={"category": "Siti Web", "status": Client.Status.ACTIVE, "email": "info@kreo.example"},
        )

        project, _ = Project.objects.get_or_create(
            workspace=workspace,
            client=conad,
            name="Video Promo Estate",
            defaults={
                "project_type": Project.Type.VIDEO,
                "status": Project.Status.IN_PROGRESS,
                "deadline": today + timedelta(days=12),
                "budget": 1800,
            },
        )
        Project.objects.get_or_create(
            workspace=workspace,
            client=nutella,
            name="Campagna Social Giugno",
            defaults={
                "project_type": Project.Type.ADS,
                "status": Project.Status.REVIEW,
                "deadline": today + timedelta(days=7),
                "budget": 2400,
            },
        )
        Project.objects.get_or_create(
            workspace=workspace,
            client=kreo,
            name="Restyling Sito",
            defaults={
                "project_type": Project.Type.WEBSITE,
                "status": Project.Status.PLANNED,
                "deadline": today + timedelta(days=30),
                "budget": 3200,
            },
        )

        Task.objects.get_or_create(workspace=workspace, project=project, title="Montaggio prima bozza", defaults={"due_date": today + timedelta(days=4)})
        Invoice.objects.get_or_create(
            workspace=workspace,
            client=conad,
            project=project,
            number="2026-001",
            defaults={
                "amount": 1200,
                "status": Invoice.Status.ISSUED,
                "issue_date": today,
                "due_date": today + timedelta(days=30),
                "expected_payment_date": today + timedelta(days=18),
            },
        )
        Expense.objects.get_or_create(
            workspace=workspace,
            name="Abbonamento software",
            defaults={"category": "Software", "amount": 49, "status": Expense.Status.PAID, "date": today},
        )

        self.stdout.write(self.style.SUCCESS("Demo data ready. Admin login: admin / admin123"))
