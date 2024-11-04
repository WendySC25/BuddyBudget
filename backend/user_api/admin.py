from django.contrib import admin

# Register your models here.
from .models import AppUser

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'is_active', 'is_staff') 
    search_fields = ('email', 'username')  