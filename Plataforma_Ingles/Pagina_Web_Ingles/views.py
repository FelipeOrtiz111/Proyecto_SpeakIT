from django.shortcuts import render
from results.models import Result
from .models import Quiz
from django.views.generic import ListView
from django.http import JsonResponse
from questions.models import Question, Answer
from users.models import StudentProfile, Section
from results.models import Result
from django.contrib import messages
from django.shortcuts import redirect
from django.db.models import Avg, Max
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.views.decorators.http import require_http_methods

def index(request):
    return render(request, 'index.html')

def header_view(request):
    return render(request, 'header.html')

def quizes_view(request):
    return render(request, 'quizes.html')

def estadisticas_view(request):
    if not request.user.is_authenticated:
        messages.warning(request, 'Debes iniciar sesión para ver tu seguimiento.')
        return redirect('login')
    
    # Verificar que el usuario sea estudiante o admin
    if request.user.role == 'TEACHER' and not request.user.is_staff:
        messages.warning(request, 'Esta sección es solo para estudiantes y administradores.')
        return redirect('index')
    
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
    
    return render(request, 'estadisticas.html', context)

class QuizListView(ListView):
    model = Quiz # nombre del modelo
    template_name = 'index.html'
    context_object_name = 'object_list'

def quiz_view(request, pk):
    quiz = Quiz.objects.get(pk=pk)
    # Obtener el perfil del estudiante si existe
    student_profile = None
    if hasattr(request.user, 'studentprofile'):
        student_profile = request.user.studentprofile
    
    # Obtener todas las secciones disponibles
    sections = Section.objects.all()
    
    context = {
        'obj': quiz,
        'sections': sections,
        'student_profile': student_profile
    }
    return render(request, 'quizes.html', context)

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
            
            # Verificar que el usuario tenga una sección asignada
            if not hasattr(user, 'studentprofile') or not user.studentprofile.section:
                return JsonResponse({
                    'error': 'Debes tener una sección asignada para realizar el quiz'
                }, status=400)
            
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

def seguimiento_view(request):
    if not request.user.is_authenticated:
        messages.warning(request, 'Debes iniciar sesión para ver tu seguimiento.')
        return redirect('login')
    
    # Verificar que el usuario sea profesor o admin
    if not (request.user.role == 'TEACHER' or request.user.is_staff):
        messages.warning(request, 'Esta sección es solo para profesores.')
        return redirect('index')
    
    # Si es profesor o administrador, mostrar resultados de las secciones
    if request.user.role == 'TEACHER' or request.user.is_staff:
        # Obtener las secciones
        if request.user.is_staff:
            # Para administradores, mostrar todas las secciones
            sections = Section.objects.all()
        else:
            # Para profesores, mostrar solo sus secciones
            sections = Section.objects.filter(created_by=request.user)
            
        selected_section = request.GET.get('section')
        
        if selected_section:
            # Obtener los estudiantes de la sección seleccionada
            student_profiles = StudentProfile.objects.filter(section_id=selected_section)
            students = [profile.user for profile in student_profiles]
            # Obtener resultados de esos estudiantes
            user_results = Result.objects.filter(user__in=students).order_by('-created')
        else:
            user_results = []
        
        context = {
            'user_results': user_results,
            'sections': sections,
            'selected_section': selected_section,
            'is_teacher': True,
            'is_admin': request.user.is_staff
        }
    else:
        # Para estudiantes, mostrar solo sus resultados
        user_results = Result.objects.filter(user=request.user).order_by('-created')
        context = {
            'user_results': user_results,
            'is_teacher': False,
            'is_admin': False
        }
    
    return render(request, 'seguimiento.html', context)

@require_http_methods(["POST"])
def assign_section(request):
    try:
        # Verificar que el usuario esté autenticado
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Usuario no autenticado'}, status=401)

        data = json.loads(request.body)
        section_id = data.get('section_id')
        
        if not section_id:
            return JsonResponse({'error': 'Se requiere ID de sección'}, status=400)
        
        try:
            section = Section.objects.get(id=section_id)
        except Section.DoesNotExist:
            return JsonResponse({'error': 'Sección no encontrada'}, status=404)
        
        # Obtener o crear el perfil del estudiante
        student_profile, created = StudentProfile.objects.get_or_create(
            user=request.user
        )
        
        # Actualizar la sección
        student_profile.section = section
        student_profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Sección asignada correctamente'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Datos JSON inválidos'}, status=400)
    except Exception as e:
        print(f"Error en assign_section: {str(e)}")  # Para debugging
        return JsonResponse({'error': str(e)}, status=500)
