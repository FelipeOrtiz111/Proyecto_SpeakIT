from django.contrib import admin
from .models import Quiz

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['name', 'topic', 'difficulty', 'is_active']
    list_filter = ['difficulty', 'is_active', 'sections']
    search_fields = ['name', 'topic']
    filter_horizontal = ['sections']

