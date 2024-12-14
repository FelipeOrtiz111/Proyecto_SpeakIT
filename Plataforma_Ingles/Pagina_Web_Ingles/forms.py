from django import forms
from questions.models import Quiz, Question, Answer

class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['name', 'level', 'number_of_questions', 'time', 'required_score_to_pass', 'difficulty', 'allowed_attempts', 'sections']

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['text']

class AnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = ['text', 'correct']
