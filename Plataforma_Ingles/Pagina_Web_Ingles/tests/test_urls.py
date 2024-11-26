from django.test import TestCase
from django.urls import reverse, resolve
from django.contrib.auth import get_user_model
from Pagina_Web_Ingles.views import (
    QuizListView,  # vista del index
    estadisticas_view,  # nombre correcto de la vista
    seguimiento_view  # nombre correcto de la vista
)
from users.models import CustomUser

class UrlsTest(TestCase):
    def setUp(self):
        self.User = get_user_model()
        # Crear usuario estudiante
        self.student = self.User.objects.create_user(
            username='student',
            email='student@duocuc.cl',  # Email único para estudiante
            password='studentpass123',
            role=CustomUser.Role.STUDENT
        )
        # Crear usuario profesor
        self.teacher = self.User.objects.create_user(
            username='teacher',
            email='teacher@profesor.duoc.cl',  # Email único para profesor
            password='teacherpass123',
            role=CustomUser.Role.TEACHER
        )

    def test_index_url_resolves(self):
        """Test index URL resolution"""
        url = reverse('index')
        self.assertEqual(resolve(url).func.view_class, QuizListView)

    def test_estadisticas_url_resolves(self):
        """Test estadisticas URL resolution"""
        url = reverse('estadisticas')
        self.assertEqual(resolve(url).func, estadisticas_view)

    def test_seguimiento_url_resolves(self):
        """Test seguimiento URL resolution"""
        url = reverse('seguimiento')
        self.assertEqual(resolve(url).func, seguimiento_view)

    def test_protected_urls_require_login(self):
        """Test that protected URLs require authentication"""
        # Asegurarnos de que el usuario no está autenticado
        self.client.logout()
        
        # URLs que cualquier usuario autenticado puede acceder
        student_urls = {
            'estadisticas': reverse('estadisticas'),
            'perfil': reverse('perfil', kwargs={'username': 'student'})
        }
        
        # URLs que solo los profesores pueden acceder
        teacher_urls = {
            'seguimiento': reverse('seguimiento')
        }
        
        # Probar acceso sin autenticación
        all_urls = {**student_urls, **teacher_urls}
        for name, url in all_urls.items():
            response = self.client.get(url, follow=False)
            self.assertEqual(
                response.status_code, 
                302, 
                f"URL '{name}' ({url}) should require login but doesn't"
            )
            self.assertTrue(
                response.url.startswith('/login'),
                f"URL '{name}' ({url}) should redirect to login but redirects to {response.url}"
            )

        # Probar acceso como estudiante
        self.client.login(username='student', password='studentpass123')
        for name, url in student_urls.items():
            response = self.client.get(url)
            self.assertEqual(
                response.status_code,
                200,
                f"URL '{name}' ({url}) should be accessible for student"
            )
        
        # Verificar que el estudiante no puede acceder a las URLs de profesor
        for name, url in teacher_urls.items():
            response = self.client.get(url)
            self.assertEqual(
                response.status_code,
                302,  # o 403 dependiendo de tu implementación
                f"URL '{name}' ({url}) should not be accessible for student"
            )

        # Probar acceso como profesor
        self.client.logout()
        self.client.login(username='teacher', password='teacherpass123')
        
        # El profesor debería poder acceder a todas las URLs
        for name, url in student_urls.items():
            response = self.client.get(url)
            self.assertEqual(
                response.status_code,
                200,
                f"URL '{name}' ({url}) should be accessible for teacher"
            )
        
        for name, url in teacher_urls.items():
            response = self.client.get(url)
            self.assertEqual(
                response.status_code,
                200,
                f"URL '{name}' ({url}) should be accessible for teacher"
            )