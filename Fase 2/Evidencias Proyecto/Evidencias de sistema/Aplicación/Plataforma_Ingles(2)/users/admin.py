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
    list_display = ['code', 'created_by', 'created_at', 'is_active']
    list_filter = ['created_by', 'is_active']
    search_fields = ['code']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser and request.user.role != 'TEACHER':
            qs = qs.filter(created_by=request.user)
        return qs
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'created_by':
            kwargs['queryset'] = CustomUser.objects.filter(role='TEACHER')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(StudentProfile)
admin.site.register(TeacherProfile)