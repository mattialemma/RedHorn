from django.contrib import admin

from .models import Workspace, WorkspaceDriveSettings


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at")
    search_fields = ("name", "owner__username")


@admin.register(WorkspaceDriveSettings)
class WorkspaceDriveSettingsAdmin(admin.ModelAdmin):
    list_display = ("workspace", "google_account_email", "drive_id", "clients_root_folder_name", "updated_at")
    search_fields = ("workspace__name", "google_account_email", "drive_id", "clients_root_folder_id")
    readonly_fields = ("clients_root_folder_id", "clients_root_folder_url", "created_at", "updated_at")
