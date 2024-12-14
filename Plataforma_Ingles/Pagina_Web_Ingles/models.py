from django.db import models
from django.utils import timezone
from users.models import Section
import random

# Create your models here.
DIFF_CHOICES = (
    ('fácil', 'Fácil'),
    ('medio', 'Medio'),
    ('difícil', 'Difícil'),
)

LEVEL_CHOICES = (
    ('básico', 'Básico'),
    ('elemental', 'Elemental'),
)

class Quiz(models.Model):
    name = models.CharField(max_length=120)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    number_of_questions = models.IntegerField()
    time = models.IntegerField(help_text="duración del quiz en minutos")
    required_score_to_pass = models.IntegerField(help_text="puntaje requerido para pasar")
    difficulty = models.CharField(max_length=10, choices=DIFF_CHOICES)
    allowed_attempts = models.IntegerField(default=3, help_text="número de intentos permitidos")
    sections = models.ManyToManyField(Section, related_name='quizzes', blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name}-{self.level}"
    
    def get_questions(self):
        questions = list(self.question_set.all())
        random.shuffle(questions)
        return questions[:self.number_of_questions]
    
    class Meta:
        verbose_name_plural = 'Quizes'