from django.contrib import admin

# Register your models here.
from .models import AppUser, Transaction 

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_active', 'is_staff') 
    search_fields = ('email', 'username')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('type', 'amount')
