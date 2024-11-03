from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('header', views.includes, name='header'),
    path('videos/<int:unidad_id>/', views.videos_por_unidad, name='videos_por_unidad'),
]   