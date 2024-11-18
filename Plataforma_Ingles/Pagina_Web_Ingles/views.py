from django.shortcuts import render

from results.models import Result
from .models import Quiz
from django.views.generic import ListView
from django.http import JsonResponse
from questions.models import Question, Answer

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

# Retorna los datos de las preguntas del quiz
def quiz_data_view(request, pk):
    quiz = Quiz.objects.get(pk=pk)
    questions = []
    # Obtener preguntas y respuestas de cada pregunta
    for q in quiz.get_questions():
        answers = []
        for a in q.get_answers():
            answers.append(a.text)
        questions.append({str(q): answers})
    return JsonResponse({
        'data': questions,
        'time': quiz.time,
    })

# Guarda los resultados del quiz
def save_quiz_view(request, pk):
    # print(request.POST)
    if request.is_ajax():
        questions = []
        data = request.POST
        data_ = dict(data.lists())
        data_.pop('csrfmiddlewaretoken') # Eliminar el token de seguridad

        # Obtener objetos Question
        for k in data_.keys():
            print('key:', k)
            question = Question.objects.get(text=k)
            questions.append(question)

        user = request.user
        quiz = Quiz.objects.get(pk=pk)

        # Inicializar variables
        score = 0
        multiplier = 100 / quiz.number_of_questions
        results = []
        correct_answer = None

        # Recorrer las preguntas
        for q in questions:
            a_selected = request.POST.get(str(q.text))
            
            if a_selected != "":
                # Recorrer las respuestas de la pregunta
                question_answers = Answer.objects.filter(question=q)
                for a in question_answers:
                    if a_selected == a.text:
                        if a.correct:
                            score += 1
                            correct_answer = a.text
                        else:
                            score -= 1
                    else:
                        if a.correct:
                            correct_answer = a.text
                # Guardar el resultado de la pregunta
                results.append({str(q): {'correct_answer': correct_answer, 'answered': a_selected}})
            else:
                # Guardar el resultado también si no se seleccionó ninguna respuesta
                results.append({str(q): 'not answered'})

        # Calcular el puntaje final
        score_ = score * multiplier
        Result.objects.create(quiz=quiz, user=user, score=score_)

        # Retornar el resultado del quiz
        if score_ >= quiz.required_score_to_pass:
            return JsonResponse({'passed': True, 'score': score_, 'results': results}) # Retorna True si el usuario pasó el quiz
        else:
            return JsonResponse({'passed': False, 'score': score_, 'results': results}) # Retorna False si el usuario no pasó el quiz

    return JsonResponse({'text': 'works'})
