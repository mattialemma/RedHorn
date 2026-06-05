from django.db import transaction
from django.conf import settings
from django.core import signing
from django.shortcuts import redirect
from django.utils import timezone
from urllib.parse import quote
import secrets
from rest_framework import status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .google_drive import DriveConfigurationError, DriveOperationError, WorkspaceGoogleDrive
from .models import Workspace, WorkspaceDriveSettings
from .serializers import WorkspaceDriveSettingsSerializer, WorkspaceSerializer


class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all().order_by("name")
    serializer_class = WorkspaceSerializer


class WorkspaceDriveSettingsView(APIView):
    def get(self, request):
        workspace = self.get_workspace()
        drive_settings = self.get_drive_settings(workspace)
        serializer = WorkspaceDriveSettingsSerializer(drive_settings)
        return Response(serializer.data)

    def post(self, request):
        workspace = self.get_workspace()
        drive_settings = self.get_drive_settings(workspace)
        serializer = WorkspaceDriveSettingsSerializer(drive_settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                drive_settings = serializer.save()
                WorkspaceGoogleDrive(workspace).ensure_clients_root_folder()
        except (DriveConfigurationError, DriveOperationError) as exc:
            return Response({"drive": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(WorkspaceDriveSettingsSerializer(drive_settings).data)

    @staticmethod
    def get_workspace():
        workspace = Workspace.objects.order_by("id").first()
        if not workspace:
            raise ValidationError({"workspace": "Crea un workspace prima di collegare Google Drive."})
        return workspace

    @staticmethod
    def get_drive_settings(workspace):
        drive_settings, _ = WorkspaceDriveSettings.objects.get_or_create(workspace=workspace)
        return drive_settings


class GoogleDriveOAuthStartView(APIView):
    def get(self, request):
        workspace = WorkspaceDriveSettingsView.get_workspace()
        if not settings.GOOGLE_OAUTH_CLIENT_ID or not settings.GOOGLE_OAUTH_CLIENT_SECRET:
            return Response({"drive": "OAuth Google non e configurato sul server."}, status=status.HTTP_400_BAD_REQUEST)

        code_verifier = secrets.token_urlsafe(64)
        flow = self.build_flow(request, code_verifier=code_verifier)
        state = signing.dumps(
            {"workspace_id": workspace.id, "code_verifier": code_verifier},
            salt="google-drive-oauth",
        )
        authorization_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
            state=state,
        )
        return redirect(authorization_url)

    @staticmethod
    def build_flow(request, code_verifier=None):
        from google_auth_oauthlib.flow import Flow

        redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI or request.build_absolute_uri("/api/drive/oauth/callback/")
        client_config = {
            "web": {
                "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri],
            }
        }
        flow = Flow.from_client_config(client_config, scopes=settings.GOOGLE_DRIVE_SCOPES, code_verifier=code_verifier)
        flow.redirect_uri = redirect_uri
        return flow


class GoogleDriveOAuthCallbackView(APIView):
    def get(self, request):
        frontend_url = settings.FRONTEND_URL.rstrip("/")
        state = request.GET.get("state", "")
        error = request.GET.get("error", "")
        if error:
            return redirect(f"{frontend_url}/?drive=error")

        try:
            state_payload = signing.loads(state, salt="google-drive-oauth", max_age=600)
            workspace = Workspace.objects.get(id=state_payload["workspace_id"])
            flow = GoogleDriveOAuthStartView.build_flow(request, code_verifier=state_payload.get("code_verifier"))
            flow.fetch_token(authorization_response=request.build_absolute_uri())
            credentials = flow.credentials

            drive_settings = WorkspaceDriveSettingsView.get_drive_settings(workspace)
            refresh_token = credentials.refresh_token or drive_settings.google_refresh_token
            if not refresh_token:
                return redirect(f"{frontend_url}/?drive=missing_refresh_token")

            drive_settings.google_access_token = credentials.token or ""
            drive_settings.google_refresh_token = refresh_token
            if credentials.expiry:
                drive_settings.google_token_expiry = timezone.make_aware(credentials.expiry) if timezone.is_naive(credentials.expiry) else credentials.expiry
            drive_settings.service_account_info = None
            drive_settings.save(
                update_fields=[
                    "google_access_token",
                    "google_refresh_token",
                    "google_token_expiry",
                    "service_account_info",
                    "updated_at",
                ]
            )

            drive = WorkspaceGoogleDrive(workspace)
            try:
                about = drive.service.about().get(fields="user(emailAddress)").execute()
                drive_settings.google_account_email = about.get("user", {}).get("emailAddress", "")
                drive_settings.save(update_fields=["google_account_email", "updated_at"])
            except Exception:
                pass
            drive.ensure_clients_root_folder()
        except Exception as exc:
            return redirect(f"{frontend_url}/?drive=error&drive_error={quote(str(exc)[:240])}")

        return redirect(f"{frontend_url}/?drive=connected")
