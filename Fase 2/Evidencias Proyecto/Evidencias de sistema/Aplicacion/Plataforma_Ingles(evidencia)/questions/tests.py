from django.test import TestCase
from .models import Quiz, Question, Answer

class QuizModelTests(TestCase):
    def setUp(self):
        self.quiz = Quiz.objects.create(
            name='English Grammar Quiz',
            topic='Grammar',
            number_of_questions=5,
            time=15,
            required_score_to_pass=60,
            difficulty='easy'
        )
        
    def test_quiz_creation(self):
        self.assertEqual(self.quiz.name, 'English Grammar Quiz')
        self.assertEqual(self.quiz.topic, 'Grammar')
        self.assertEqual(self.quiz.number_of_questions, 5)
        self.assertEqual(self.quiz.time, 15)
        self.assertEqual(self.quiz.required_score_to_pass, 60)
        self.assertEqual(self.quiz.difficulty, 'easy')

class QuestionModelTests(TestCase):
    def setUp(self):
        self.quiz = Quiz.objects.create(
            name='Test Quiz',
            topic='Test Topic',
            number_of_questions=1,
            time=5
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            text='What is the capital of England?'
        )
        
    def test_question_creation(self):
        self.assertEqual(self.question.quiz, self.quiz)
        self.assertEqual(self.question.text, 'What is the capital of England?')
        
    def test_create_answers(self):
        Answer.objects.create(
            question=self.question,
            text='London',
            correct=True
        )
        Answer.objects.create(
            question=self.question,
            text='Paris',
            correct=False
        )
        
        self.assertEqual(self.question.answer_set.count(), 2)
        self.assertEqual(
            self.question.answer_set.filter(correct=True).first().text,
            'London'
        )
