import re

from rest_framework import serializers

from .models import Client
from apps.workspaces.models import Workspace


class ClientSerializer(serializers.ModelSerializer):
    active_projects_count = serializers.IntegerField(read_only=True)
    open_invoices_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    photo_url = serializers.SerializerMethodField()

    def get_photo_url(self, client):
        if not client.photo:
            return ""
        return client.photo.url

    def validate_photo(self, photo):
        if not photo:
            return photo
        if photo.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Photo must be 2MB or smaller.")
        if getattr(photo, "content_type", "") not in {"image/png", "image/jpeg"}:
            raise serializers.ValidationError("Photo must be a PNG or JPG file.")
        return photo

    def validate(self, attrs):
        errors = {}

        def value(name):
            return str(attrs.get(name, "") or "").strip()

        def required_text(name, label, min_length=3, max_length=80):
            current = value(name)
            if not current:
                errors[name] = f"{label} is required."
                return
            optional_text(name, label, min_length, max_length, required=True)

        def optional_text(name, label, min_length=3, max_length=80, required=False):
            current = value(name)
            if not current and not required:
                return
            if len(current) < min_length:
                errors[name] = f"{label} must be at least {min_length} characters."
            elif len(current) > max_length:
                errors[name] = f"{label} must be at most {max_length} characters."
            elif not re.search(r"[\w]", current, re.UNICODE):
                errors[name] = f"{label} cannot contain only spaces or symbols."
            elif not re.fullmatch(r"[\w\s.,'&()/-]+", current, re.UNICODE):
                errors[name] = f"{label} contains invalid characters."

        def optional_alphanumeric(name, label, min_length=3, max_length=20):
            current = value(name)
            if not current:
                return
            if len(current) < min_length:
                errors[name] = f"{label} must be at least {min_length} characters."
            elif len(current) > max_length:
                errors[name] = f"{label} must be at most {max_length} characters."
            elif not re.fullmatch(r"[A-Za-z0-9]+", current):
                errors[name] = f"{label} can contain only letters and numbers."

        def optional_digits(name, label, min_length=3, max_length=15):
            current = value(name)
            if not current:
                return
            if not re.fullmatch(r"\d+", current):
                errors[name] = f"{label} can contain only numbers."
            elif len(current) < min_length:
                errors[name] = f"{label} must be at least {min_length} digits."
            elif len(current) > max_length:
                errors[name] = f"{label} must be at most {max_length} digits."

        def optional_email(name, label):
            current = value(name)
            if not current:
                return
            if len(current) > 120:
                errors[name] = f"{label} is too long."
            elif not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]{2,}", current):
                errors[name] = f"{label} is not valid."

        required_text("name", "Client name", 3, 30)
        required_text("category", "Category", 3, 80)
        required_text("client_type", "Client type", 3, 40)
        optional_text("notes", "Description", 3, 256)
        optional_text("legal_name", "Legal name", 3, 80)
        optional_alphanumeric("vat_number", "VAT number", 3, 20)
        optional_alphanumeric("tax_code", "Tax code", 3, 20)
        optional_text("contact_name", "Main contact", 3, 80)
        optional_text("contact_role", "Contact role", 3, 60)
        optional_email("email", "Email")
        optional_email("billing_email", "Billing email")
        optional_digits("phone_prefix", "Phone prefix", 1, 4)
        optional_digits("phone", "Phone", 5, 15)
        optional_email("pec", "PEC")
        optional_alphanumeric("sdi_code", "SDI code", 3, 10)
        optional_text("address", "Billing address", 3, 120)
        optional_text("city", "City", 3, 80)
        optional_digits("postal_code", "Postal code", 3, 10)
        optional_text("administrative_notes", "Administrative notes", 3, 256)

        if errors:
            raise serializers.ValidationError(errors)

        for field in [
            "name",
            "category",
            "client_type",
            "legal_name",
            "vat_number",
            "tax_code",
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
            "notes",
            "administrative_notes",
        ]:
            if field in attrs and isinstance(attrs[field], str):
                attrs[field] = attrs[field].strip()

        return attrs

    class Meta:
        model = Client
        fields = [
            "id",
            "workspace",
            "name",
            "category",
            "client_type",
            "legal_name",
            "vat_number",
            "tax_code",
            "status",
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
            "photo",
            "photo_url",
            "theme_color",
            "drive_folder_url",
            "notes",
            "administrative_notes",
            "active_projects_count",
            "open_invoices_amount",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "workspace": {"required": False},
        }

    def create(self, validated_data):
        if "workspace" not in validated_data:
            workspace = Workspace.objects.order_by("id").first()
            if not workspace:
                raise serializers.ValidationError({"workspace": "Create a workspace before adding clients."})
            validated_data["workspace"] = workspace
        return super().create(validated_data)
