from django.contrib import admin

from .models import Expense, Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("number", "client", "project", "amount", "status", "expected_payment_date")
    list_filter = ("status",)
    search_fields = ("number", "client__name", "project__name")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "amount", "status", "date")
    list_filter = ("status", "category")
    search_fields = ("name", "category")

