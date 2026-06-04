from rest_framework import viewsets

from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.select_related("client", "workspace").order_by("deadline", "name")
        client = self.request.query_params.get("client")
        status = self.request.query_params.get("status")
        if client:
            queryset = queryset.filter(client_id=client)
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related("project", "workspace", "assignee").order_by("due_date", "title")
    serializer_class = TaskSerializer

