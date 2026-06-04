from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from apps.projects.models import Project

from .models import Expense, Invoice
from .serializers import ExpenseSerializer, InvoiceSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("client", "project", "workspace").order_by("-created_at")
    serializer_class = InvoiceSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("project", "workspace").order_by("-date")
    serializer_class = ExpenseSerializer


@api_view(["GET"])
def dashboard_summary(request):
    today = timezone.localdate()
    month_invoices = Invoice.objects.filter(issue_date__year=today.year, issue_date__month=today.month)
    month_expenses = Expense.objects.filter(date__year=today.year, date__month=today.month)

    return Response(
        {
            "monthly_revenue": month_invoices.aggregate(total=Sum("amount"))["total"] or 0,
            "collected": Invoice.objects.filter(status="paid").aggregate(total=Sum("amount"))["total"] or 0,
            "to_collect": Invoice.objects.filter(status__in=["issued", "overdue"]).aggregate(total=Sum("amount"))["total"] or 0,
            "monthly_costs": month_expenses.aggregate(total=Sum("amount"))["total"] or 0,
            "active_projects": Project.objects.exclude(status="delivered").count(),
            "overdue_invoices": Invoice.objects.filter(status="overdue").count(),
        }
    )

