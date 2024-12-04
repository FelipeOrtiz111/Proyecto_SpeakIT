from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from django.contrib.auth import get_user_model
from django.urls import reverse

class SeleniumTest(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        service = Service(ChromeDriverManager().install())
        cls.selenium = webdriver.Chrome(
            service=service,
            options=chrome_options
        )
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def setUp(self):
        # Crear usuario para pruebas
        User = get_user_model()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@duocuc.cl',
            password='testpass123',
            is_active=True
        )

    def test_login_process(self):
        """Test del proceso de login completo"""
        # Ir a la página de login
        self.selenium.get(f'{self.live_server_url}{reverse("login")}')
        
        # Encontrar y llenar el formulario
        username_input = self.selenium.find_element(By.NAME, "username")
        password_input = self.selenium.find_element(By.NAME, "password")
        
        username_input.send_keys('testuser')
        password_input.send_keys('testpass123')
        
        # Enviar el formulario
        submit_button = self.selenium.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        # Verificar redirección exitosa
        WebDriverWait(self.selenium, 10).until(
            EC.url_to_be(f'{self.live_server_url}/')
        )
