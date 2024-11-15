from django.urls import path
from . import views
from .views import (
    QuizListView,
    quiz_view
)

urlpatterns = [
    path('', views.index, name='index'),
    path('header', views.includes, name='header'),
    path('quizes', views.includes, name='quizes'), # <- quiz.html
    path('seguimiento', views.includes, name='seguimiento'),
    
    path('', QuizListView.as_view(), name='main-view'), 
    path('<pk>/', quiz_view, name='quiz-view'),
]   