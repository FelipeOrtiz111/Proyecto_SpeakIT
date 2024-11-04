from django.db import models
from django.utils import timezone
# Create your models here.
class Video(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    enlace = models.URLField()
    miniatura = models.URLField()

    def __str__(self):
        return self.titulo


