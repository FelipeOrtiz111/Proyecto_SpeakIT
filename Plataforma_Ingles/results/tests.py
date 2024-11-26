from django.test import TestCase
from django.contrib.auth import get_user_model
from questions.models import Quiz
from .models import QuizResult

class QuizResultTests(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.student = self.User.objects.create_user(
            username='student',
            email='student@example.com',
            password='testpass123',
            role='STUDENT'
        )
        self.quiz = Quiz.objects.create(
            name='Test Quiz',
            topic='Test Topic',
            number_of_questions=10,
            time=30,
            required_score_to_pass=70,
            difficulty='medium'
        )
        
    def test_create_quiz_result(self):
        quiz_result = QuizResult.objects.create(
            quiz=self.quiz,
            user=self.student,
            score=85
        )
        self.assertEqual(quiz_result.quiz, self.quiz)
        self.assertEqual(quiz_result.user, self.student)
        self.assertEqual(quiz_result.score, 85)
