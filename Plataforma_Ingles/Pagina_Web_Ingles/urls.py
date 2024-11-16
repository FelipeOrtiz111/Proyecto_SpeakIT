from django.urls import path
from . import views
from .views import (
    QuizListView,
    quiz_view,
    header_view,
    quizes_view,
    seguimiento_view
)

urlpatterns = [
    path('', QuizListView.as_view(), name='index'),
    path('header/', header_view, name='header'),
    path('quizes/', quizes_view, name='quizes'),
    path('seguimiento/', seguimiento_view, name='seguimiento'),
    
    path('quiz/<int:pk>/', quiz_view, name='quiz-view'),

]   