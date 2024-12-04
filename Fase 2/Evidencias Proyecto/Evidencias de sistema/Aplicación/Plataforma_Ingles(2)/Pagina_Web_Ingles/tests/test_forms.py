from django.test import TestCase
from users.forms import CustomUserRegistrationForm, UserLoginForm
from django.contrib.auth import get_user_model

class UserFormsTest(TestCase):
    def setUp(self):
        self.User = get_user_model()

    def test_registration_form_valid_data(self):
        """Test del formulario de registro con datos válidos"""
        form_data = {
            'username': 'testuser',
            'email': 'test@duocuc.cl',
            'password1': 'testpass123',
            'password2': 'testpass123'
        }
        form = CustomUserRegistrationForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_registration_form_invalid_data(self):
        """Test del formulario de registro con datos inválidos"""
        form_data = {
            'username': '',  # Username vacío
            'email': 'invalid_email',  # Email inválido
            'password1': 'short',  # Contraseña muy corta
            'password2': 'different'  # Contraseñas no coinciden
        }
        form = CustomUserRegistrationForm(data=form_data)
        self.assertFalse(form.is_valid())

    def test_login_form_valid_data(self):
        """Test del formulario de login con datos válidos"""
        # Primero creamos un usuario para validar
        self.User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        form_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        form = UserLoginForm(data=form_data)
        self.assertTrue(form.is_valid())
