from django.conf import settings
from django.db import models


class Workspace(models.Model):
    name = models.CharField(max_length=160)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_workspaces")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class WorkspaceDriveSettings(models.Model):
    workspace = models.OneToOneField(Workspace, on_delete=models.CASCADE, related_name="drive_settings")
    google_account_email = models.EmailField(blank=True)
    drive_id = models.CharField(max_length=120, blank=True)
    clients_root_folder_name = models.CharField(max_length=80, default="clients")
    clients_root_folder_id = models.CharField(max_length=120, blank=True)
    clients_root_folder_url = models.URLField(blank=True)
    service_account_info = models.JSONField(blank=True, null=True)
    google_access_token = models.TextField(blank=True)
    google_refresh_token = models.TextField(blank=True)
    google_token_expiry = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Workspace Drive settings"
        verbose_name_plural = "Workspace Drive settings"

    def __str__(self):
        return f"{self.workspace} Drive"
