from django.shortcuts import redirect
from django.contrib import messages

def user_not_authenticated(function=None, redirect_url='/'):
    """
    Decorador para que comprueba que el usuario NO ha iniciado sesión, redirigiendo
    a la página principal si es necesario por defecto.
    """
    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            if request.user.is_authenticated:
                return redirect(redirect_url)
                
            return view_func(request, *args, **kwargs)

        return _wrapped_view

    if function:
        return decorator(function)

    return decorator

def section_required(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if request.user.is_authenticated and hasattr(request.user, 'studentprofile'):
            if not request.user.studentprofile.section:
                messages.error(request, "Debes pertenecer a una sección para acceder a los quizzes.")
                return redirect('perfil', request.user.username)
        return view_func(request, *args, **kwargs)
    return _wrapped_view