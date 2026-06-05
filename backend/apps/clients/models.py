from django.db import models

from apps.workspaces.models import Workspace


class Client(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Attivo"
        PAUSED = "paused", "In pausa"
        TO_INVOICE = "to_invoice", "Da fatturare"
        OVERDUE = "overdue", "Insoluto"
        CLOSED = "closed", "Concluso"

    class DriveSyncStatus(models.TextChoices):
        PENDING = "pending", "In attesa"
        SYNCED = "synced", "Sincronizzato"
        FAILED = "failed", "Errore"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="clients")
    name = models.CharField(max_length=180)
    category = models.CharField(max_length=80, blank=True)
    client_type = models.CharField(max_length=40, blank=True)
    legal_name = models.CharField(max_length=180, blank=True)
    vat_number = models.CharField(max_length=30, blank=True)
    tax_code = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE)
    contact_name = models.CharField(max_length=120, blank=True)
    contact_role = models.CharField(max_length=80, blank=True)
    email = models.EmailField(blank=True)
    billing_email = models.EmailField(blank=True)
    phone_prefix = models.CharField(max_length=8, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    pec = models.EmailField(blank=True)
    sdi_code = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=180, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=8, blank=True)
    photo = models.ImageField(upload_to="clients/", blank=True, null=True)
    theme_color = models.CharField(max_length=20, blank=True)
    drive_folder_id = models.CharField(max_length=120, blank=True)
    drive_folder_url = models.URLField(blank=True)
    drive_sync_status = models.CharField(
        max_length=20,
        choices=DriveSyncStatus.choices,
        default=DriveSyncStatus.PENDING,
    )
    drive_sync_error = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    administrative_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
