from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("name", "workspace", "category", "status", "email", "has_photo", "updated_at")
    list_filter = ("status", "category")
    search_fields = ("name", "email", "contact_name")
    fields = (
        "workspace",
        "name",
        "category",
        "client_type",
        "legal_name",
        "vat_number",
        "tax_code",
        "status",
        "photo",
        "theme_color",
        "contact_name",
        "contact_role",
        "email",
        "billing_email",
        "phone_prefix",
        "phone",
        "pec",
        "sdi_code",
        "address",
        "city",
        "postal_code",
        "country",
        "drive_folder_url",
        "notes",
        "administrative_notes",
    )

    @admin.display(boolean=True, description="Photo")
    def has_photo(self, client):
        return bool(client.photo)
