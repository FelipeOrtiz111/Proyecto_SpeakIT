from django.shortcuts import render
from .models import Quiz
from django.views.generic import ListView

def index(request):
    return render(request, 'index.html')

def header_view(request):
    return render(request, 'header.html')

def quizes_view(request):
    return render(request, 'quizes.html')

def seguimiento_view(request):
    return render(request, 'seguimiento.html')

class QuizListView(ListView):
    model = Quiz # nombre del modelo
    template_name = 'index.html'
    context_object_name = 'object_list'

def quiz_view(request, pk):
    quiz = Quiz.objects.get(pk=pk)
    return render(request, 'quizes.html', {'obj': quiz})
