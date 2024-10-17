from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

class UserRegistrationForm(UserCreationForm):
    username = forms.CharField(help_text='150 caracteres o menos. Letras, digitos y solo @/,/+/-/_.', required=True, label="Nombre de usuario")
    email = forms.EmailField(help_text='Debe ingresar su dirrección de correo institucional de DuocUC.', required=True, label="Correo electrónico")
    password1 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text='Tu contraseña no debe ser muy parecida a tus otros datos personales.\
            <br>Tu contraseña debe contener al menos 8 caracteres.\
            <br>Tu contraseña no debe ser muy común.\
            <br>Tu contraseña no debe ser totalmente numérica.', required=True, label="Contraseña")
    
    password2 = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text='Vuelve a ingresar la contraseña, para verificación.', required=True, label="Confirmar Contraseña")    

    class Meta:
        model = get_user_model()
        fields = ['username', 'email', 'password1', 'password2']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        dominio_permitido = ['duocuc.cl', 'profesor.duoc.cl']  # Dominios duoc
        if not any(email.endswith(f"@{dominio}") for dominio in dominio_permitido):
            raise ValidationError(f'Debes ingresar tu correo institucional.')
        return email

    def save(self, commit=True):
        user = super(UserRegistrationForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user


class UserLoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(UserLoginForm, self).__init__(*args, **kwargs)

    username = forms.CharField(widget=forms.TextInput(
        attrs={'class': 'form-control', 'placeholder': 'Nombre de usuario o correo Duoc'}),
        label="Usuario o Correo Institucional")

    password = forms.CharField(widget=forms.PasswordInput(
        attrs={'class': 'form-control', 'placeholder': 'Contraseña'}),
        label="Contraseña")
