from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from questions.models import Quiz

class ViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.quiz = Quiz.objects.create(
            name='Test Quiz',
            topic='Grammar',
            number_of_questions=10,
            time=30
        )

    def test_index_view(self):
        """Test index page loads correctly"""
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html')

    def test_login_required_views(self):
        """Test views that require login"""
        response = self.client.get(reverse('estadisticas'))
        self.assertEqual(response.status_code, 302)  # Redirects to login

    def test_authenticated_access(self):
        """Test access to protected views when authenticated"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('estadisticas'))
        self.assertEqual(response.status_code, 200)

    def test_teacher_only_view(self):
        """Test views restricted to teachers"""
        teacher = self.User.objects.create_user(
            username='teacher',
            password='teacherpass123',
            role='TEACHER'
        )
        self.client.login(username='teacher', password='teacherpass123')
        response = self.client.get(reverse('seguimiento'))
        self.assertEqual(response.status_code, 200)
