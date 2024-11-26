from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from django.contrib.auth import get_user_model
from selenium.webdriver.chrome.options import Options

class SeleniumTest(StaticLiveServerTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Run in headless mode
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        cls.selenium = webdriver.Chrome(options=chrome_options)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_login_form(self):
        """Test login form functionality"""
        self.selenium.get(f'{self.live_server_url}/login/')
        
        username_input = self.selenium.find_element(By.NAME, "username")
        password_input = self.selenium.find_element(By.NAME, "password")
        submit_button = self.selenium.find_element(By.CSS_SELECTOR, "button[type='submit']")

        username_input.send_keys('testuser')
        password_input.send_keys('testpass123')
        submit_button.click()

        # Wait for redirect to complete
        WebDriverWait(self.selenium, 10).until(
            EC.url_to_be(f'{self.live_server_url}/')
        )

    def test_quiz_interaction(self):
        """Test quiz interaction functionality"""
        # Login first
        self.client.login(username='testuser', password='testpass123')
        cookie = self.client.cookies['sessionid']
        
        # Add cookie to selenium browser
        self.selenium.get(f'{self.live_server_url}/')
        self.selenium.add_cookie({
            'name': 'sessionid',
            'value': cookie.value,
            'secure': False,
            'path': '/'
        })

        # Navigate to quiz page
        self.selenium.get(f'{self.live_server_url}/quiz/1/')
        
        # Test radio button selection
        radio_buttons = self.selenium.find_elements(By.CSS_SELECTOR, "input[type='radio']")
        if radio_buttons:
            radio_buttons[0].click()
            self.assertTrue(radio_buttons[0].is_selected())
