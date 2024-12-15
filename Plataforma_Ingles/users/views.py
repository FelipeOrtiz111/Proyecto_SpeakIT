from typing import Protocol
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from .models import Section, StudentProfile

from .forms import (
    CustomUserRegistrationForm,
    UserLoginForm,
    UserUpdateForm,
    SetPasswordForm,
    PasswordResetForm
)
from .decorators import user_not_authenticated
from .tokens import account_activation_token
from django.db.models.query_utils import Q
from .models import CustomUser
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import re
from django.core.exceptions import ValidationError
from django.views.decorators.http import require_http_methods

# Función para activar cuenta de usuario con el link de activación
def activate(request, uidb64, token):
    User = get_user_model()
    try:
        # Decodificar el UID desde el enlace recibido por email
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        user = None
        messages.error(request, f"Error al decodificar UID: {e}")

    # Verificar si el usuario y el token de activación son válidos
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True # Activa la cuenta del usuario
        user.save()

        messages.success(request, "Gracias por confirmar tu email. Ahora puedes ingresar a tu cuenta.")
        return redirect('login')
    else:
        messages.error(request, "Link de activación inválido!")

    return redirect('index')

def activateEmail(request, user, to_email):
    mail_subject = "[SpeakIT] Activa tu cuenta de usuario."
    # Renderiza el contenido del correo utilizando una plantilla
    message = render_to_string("template_activate_account.html", {
        'user': user.username,
        'domain': get_current_site(request).domain, # Obtiene el dominio actual
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        "protocol": 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, from_email='speakit.duocuc@gmail.com', to=[to_email])
    if email.send():
        messages.success(request, f'<b>{user}</b>, por favor ve a la bandeja de entrada de tu email <b>{to_email}</b> \
                     y haz click en el link de confirmación para completar tu registro. De lo contrario, no podrás iniciar sesión. <b>Nota:</b> Revisa tu carpeta de spam')
    else:
        messages.error(request, f'Ocurrió un problema enviando el correo de confirmación a {to_email}, Revisa si está escrito correctamente.')

# Vista para registrar un nuevo usuario
@user_not_authenticated
def register(request):
    if request.method == "POST":
        form = CustomUserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            # Generar username desde el email
            user.username = user.generate_username_from_email()
            user.save()
            
            # Validar y manejar la sección solo si es estudiante
            section_code = request.POST.get('section')
            if section_code and user.role == CustomUser.Role.STUDENT:
                # Validar formato
                if not re.match(r'^IN[UI]\d{4}\s*-\s*\d{3}[A-Z]$', section_code):
                    messages.error(request, "Formato de sección inválido. Debe ser 'INU1234-123D' o 'INI1234-123D'.")
                    user.delete()
                    return render(request, "users/register.html", {"form": form})
                
                try:
                    # Normalizar el formato de la sección
                    parts = section_code.replace(' ', '').split('-')
                    formatted_code = f"{parts[0]} - {parts[1]}"
                    
                    # Obtener o crear la sección
                    section, created = Section.objects.get_or_create(
                        code=formatted_code,
                        defaults={'is_active': True}
                    )

                    # Asignar la sección al perfil del estudiante
                    student_profile = StudentProfile.objects.get(user=user)
                    student_profile.section = section
                    student_profile.save()

                    if created:
                        messages.success(request, f"Se ha creado una nueva sección: {formatted_code}")
                    else:
                        messages.info(request, f"Te has unido a la sección: {formatted_code}")

                except ValidationError as e:
                    messages.error(request, f"Error en la sección: {e}")
                    user.delete()
                    return render(request, "users/register.html", {"form": form})
                except Exception as e:
                    messages.error(request, f"Error al procesar la sección: {str(e)}")
                    user.delete()
                    return render(request, "users/register.html", {"form": form})
            
            # Enviar email de activación e informar al usuario su nombre de usuario
            activateEmail(request, user, form.cleaned_data.get('email'))
            messages.info(request, f"Tu nombre de usuario será: {user.username}")
            return redirect('login')
        else:
            for error in list(form.errors.values()):
                messages.error(request, error)

    form = CustomUserRegistrationForm()
    return render(request, "users/register.html", {"form": form})

# Vista para cerrar sesión
@login_required
def custom_logout(request):
    logout(request)
    messages.info(request, "Se ha cerrado la sesión.")
    return redirect("index")

@login_required
def manage_sections(request):
    if request.user.role != CustomUser.Role.TEACHER:
        messages.error(request, "No tienes permiso para acceder a esta página.")
        return redirect('index')
    
    sections = Section.objects.all().prefetch_related('students__user')
    section_data = []
    
    for section in sections:
        students = section.students.all()
        quiz_results = {}
        for quiz in section.quizzes.all():
            # Aquí agregar la lógica para obtener los resultados de los quizzes por sección

            
            pass
            
        section_data.append({
            'section': section,
            'student_count': students.count(),
            'students': students,
            'quiz_results': quiz_results
        })
    
    return render(request, 'users/manage_sections.html', {
        'section_data': section_data
    })

# Vista personalizada para iniciar sesión
@user_not_authenticated
def custom_login(request):
    if request.method == "POST":
        form = UserLoginForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            try:
                # Intentar obtener el usuario
                user = CustomUser.objects.get(Q(username=username) | Q(email=username))
                # Intentar autenticar
                user = authenticate(username=user.username, password=password)
                if user is not None:
                    login(request, user)                    
                    # Guardar la sección si se proporcionó una
                    messages.success(request, f"Hola <b>{user.username}</b>! Has iniciado sesión")
                    return redirect("index")
                else:
                    messages.error(request, "Contraseña incorrecta")
            except CustomUser.DoesNotExist:
                messages.error(request, "Usuario no encontrado")
        else:
            messages.error(request, "Por favor ingrese un usuario y contraseña válidos")
    
    form = UserLoginForm()
    return render(
        request=request,
        template_name="users/login.html",
        context={"form": form}
    )

# Vista para mostrar el perfil del usuario
@login_required
def perfil_view(request, username):
    if request.method == 'POST':
        user = request.user
        form = UserUpdateForm(request.POST, instance=user)
        
        if form.is_valid():
            form.save()
            
            # Manejar la actualización de la sección
            section_code = request.POST.get('section')
            if section_code and user.role == CustomUser.Role.STUDENT:
                try:
                    # Normalizar el formato de la sección
                    section_code = section_code.strip()
                    if '-' in section_code:
                        parts = section_code.split('-')
                        formatted_code = f"{parts[0].strip()} - {parts[1].strip()}"
                    else:
                        formatted_code = section_code

                    # Obtener o crear la sección
                    section, created = Section.objects.get_or_create(
                        code=formatted_code,
                        defaults={'is_active': True}
                    )

                    # Actualizar la sección del estudiante
                    StudentProfile.objects.filter(user=user).update(section=section)
                    
                    messages.success(request, f'Sección actualizada a {formatted_code}')
                except Exception as e:
                    messages.error(request, f'Error al actualizar la sección: {str(e)}')
            
            messages.success(request, '¡Tu perfil ha sido actualizado!')
            return redirect('perfil', user.username)

    user = get_user_model().objects.filter(username=username).first()
    if user:
        form = UserUpdateForm(instance=user)
        return render(request, 'users/perfil.html', context={'form': form})
    return redirect("index")

@login_required
def password_change(request):
    user = request.user
    if request.method == 'POST':
        form = SetPasswordForm(user, request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Su contraseña ha sido modificada")
            return redirect('login')
        else:
            for error in list(form.errors.values()):
                messages.error(request, error)

    form = SetPasswordForm(user)
    return render(request, 'password_reset_confirm.html', {'form': form})

@user_not_authenticated
def password_reset_request(request):
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            user_email = form.cleaned_data['email']
            associated_user = get_user_model().objects.filter(Q(email=user_email)).first()
            if associated_user:
                subject = "Petición de restablecimiento de contraseña"
                message = render_to_string("template_reset_password.html", {
                    'user': associated_user,
                    'domain': get_current_site(request).domain,
                    'uid': urlsafe_base64_encode(force_bytes(associated_user.pk)),
                    'token': account_activation_token.make_token(associated_user),
                    "protocol": 'https' if request.is_secure() else 'http'
                })
                email = EmailMessage(subject, message, to=[associated_user.email])
                if email.send():
                    messages.success(request,
                        """
                        <h2>Restablecimiento de contraseña enviado</h2><hr>
                        <p>
                            Te hemos enviado por correo electrónico las instrucciones para establecer tu contraseña, 
                            si existe una cuenta con la dirección de correo electrónico que has introducido. 
                            Debería recibirlas en breve.<br>Si no recibe un correo electrónico, asegúrese de que ha introducido la dirección de correo electrónico 
                            con la que se registró y compruebe su carpeta de correo no deseado.
                        </p>
                        """
                    )
                else:
                    messages.error(request, "Problema al enviar el correo electrónico de restablecimiento de contraseña, <b>PROBLEMA DEL SERVIDOR</b>")
            return redirect('index')

    form = PasswordResetForm()
    return render(request=request, template_name="password_reset.html", context={"form": form})

def passwordResetConfirm(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except:
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        if request.method == 'POST':
            form = SetPasswordForm(user, request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, "Su contraseña ha sido establecida. Ya puede <b>iniciar sesión</b>.")
                return redirect('index')
            else:
                for error in list(form.errors.values()):
                    messages.error(request, error)

        form = SetPasswordForm(user)
        return render(request, 'password_reset_confirm.html', {'form': form})
    else:
        messages.error(request, "El enlace ha caducado")

    messages.error(request, 'Algo salió mal, redirigiendo de nuevo a la página de inicio')
    return redirect("index")

@require_http_methods(["POST"])
@login_required
def update_section(request):
    try:
        if request.user.role != CustomUser.Role.STUDENT:
            return JsonResponse({'error': 'Solo los estudiantes pueden cambiar de sección'}, status=403)
        
        section_code = request.POST.get('section')
        if not section_code:
            return JsonResponse({'error': 'Código de sección requerido'}, status=400)
        
        # Eliminar espacios y normalizar el formato
        section_code = section_code.replace(' ', '')
        
        # Validar formato
        if not re.match(r'^IN[UI]\d{4}-\d{3}[A-Z]$', section_code):
            return JsonResponse({'error': 'Formato de sección inválido. Debe ser del tipo INU4101-004D'}, status=400)
        
        # Formatear el código de sección
        parts = section_code.split('-')
        formatted_code = f"{parts[0]} - {parts[1]}"
        
        # Obtener o crear la sección
        section, created = Section.objects.get_or_create(
            code=formatted_code,
            defaults={'is_active': True}
        )
        
        # Obtener el perfil del estudiante y actualizar su sección
        student_profile = StudentProfile.objects.get(user=request.user)
        student_profile.section = section
        student_profile.save()
        
        message = 'Te has unido a la sección existente' if not created else 'Se ha creado y asignado la nueva sección'
        
        return JsonResponse({
            'success': True,
            'message': f'{message}: {formatted_code}',
            'section_code': formatted_code
        })
        
    except StudentProfile.DoesNotExist:
        return JsonResponse({'error': 'Perfil de estudiante no encontrado'}, status=404)
    except Exception as e:
        print(f"Error en update_section: {str(e)}")  # Para debugging
        return JsonResponse({'error': str(e)}, status=500)