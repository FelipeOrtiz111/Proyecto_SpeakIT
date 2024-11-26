from django.test import TestCase
from django.contrib.auth import get_user_model
from users.models import CustomUser, Section, StudentProfile, TeacherProfile
from questions.models import Quiz, Question, Answer
from results.models import QuizResult

class UserModelTest(TestCase):
    def setUp(self):
        self.User = get_user_model()
        self.test_user = self.User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role=CustomUser.Role.STUDENT
        )

    def test_user_str(self):
        """Test the string representation of user"""
        self.assertEqual(str(self.test_user), 'testuser')

    def test_user_role_assignment(self):
        """Test that user roles are correctly assigned"""
        self.assertEqual(self.test_user.role, CustomUser.Role.STUDENT)

class QuizModelTest(TestCase):
    def setUp(self):
        self.quiz = Quiz.objects.create(
            name='Test Quiz',
            topic='Grammar',
            number_of_questions=10,
            time=30,
            required_score_to_pass=70,
            difficulty='medium'
        )

    def test_quiz_str(self):
        """Test the string representation of quiz"""
        self.assertEqual(str(self.quiz), 'Test Quiz')

    def test_quiz_questions_relationship(self):
        """Test quiz-question relationship"""
        question = Question.objects.create(
            quiz=self.quiz,
            text='Sample question'
        )
        self.assertEqual(self.quiz.question_set.first(), question)
