from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from users.models import CustomUser
from questions.models import Quiz

class ViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.User = get_user_model()
        
        # Crear usuario estudiante
        self.student = self.User.objects.create_user(
            username='student',
            email='student@duocuc.cl',
            password='studentpass123',
            role=CustomUser.Role.STUDENT
        )
        
        # Crear usuario profesor
        self.teacher = self.User.objects.create_user(
            username='teacher',
            email='teacher@profesor.duoc.cl',
            password='teacherpass123',
            role=CustomUser.Role.TEACHER
        )
        
        # Crear un quiz de ejemplo
        self.quiz = Quiz.objects.create(
            name='Test Quiz',
            topic='Grammar',
            number_of_questions=10,
            time=30,
            required_score_to_pass=70,
            difficulty='medium'
        )

    def test_index_view(self):
        """Test de la vista principal"""
        # Primero intentamos acceder sin autenticación
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 302)  # Debería redirigir al login
        
        # Ahora probamos con un usuario autenticado
        self.client.login(username='student', password='studentpass123')
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html')
        
        # Verificar que el quiz está en el contexto
        self.assertIn('quizes', response.context)
        self.assertIn(self.quiz, response.context['quizes'])

    def test_estadisticas_view(self):
        """Test de la vista de estadísticas"""
        # Sin autenticación
        response = self.client.get(reverse('estadisticas'))
        self.assertEqual(response.status_code, 302)

        # Con autenticación
        self.client.login(username='student', password='studentpass123')
        response = self.client.get(reverse('estadisticas'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'estadisticas.html')

    def test_seguimiento_view(self):
        """Test de la vista de seguimiento"""
        # Sin autenticación
        response = self.client.get(reverse('seguimiento'))
        self.assertEqual(response.status_code, 302)

        # Como estudiante (no debería tener acceso)
        self.client.login(username='student', password='studentpass123')
        response = self.client.get(reverse('seguimiento'))
        self.assertEqual(response.status_code, 302)  # o 403 dependiendo de tu implementación

        # Como profesor (debería tener acceso)
        self.client.login(username='teacher', password='teacherpass123')
        response = self.client.get(reverse('seguimiento'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'seguimiento.html')