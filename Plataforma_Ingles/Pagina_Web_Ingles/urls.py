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
    teacher_crud_view,
    add_quiz,
    edit_quiz,
    delete_quiz,
    add_answer,
    add_question,
    edit_question,
    delete_question,
)

urlpatterns = [
    path('', QuizListView.as_view(), name='index'),
    path('header/', header_view, name='header'),
    path('quizes/', quizes_view, name='quizes'),
    path('estadisticas/', estadisticas_view, name='estadisticas'),
    path('seguimiento/', seguimiento_view, name='seguimiento'),
    path('assign-section/', assign_section, name='assign-section'),
    # CRUD de quizes
    path('teacher-crud/', teacher_crud_view, name='teacher-crud'),
    path('add-quiz/', add_quiz, name='add-quiz'),
    path('edit-quiz/<int:quiz_id>/', edit_quiz, name='edit-quiz'),
    path('delete-quiz/<int:quiz_id>/', delete_quiz, name='delete-quiz'),
    # URLs para quizes
    path('<int:pk>/', quiz_view, name='quiz-view'),
    path('<int:pk>/data/', quiz_data_view, name='quiz-data-view'),
    path('<int:pk>/save/', save_quiz_view, name='quiz-save-view'),
    # CRUD de preguntas
    path('add-question/', add_question, name='add-question'),
    path('edit-question/<int:question_id>/', edit_question, name='edit-question'),
    path('delete-question/<int:question_id>/', delete_question, name='delete-question'),
    # CRUD de respuestas
    path('add-answer/<int:question_id>/', add_answer, name='add-answer'),
]   