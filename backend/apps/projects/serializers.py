from rest_framework import serializers

from .models import Project, Task


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "workspace",
            "client",
            "client_name",
            "name",
            "project_type",
            "status",
            "deadline",
            "budget",
            "drive_folder_url",
            "notes",
            "created_at",
            "updated_at",
        ]


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["id", "workspace", "project", "assignee", "title", "status", "due_date", "created_at"]

