from django import forms
from questions.models import Quiz, Question, Answer

class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['nombre', 'nivel', 'numero_de_preguntas', 'tiempo', 'puntuacion_requerida', 'dificultad', 'intentos_permitidos']

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['texto']

class AnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = ['texto', 'correcto']
