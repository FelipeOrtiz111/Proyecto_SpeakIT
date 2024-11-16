from django.db import models
from django.utils import timezone

# Create your models here.

DIFF_CHOICES = (
    ('easy', 'fácil'),
    ('medium', 'media'),
    ('hard', 'difícil'),
)

class Quiz(models.Model):
    name = models.CharField(max_length=120)
    topic = models.CharField(max_length=120)
    number_of_questions = models.IntegerField()
    time = models.IntegerField(help_text="duración del quiz en minutos")
    required_score_to_pass = models.IntegerField(help_text="puntaje requerido para pasar")
    difficulty = models.CharField(max_length=6, choices=DIFF_CHOICES)

    def __str__(self):
        return f"{self.name}-{self.topic}"
    
    def get_questions(self):
        return self.question_set.all()[:self.number_of_questions] # <- self.number_of_questions es temporal
    
    class Meta:
        verbose_name_plural = 'Quizes'