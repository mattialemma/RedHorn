from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.urls import include, path
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.routers import DefaultRouter

from apps.clients.views import ClientViewSet
from apps.finances.views import ExpenseViewSet, InvoiceViewSet, dashboard_summary
from apps.projects.views import ProjectViewSet, TaskViewSet
from apps.workspaces.views import GoogleDriveOAuthCallbackView, GoogleDriveOAuthStartView, WorkspaceDriveSettingsView, WorkspaceViewSet

router = DefaultRouter()
router.register("workspaces", WorkspaceViewSet)
router.register("clients", ClientViewSet, basename="client")
router.register("projects", ProjectViewSet, basename="project")
router.register("tasks", TaskViewSet)
router.register("invoices", InvoiceViewSet)
router.register("expenses", ExpenseViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/csrf/", ensure_csrf_cookie(lambda request: JsonResponse({"detail": "CSRF cookie set"}))),
    path("api/drive/settings/", WorkspaceDriveSettingsView.as_view()),
    path("api/drive/oauth/start/", GoogleDriveOAuthStartView.as_view()),
    path("api/drive/oauth/callback/", GoogleDriveOAuthCallbackView.as_view()),
    path("api/dashboard/summary/", dashboard_summary),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
