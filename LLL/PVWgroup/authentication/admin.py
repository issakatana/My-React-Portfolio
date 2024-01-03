from django.contrib import admin
from .models import CustomUser



# Register your models here.
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('member_number', 'email')
    list_filter = ('last_login',)
    search_fields = ('member_number', 'email')
    ordering = ('-date_joined',)
    list_per_page = 50
    # date_hierarchy =
    # list_editable =
    # readonly_fields =
    list_display_links = ('member_number',)


