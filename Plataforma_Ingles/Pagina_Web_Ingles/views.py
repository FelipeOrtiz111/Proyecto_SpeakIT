from django.shortcuts import render
from results.models import Result
from .models import Quiz
from django.views.generic import ListView
from django.http import JsonResponse
from questions.models import Question, Answer
from django.contrib import messages
from django.shortcuts import redirect
from django.db.models import Avg, Max
import json
from django.utils.encoding import escapejs
from django.core.serializers.json import DjangoJSONEncoder

def index(request):
    return render(request, 'index.html')

def header_view(request):
    return render(request, 'header.html')

def quizes_view(request):
    return render(request, 'quizes.html')

def seguimiento_view(request):
    if not request.user.is_authenticated:
        messages.warning(request, 'Debes iniciar sesión para ver tu seguimiento.')
        return redirect('login')
    
    # Obtener todos los resultados del usuario
    user_results = Result.objects.filter(user=request.user).order_by('-created')
    
    # Calcular estadísticas generales
    total_quizes_completed = user_results.count()
    average_score = user_results.aggregate(Avg('score'))['score__avg'] or 0
    
    # Preparar datos para los gráficos
    quiz_data = {
        'labels': [],
        'scores': [],
        'attempts': {}
    }
    
    # Agrupar resultados por quiz
    quiz_results = {}
    for result in user_results:
        if result.quiz not in quiz_results:
            quiz_results[result.quiz] = []
            quiz_data['labels'].append(result.quiz.name)
            quiz_data['attempts'][result.quiz.name] = 0
        quiz_results[result.quiz].append(result)
        quiz_data['attempts'][result.quiz.name] += 1
        
        # Tomar el mejor puntaje para cada quiz
        if len(quiz_data['scores']) < len(quiz_data['labels']):
            quiz_data['scores'].append(result.score)
        else:
            current_index = quiz_data['labels'].index(result.quiz.name)
            quiz_data['scores'][current_index] = max(quiz_data['scores'][current_index], result.score)
    
    context = {
        'quiz_results': quiz_results,
        'total_quizes_completed': total_quizes_completed,
        'average_score': average_score,
        'quiz_data': json.dumps(quiz_data, cls=DjangoJSONEncoder)
    }
    
    return render(request, 'seguimiento.html', context)

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
    try:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            questions = []
            data = request.POST
            data_ = dict(data.lists())
            data_.pop('csrfmiddlewaretoken')

            # Debug prints
            print("Data received:", data_)
            
            for k in data_.keys():
                print('key:', k)
                question = Question.objects.get(text=k)
                questions.append(question)

            user = request.user
            quiz = Quiz.objects.get(pk=pk)

            # Obtener el número de intentos previos
            previous_attempts = Result.objects.filter(quiz=quiz, user=user).count()
            
            # Verificar si el usuario aún tiene intentos disponibles
            if previous_attempts >= quiz.allowed_attempts:
                return JsonResponse({
                    'error': 'Has alcanzado el número máximo de intentos permitidos'
                }, status=400)

            # Inicializar variables
            correct_answers = 0
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
                                correct_answers += 1
                            correct_answer = a.text if a.correct else None
                        elif a.correct:
                            correct_answer = a.text
                    results.append({str(q): {'correct_answer': correct_answer, 'answered': a_selected}})
                else:
                    results.append({str(q): 'not answered'})

            # Calcular el puntaje final
            score_ = correct_answers * multiplier

            # Crear el resultado con el número de intento
            Result.objects.create(
                quiz=quiz, 
                user=user, 
                score=score_,
                attempt_number=previous_attempts + 1
            )

            # Obtener intentos restantes
            attempts_left = quiz.allowed_attempts - (previous_attempts + 1)

            return JsonResponse({
                'passed': score_ >= quiz.required_score_to_pass,
                'score': score_,
                'results': results,
                'attempts_left': attempts_left
            })

        return JsonResponse({'text': 'works'})

    except Exception as e:
        print("Error in save_quiz_view:", str(e))
        import traceback
        print(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)
