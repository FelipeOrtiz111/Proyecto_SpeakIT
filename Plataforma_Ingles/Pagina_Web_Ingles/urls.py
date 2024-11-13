from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('header', views.includes, name='header'),
    path('quizz', views.includes, name='quizz'),
    path('seguimiento', views.includes, name='seguimiento'),
]   