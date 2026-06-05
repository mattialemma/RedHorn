from rest_framework import serializers
from django.conf import settings

from .models import Workspace, WorkspaceDriveSettings


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ["id", "name", "owner", "created_at"]


class WorkspaceDriveSettingsSerializer(serializers.ModelSerializer):
    is_connected = serializers.SerializerMethodField()
    oauth_available = serializers.SerializerMethodField()

    class Meta:
        model = WorkspaceDriveSettings
        fields = [
            "google_account_email",
            "drive_id",
            "clients_root_folder_name",
            "clients_root_folder_id",
            "clients_root_folder_url",
            "is_connected",
            "oauth_available",
        ]
        read_only_fields = ["clients_root_folder_id", "clients_root_folder_url", "is_connected", "oauth_available"]

    def get_is_connected(self, drive_settings):
        return bool((drive_settings.google_refresh_token or drive_settings.service_account_info) and drive_settings.clients_root_folder_id)

    def get_oauth_available(self, drive_settings):
        return bool(settings.GOOGLE_OAUTH_CLIENT_ID and settings.GOOGLE_OAUTH_CLIENT_SECRET)
