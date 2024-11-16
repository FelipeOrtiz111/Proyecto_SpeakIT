from django.shortcuts import render
from .models import Quiz
from django.views.generic import ListView

def index(request):
    return render(request, 'index.html', {'navbar_color': 'header-default'})

def includes(request):
    return render(request, 'header.html', {'navbar_color': 'header-green'})

def includes(request):
    return render(request, 'quizes.html', {'navbar_color': 'header-red'})

def includes(request):
    return render(request, 'seguimiento.html')

class QuizListView(ListView):
    model = Quiz
    template_name = 'index.html'

def quiz_view(request, pk):
    quiz = Quiz.objects.get(pk=pk)
    return render(request, 'quizes.html', {'obj': quiz})
