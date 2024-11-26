from django.test import TestCase
from django.contrib.auth import get_user_model
from users.forms import UserRegisterForm, UserUpdateForm
from questions.forms import QuizForm

class UserFormsTest(TestCase):
    def test_user_register_form_valid_data(self):
        """Test user registration form with valid data"""
        form = UserRegisterForm(data={
            'username': 'testuser',
            'email': 'test@example.com',
            'password1': 'testpass123',
            'password2': 'testpass123',
            'role': 'STUDENT'
        })
        self.assertTrue(form.is_valid())

    def test_user_register_form_invalid_data(self):
        """Test user registration form with invalid data"""
        form = UserRegisterForm(data={})
        self.assertFalse(form.is_valid())
        self.assertEqual(len(form.errors), 5)

class QuizFormsTest(TestCase):
    def test_quiz_form_valid_data(self):
        """Test quiz creation form with valid data"""
        form = QuizForm(data={
            'name': 'Test Quiz',
            'topic': 'Grammar',
            'number_of_questions': 10,
            'time': 30,
            'required_score_to_pass': 70,
            'difficulty': 'medium'
        })
        self.assertTrue(form.is_valid())
