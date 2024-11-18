from django.urls import path
from . import views
from .views import (
    QuizListView,
    quiz_view,
    header_view,
    quizes_view,
    seguimiento_view,
    quiz_data_view,
    save_quiz_view
)

urlpatterns = [
    path('', QuizListView.as_view(), name='index'),
    path('header/', header_view, name='header'),
    path('quizes/', quizes_view, name='quizes'),
    path('seguimiento/', seguimiento_view, name='seguimiento'),
    # URLs para el quiz
    path('<int:pk>/', quiz_view, name='quiz-view'),
    path('<int:pk>/data/', quiz_data_view, name='quiz-data-view'),
    path('<int:pk>/save/', save_quiz_view, name='quiz-save-view'),
]   