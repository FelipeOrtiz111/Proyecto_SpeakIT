from django import forms
from questions.models import Quiz, Question, Answer

class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['Nombre', 'Nivel', 'Numero_de_preguntas', 'Tiempo', 'Puntaje_requerido', 'Dificultad', 'Intentos_permitidos']

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['Texto']

class AnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = ['Texto', 'Correcto']
