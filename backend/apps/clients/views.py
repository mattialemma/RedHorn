from django.db.models import Count, Q, Sum
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets

from .models import Client
from .serializers import ClientSerializer
from apps.workspaces.google_drive import DriveConfigurationError, DriveOperationError, create_client_drive_folder


@method_decorator(csrf_protect, name="dispatch")
class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer

    def perform_create(self, serializer):
        try:
            with transaction.atomic():
                client = serializer.save()
                create_client_drive_folder(client)
        except (DriveConfigurationError, DriveOperationError) as exc:
            raise ValidationError({"drive": str(exc)}) from exc

    def get_queryset(self):
        queryset = Client.objects.annotate(
            active_projects_count=Count("projects", filter=~Q(projects__status="delivered")),
            open_invoices_amount=Sum("invoices__amount", filter=Q(invoices__status__in=["issued", "overdue"])),
        ).order_by("name")
        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        status = self.request.query_params.get("status")
        if search:
            queryset = queryset.filter(name__icontains=search)
        if category:
            queryset = queryset.filter(category=category)
        if status:
            queryset = queryset.filter(status=status)
        return queryset
