from django.db import models
from Pagina_Web_Ingles.models import Quiz
from django.contrib.auth.models import User
from Plataforma_Ingles import settings
from django.utils import timezone

# Create your models here.

class Result(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()
    attempt_number = models.IntegerField(default=1)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quiz.name} - {self.user.username} - Intento {self.attempt_number}"
