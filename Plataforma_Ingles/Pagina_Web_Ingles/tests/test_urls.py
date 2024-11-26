from django.test import TestCase
from django.urls import reverse, resolve
from django.contrib.auth import get_user_model
from Pagina_Web_Ingles.views import index, estadisticas, seguimiento

class UrlsTest(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.user = self.User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_index_url_resolves(self):
        """Test index URL resolution"""
        url = reverse('index')
        self.assertEqual(resolve(url).func, index)

    def test_estadisticas_url_resolves(self):
        """Test estadisticas URL resolution"""
        url = reverse('estadisticas')
        self.assertEqual(resolve(url).func, estadisticas)

    def test_seguimiento_url_resolves(self):
        """Test seguimiento URL resolution"""
        url = reverse('seguimiento')
        self.assertEqual(resolve(url).func, seguimiento)

    def test_protected_urls_require_login(self):
        """Test that protected URLs require authentication"""
        protected_urls = [
            reverse('estadisticas'),
            reverse('seguimiento'),
            reverse('perfil', kwargs={'username': 'testuser'})
        ]
        
        for url in protected_urls:
            response = self.client.get(url)
            self.assertEqual(response.status_code, 302)  # Redirects to login
            self.assertIn('/login/', response.url) 