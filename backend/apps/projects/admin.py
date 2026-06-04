from django.contrib import admin

from .models import Project, Task


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "client", "project_type", "status", "deadline", "budget")
    list_filter = ("project_type", "status")
    search_fields = ("name", "client__name")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "status", "due_date", "assignee")
    list_filter = ("status",)
    search_fields = ("title", "project__name")

