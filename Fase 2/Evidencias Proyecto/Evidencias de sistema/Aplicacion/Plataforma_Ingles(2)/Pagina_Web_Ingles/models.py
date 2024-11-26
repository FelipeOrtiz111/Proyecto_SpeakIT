from django.db import models
from django.utils import timezone
import random

# Create your models here.
DIFF_CHOICES = (
    ('easy', 'Fácil'),
    ('medium', 'Medio'),
    ('hard', 'Difícil'),
)

class Quiz(models.Model):
    name = models.CharField(max_length=120)
    topic = models.CharField(max_length=120)
    number_of_questions = models.IntegerField()
    time = models.IntegerField(help_text="duración del quiz en minutos")
    required_score_to_pass = models.IntegerField(help_text="puntaje requerido para pasar")
    difficulty = models.CharField(max_length=10, choices=DIFF_CHOICES)
    allowed_attempts = models.IntegerField(default=3, help_text="número de intentos permitidos")

    def __str__(self):
        return f"{self.name}-{self.topic}"
    
    def get_questions(self):
        questions = list(self.question_set.all())
        random.shuffle(questions)
        return questions[:self.number_of_questions]
    
    class Meta:
        verbose_name_plural = 'Quizes'