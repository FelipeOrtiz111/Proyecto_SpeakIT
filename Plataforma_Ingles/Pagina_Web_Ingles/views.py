from django.shortcuts import render
from results.models import Result
from .models import Quiz
from django.views.generic import ListView
from django.http import JsonResponse
from questions.models import Question, Answer
from users.models import StudentProfile, Section, CustomUser
from results.models import Result
from django.contrib import messages
from django.shortcuts import redirect
from django.db.models import Avg, Max
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin

def index(request):
    return render(request, 'index.html')

def header_view(request):
    return render(request, 'header.html')

@login_required
def quizes_view(request):
    return render(request, 'quizes.html')

@login_required
def estadisticas_view(request):
    """Vista de estadísticas accesible para todos los usuarios autenticados"""
    context = {}
    return render(request, 'estadisticas.html', context)

class QuizListView(LoginRequiredMixin, ListView):
    model = Quiz
    template_name = 'index.html'
    context_object_name = 'quizes'

def quiz_view(request, pk):
    # Verificar si el usuario es profesor
    if request.user.role == 'TEACHER' and not request.user.is_staff:
        messages.warning(request, 'Los profesores no pueden realizar quizes.')
        return redirect('index')
        
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

@login_required
def seguimiento_view(request):
    """Vista de seguimiento para profesores y administradores"""
    if not (request.user.role == 'TEACHER' or request.user.is_staff):
        return redirect('login')
    
    # Obtener secciones según el rol
    if request.user.is_staff:
        sections = Section.objects.all()
    else:
        sections = Section.objects.filter(created_by=request.user)
    
    # Obtener sección seleccionada
    selected_section = request.GET.get('section')
    selected_student = request.GET.get('student')
    
    # Inicializar variables
    section_students = []
    user_results = []
    dashboard_data = None
    
    if selected_section:
        # Obtener estudiantes de la sección seleccionada
        section_students = CustomUser.objects.filter(
            studentprofile__section_id=selected_section,
            role='STUDENT'
        )
        
        # Construir query para resultados
        results_query = Result.objects.select_related('user', 'quiz')
        if selected_student:
            results_query = results_query.filter(user_id=selected_student)
        else:
            results_query = results_query.filter(
                user__studentprofile__section_id=selected_section
            )
        
        user_results = results_query.order_by('-created')
        
        # Preparar datos para el dashboard
        dashboard_data = prepare_dashboard_data(user_results)
    
    context = {
        'sections': sections,
        'selected_section': selected_section,
        'section_students': section_students,
        'selected_student': selected_student,
        'user_results': user_results,
        'dashboard_data': json.dumps(dashboard_data) if dashboard_data else None,
        'is_admin': request.user.is_staff,
        'is_teacher': request.user.role == 'TEACHER'
    }
    
    return render(request, 'seguimiento.html', context)

def prepare_dashboard_data(results):
    student_progress = {}
    
    for result in results:
        username = result.user.username
        if username not in student_progress:
            student_progress[username] = {
                'scores': [],
                'average': 0
            }
        
        student_progress[username]['scores'].append(float(result.score))
        student_progress[username]['average'] = sum(student_progress[username]['scores']) / len(student_progress[username]['scores'])
    
    return {'student_progress': student_progress}

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
