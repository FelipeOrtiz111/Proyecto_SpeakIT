from django.db import models
from Pagina_Web_Ingles.models import Quiz
from django.contrib.auth.models import User
from Plataforma_Ingles import settings

# Create your models here.

class Result(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.FloatField()

    def __str__(self):
        return str(self.pk)
