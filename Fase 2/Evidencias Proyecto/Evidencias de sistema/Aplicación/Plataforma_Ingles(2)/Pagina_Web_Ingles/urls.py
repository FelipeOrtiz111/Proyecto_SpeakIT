from django.urls import path
from . import views
from .views import (
    QuizListView,
    quiz_view,
    header_view,
    quizes_view,
    estadisticas_view,
    quiz_data_view,
    save_quiz_view,
    seguimiento_view,
    assign_section,
)

urlpatterns = [
    path('', QuizListView.as_view(), name='index'),
    path('header/', header_view, name='header'),
    path('quizes/', quizes_view, name='quizes'),
    path('estadisticas/', estadisticas_view, name='estadisticas'),
    path('seguimiento/', seguimiento_view, name='seguimiento'),
    path('assign-section/', assign_section, name='assign-section'),
    # URLs para quizes
    path('<pk>/', quiz_view, name='quiz-view'),
    path('<pk>/data/', quiz_data_view, name='quiz-data-view'),
    path('<pk>/save/', save_quiz_view, name='quiz-save-view'),
]   