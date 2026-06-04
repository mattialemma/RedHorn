from django.db import models

from apps.clients.models import Client
from apps.projects.models import Project
from apps.workspaces.models import Workspace


class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Bozza"
        TO_ISSUE = "to_issue", "Da emettere"
        ISSUED = "issued", "Emessa"
        PAID = "paid", "Pagata"
        OVERDUE = "overdue", "Scaduta"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="invoices")
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="invoices")
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    number = models.CharField(max_length=60, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.DRAFT)
    issue_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    expected_payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.number or f"Fattura {self.pk}"


class Expense(models.Model):
    class Status(models.TextChoices):
        TO_PAY = "to_pay", "Da pagare"
        PAID = "paid", "Pagata"

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name="expenses")
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses")
    name = models.CharField(max_length=160)
    category = models.CharField(max_length=80, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PAID)
    date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

