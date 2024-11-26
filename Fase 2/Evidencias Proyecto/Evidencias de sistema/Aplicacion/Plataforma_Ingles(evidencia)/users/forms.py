from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, SetPasswordForm, PasswordResetForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from .models import CustomUser

# Formulario de Registro de Usuario
class CustomUserRegistrationForm(UserCreationForm):
    username = forms.CharField(
        help_text='150 caracteres o menos. Letras, dígitos y solo @/./+/-/_ permitidos.',
        required=True,
        label="Nombre de usuario"
    )
    email = forms.EmailField(
        help_text='Debe ingresar su dirección de correo institucional de DuocUC.',
        required=True,
        label="Correo electrónico"
    )
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text='Tu contraseña no debe ser muy parecida a tus otros datos personales.\
            <br>Tu contraseña debe contener al menos 8 caracteres.\
            <br>Tu contraseña no debe ser muy común.\
            <br>Tu contraseña no debe ser totalmente numérica.',
        required=True,
        label="Contraseña"
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text='Vuelve a ingresar la contraseña, para verificación.',
        required=True,
        label="Confirmar Contraseña"
    )

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2']
        labels = {
            'username': 'Nombre de usuario',
            'email': 'Correo Electrónico',
            'password1': 'Contraseña',
            'password2': 'Confirmar Contraseña',
        }

    def clean_email(self):
        email = self.cleaned_data.get('email')
        dominio_permitido = ['duocuc.cl', 'profesor.duoc.cl']  # Dominios permitidos
        if not any(email.endswith(f"@{dominio}") for dominio in dominio_permitido):
            raise ValidationError(f'Debes ingresar tu correo institucional.')
        return email

    def save(self, commit=True):
        user = super(CustomUserRegistrationForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        
        if user.email.endswith('@profesor.duoc.cl'):
            user.role = CustomUser.Role.TEACHER
        elif user.email.endswith('@duocuc.cl'):
            user.role = CustomUser.Role.STUDENT
        else:
            user.role = CustomUser.Role.OTHER
        
        if commit:
            user.save()
        return user

# Formulario de Inicio de Sesión
class UserLoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre de usuario o correo Duoc'}),
        label="Usuario o Correo Institucional"
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Contraseña'}),
        label="Contraseña"
    )

# Formulario de Actualización de Usuario
class UserUpdateForm(forms.ModelForm):
    email = forms.EmailField(required=True, label="Correo Electrónico")

    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'description']
        labels = {
            'first_name': 'Nombre',
            'last_name': 'Apellido',
            'email': 'Correo Electrónico',
            'description': 'Descripción',
        }

# Formulario de Cambio de Contraseña
class CustomSetPasswordForm(SetPasswordForm):
    class Meta:
        model = CustomUser
        fields = ['new_password1', 'new_password2']
        labels = {
            'new_password1': 'Nueva Contraseña',
            'new_password2': 'Confirmar Nueva Contraseña',
        }

# Formulario de Restablecimiento de Contraseña
class CustomPasswordResetForm(PasswordResetForm):
    email = forms.EmailField(label="Correo Electrónico", required=True)