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

from .forms import UserRegistrationForm, UserLoginForm, UserUpdateForm
from .decorators import user_not_authenticated
from .tokens import account_activation_token

def activate(request, uidb64, token):
    User = get_user_model()
    try:
        # Decodificar el uid desde el enlace
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception as e:
        user = None
        messages.error(request, f"Error al decodificar UID: {e}")

    # Verificar si el usuario y el token son válidos
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()

        messages.success(request, "Gracias por confirmar tu email. Ahora puedes ingresar a tu cuenta.")
        return redirect('login')
    ##else:
        ##messages.error(request, "Link de activación inválido!")

    return redirect('index')

def activateEmail(request, user, to_email):
    mail_subject = "[SpeakIT] Activa tu cuenta de usuario."
    message = render_to_string("template_activate_account.html", {
        'user': user.username,
        'domain': get_current_site(request).domain,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': account_activation_token.make_token(user),
        "protocol": 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject, message, from_email='speakit.duocuc@gmail.com', to=[to_email])
    if email.send():
        messages.success(request, f'<b>{user}</b>, por favor ve a la bandeja de entrada de tu email <b>{to_email}</b> \
                     y haz click en el link de confirmación para completar tu registro. <b>Nota:</b> Revisa tu carpeta de spam')
    else:
        messages.error(request, f'Ocurrió un problema enviando el correo de confirmación a {to_email}, Revisa si está escrito correctamente.')

@user_not_authenticated
def register(request):
    if request.method == "POST":
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active=False
            user.save()  # Guardar el usuario solo si el correo fue enviado con éxito
           
            activateEmail(request, user, form.cleaned_data.get('email'))
            return redirect('login')            

        else:
            for error in list(form.errors.values()):
                messages.error(request, error)

    else:
        form = UserRegistrationForm()

    return render(
        request=request,
        template_name = "users/register.html",
        context={"form": form}
    )


@login_required
def custom_logout(request):
    logout(request)
    messages.info(request, "Se ha cerrado la sesión.")
    return redirect("index")

@user_not_authenticated
def custom_login(request):
    if request.method == "POST":
        form = UserLoginForm(request=request, data=request.POST)
        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data["username"],
                password=form.cleaned_data["password"],
            )
            if user is not None:
                login(request, user)
                messages.success(request, f"Hola <b>{user.username}</b>! Has iniciado sesión")
                return redirect("index")

        else:
            for error in list(form.errors.values()):
                messages.error(request, f"Por favor ingresa un usario y contraseña válido.") 

    form = UserLoginForm()

    return render(
        request=request,
        template_name="users/login.html",
        context={"form": form}
        )

def perfil_view(request, username):
    if request.method == 'POST':
        pass

    user = get_user_model().objects.filter(username=username).first()
    if user:
        form = UserUpdateForm(instance=user)
        return render(request, 'users/perfil.html', context={'form': form})

    return redirect("index")