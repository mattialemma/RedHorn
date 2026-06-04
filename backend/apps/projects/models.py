from django.conf import settings
from django.db import models

from apps.clients.models import Client
from apps.workspaces.models import Workspace


class Project(models.Model):
    class Type(models.TextChoices):
        VIDEO = "video", "Video"
        PHOTO = "photo", "Foto"
        GRAPHIC = "graphic", "Grafica"
        WEBSITE = "website", "Sito Web"
        ADS = "ads", "Campagne"
        BRANDING = "branding", "Branding"

    class Status(models.TextChoices):
        PLANNED = "planned", "Pianificato"
        IN_PROGRESS = "in_progress", "In lavorazione"
        REVIEW = "review", "In revisione"
        WAITING_CLIENT = "waiting_client", "In attesa cliente"
        APPROVED = "approved", "Approvato"
        DELIVERED = "delivered", "Consegnato"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="projects")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="projects")
    name = models.CharField(max_length=180)
    project_type = models.CharField(max_length=30, choices=Type.choices, default=Type.VIDEO)
    status = models.CharField(max_length=40, choices=Status.choices, default=Status.PLANNED)
    deadline = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    drive_folder_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    class Status(models.TextChoices):
        TODO = "todo", "Da fare"
        DOING = "doing", "In corso"
        DONE = "done", "Fatto"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="tasks")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=180)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

