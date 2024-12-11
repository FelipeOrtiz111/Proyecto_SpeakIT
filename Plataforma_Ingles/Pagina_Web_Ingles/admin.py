from django.contrib import admin
from .models import Quiz

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['name', 'level', 'difficulty', 'is_active']
    list_filter = ['level', 'difficulty', 'is_active', 'sections']
    search_fields = ['name']
    filter_horizontal = ['sections']

