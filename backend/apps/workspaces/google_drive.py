import json
from pathlib import Path

from django.conf import settings
from django.utils import timezone

from .models import WorkspaceDriveSettings


class DriveConfigurationError(Exception):
    pass


class DriveOperationError(Exception):
    pass


def drive_folder_url(folder_id):
    return f"https://drive.google.com/drive/folders/{folder_id}"


def create_client_drive_folder(client):
    drive = WorkspaceGoogleDrive(client.workspace)
    folder = drive.create_client_folder(client)
    client.drive_folder_id = folder["id"]
    client.drive_folder_url = folder.get("webViewLink") or drive_folder_url(folder["id"])
    client.drive_sync_status = client.DriveSyncStatus.SYNCED
    client.drive_sync_error = ""
    client.save(update_fields=["drive_folder_id", "drive_folder_url", "drive_sync_status", "drive_sync_error", "updated_at"])
    return folder


class WorkspaceGoogleDrive:
    folder_mime_type = "application/vnd.google-apps.folder"
    default_client_subfolders = ("Admin", "Contratti", "Progetti", "File")

    def __init__(self, workspace):
        self.workspace = workspace
        self.drive_settings = self._get_drive_settings()
        self.drive_id = self.drive_settings.drive_id or settings.GOOGLE_DRIVE_DEFAULT_DRIVE_ID
        self.service = self._build_service()

    def create_client_folder(self, client):
        root_folder = self.ensure_clients_root_folder()
        folder_name = self.client_folder_name(client)
        existing = self.find_folder(
            name=folder_name,
            parent_id=root_folder["id"],
            app_properties={"redhorn_client_id": str(client.id)},
        )
        if existing:
            return existing

        folder = self.create_folder(
            name=folder_name,
            parent_id=root_folder["id"],
            app_properties={
                "redhorn_workspace_id": str(self.workspace.id),
                "redhorn_client_id": str(client.id),
            },
        )
        for subfolder_name in self.default_client_subfolders:
            self.create_folder(
                name=subfolder_name,
                parent_id=folder["id"],
                app_properties={
                    "redhorn_workspace_id": str(self.workspace.id),
                    "redhorn_client_id": str(client.id),
                    "redhorn_folder_kind": subfolder_name.lower(),
                },
            )
        return folder

    def ensure_clients_root_folder(self):
        if self.drive_settings.clients_root_folder_id:
            folder = self.get_folder(self.drive_settings.clients_root_folder_id)
            if folder:
                return folder
            self.drive_settings.clients_root_folder_id = ""
            self.drive_settings.clients_root_folder_url = ""
            self.drive_settings.save(update_fields=["clients_root_folder_id", "clients_root_folder_url", "updated_at"])

        root_name = self.drive_settings.clients_root_folder_name or "clients"
        root_parent_id = self.drive_id or "root"
        folder = self.find_folder(
            name=root_name,
            parent_id=root_parent_id,
            app_properties={"redhorn_workspace_id": str(self.workspace.id), "redhorn_folder_kind": "clients_root"},
        )
        if not folder:
            folder = self.find_folder(name=root_name, parent_id=root_parent_id)
        if not folder:
            folder = self.create_folder(
                name=root_name,
                parent_id=root_parent_id,
                app_properties={
                    "redhorn_workspace_id": str(self.workspace.id),
                    "redhorn_folder_kind": "clients_root",
                },
            )

        self.drive_settings.clients_root_folder_id = folder["id"]
        self.drive_settings.clients_root_folder_url = folder.get("webViewLink") or drive_folder_url(folder["id"])
        self.drive_settings.save(update_fields=["clients_root_folder_id", "clients_root_folder_url", "updated_at"])
        return folder

    def get_folder(self, folder_id):
        try:
            folder = (
                self.service.files()
                .get(
                    fileId=folder_id,
                    fields="id,name,mimeType,webViewLink,trashed",
                    supportsAllDrives=True,
                )
                .execute()
            )
        except Exception:
            return None
        if folder.get("trashed") or folder.get("mimeType") != self.folder_mime_type:
            return None
        return folder

    def find_folder(self, name, parent_id, app_properties=None):
        query = [
            f"name = '{self.escape_query_value(name)}'",
            f"'{self.escape_query_value(parent_id)}' in parents",
            f"mimeType = '{self.folder_mime_type}'",
            "trashed = false",
        ]
        for key, value in (app_properties or {}).items():
            query.append(f"appProperties has {{ key='{self.escape_query_value(key)}' and value='{self.escape_query_value(value)}' }}")

        params = {
            "q": " and ".join(query),
            "pageSize": 1,
            "fields": "files(id,name,mimeType,webViewLink)",
            "supportsAllDrives": True,
            "includeItemsFromAllDrives": True,
        }
        if self.drive_id:
            params["corpora"] = "drive"
            params["driveId"] = self.drive_id

        try:
            result = self.service.files().list(**params).execute()
        except Exception as exc:
            raise DriveOperationError(f"Non riesco a cercare le cartelle su Google Drive: {exc}") from exc
        files = result.get("files", [])
        return files[0] if files else None

    def create_folder(self, name, parent_id, app_properties=None):
        body = {
            "name": name,
            "mimeType": self.folder_mime_type,
            "parents": [parent_id],
        }
        if app_properties:
            body["appProperties"] = app_properties

        try:
            return (
                self.service.files()
                .create(
                    body=body,
                    fields="id,name,mimeType,webViewLink",
                    supportsAllDrives=True,
                )
                .execute()
            )
        except Exception as exc:
            raise DriveOperationError(f"Non riesco a creare la cartella '{name}' su Google Drive: {exc}") from exc

    def _get_drive_settings(self):
        drive_settings, _ = WorkspaceDriveSettings.objects.get_or_create(
            workspace=self.workspace,
            defaults={
                "drive_id": settings.GOOGLE_DRIVE_DEFAULT_DRIVE_ID,
                "clients_root_folder_name": "clients",
            },
        )
        return drive_settings

    def _build_service(self):
        oauth_credentials = self._oauth_credentials()
        if oauth_credentials:
            try:
                from googleapiclient.discovery import build

                return build("drive", "v3", credentials=oauth_credentials, cache_discovery=False)
            except Exception as exc:
                raise DriveConfigurationError(f"Connessione Google Drive non valida: {exc}") from exc

        credentials_info = self._credentials_info()
        if not credentials_info:
            raise DriveConfigurationError(
                "Google Drive non e collegato. Usa Continua con Google prima di creare clienti."
            )

        try:
            from google.oauth2.service_account import Credentials
            from googleapiclient.discovery import build

            credentials = Credentials.from_service_account_info(credentials_info, scopes=settings.GOOGLE_DRIVE_SCOPES)
            return build("drive", "v3", credentials=credentials, cache_discovery=False)
        except Exception as exc:
            raise DriveConfigurationError(f"Configurazione Google Drive non valida: {exc}") from exc

    def _oauth_credentials(self):
        if not self.drive_settings.google_refresh_token:
            return None
        if not settings.GOOGLE_OAUTH_CLIENT_ID or not settings.GOOGLE_OAUTH_CLIENT_SECRET:
            raise DriveConfigurationError("OAuth Google non e configurato sul server.")

        try:
            from google.auth.transport.requests import Request
            from google.oauth2.credentials import Credentials

            credentials = Credentials(
                token=self.drive_settings.google_access_token or None,
                refresh_token=self.drive_settings.google_refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_OAUTH_CLIENT_ID,
                client_secret=settings.GOOGLE_OAUTH_CLIENT_SECRET,
                scopes=settings.GOOGLE_DRIVE_SCOPES,
            )
            if credentials.expired and credentials.refresh_token:
                credentials.refresh(Request())
                self.drive_settings.google_access_token = credentials.token or ""
                if credentials.expiry:
                    self.drive_settings.google_token_expiry = timezone.make_aware(credentials.expiry) if timezone.is_naive(credentials.expiry) else credentials.expiry
                self.drive_settings.save(update_fields=["google_access_token", "google_token_expiry", "updated_at"])
            return credentials
        except Exception as exc:
            raise DriveConfigurationError(f"Accesso Google Drive scaduto o non valido: {exc}") from exc

    def _credentials_info(self):
        if self.drive_settings.service_account_info:
            return self.drive_settings.service_account_info
        if settings.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON:
            try:
                return json.loads(settings.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON)
            except json.JSONDecodeError as exc:
                raise DriveConfigurationError("GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON non contiene JSON valido.") from exc
        if settings.GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE:
            path = Path(settings.GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE)
            if not path.exists():
                raise DriveConfigurationError(f"File service account non trovato: {path}")
            try:
                return json.loads(path.read_text())
            except json.JSONDecodeError as exc:
                raise DriveConfigurationError(f"File service account non valido: {path}") from exc
        return None

    @staticmethod
    def client_folder_name(client):
        return f"{client.name} - C{client.id}"

    @staticmethod
    def escape_query_value(value):
        return str(value).replace("\\", "\\\\").replace("'", "\\'")
