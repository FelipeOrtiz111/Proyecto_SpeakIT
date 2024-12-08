from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, StudentProfile, TeacherProfile, Section

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'role']
    list_filter = ['role']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'description')}),
    )

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['code']
    list_filter = ['is_active']
    search_fields = ['code']

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(StudentProfile)
admin.site.register(TeacherProfile)