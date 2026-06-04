from rest_framework import serializers

from .models import Expense, Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "workspace",
            "client",
            "client_name",
            "project",
            "project_name",
            "number",
            "amount",
            "status",
            "issue_date",
            "due_date",
            "expected_payment_date",
            "notes",
            "created_at",
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "workspace", "project", "project_name", "name", "category", "amount", "status", "date", "notes", "created_at"]

